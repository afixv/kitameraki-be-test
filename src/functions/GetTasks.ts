import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { tasksContainer } from "../lib/cosmosClient";
import { SqlQuerySpec } from "@azure/cosmos";

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const organizationId = request.query.get("organizationId");
    const status = request.query.get("status") || "all";
    const priority = request.query.get("priority") || "all";
    const searchTerm = request.query.get("searchTerm") || "";
    const page = parseInt(request.query.get("page") || "1", 10);
    const pageSize = parseInt(request.query.get("pageSize") || "6", 10);

    if (!organizationId) {
      return {
        status: 400,
        jsonBody: { error: "'organizationId' is required." },
      };
    }

    let conditions = ["c.organizationId = @orgId"];
    const parameters: { name: string; value: any }[] = [
      { name: "@orgId", value: organizationId },
    ];

    if (status !== "all") {
      conditions.push("c.status = @status");
      parameters.push({ name: "@status", value: status });
    }
    if (priority !== "all") {
      conditions.push("c.priority = @priority");
      parameters.push({ name: "@priority", value: priority });
    }
    if (searchTerm) {
      conditions.push(
        "(CONTAINS(c.title, @searchTerm, true) OR CONTAINS(c.description, @searchTerm, true))"
      );
      parameters.push({ name: "@searchTerm", value: searchTerm });
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countQuery: SqlQuerySpec = {
      query: `SELECT VALUE COUNT(1) FROM c ${whereClause}`,
      parameters,
    };

    const offset = (page - 1) * pageSize;
    const dataQuery: SqlQuerySpec = {
      query: `SELECT * FROM c ${whereClause} ORDER BY c._ts DESC OFFSET @offset LIMIT @limit`,
      parameters: [
        ...parameters,
        { name: "@offset", value: offset },
        { name: "@limit", value: pageSize },
      ],
    };

    context.log("Executing data query:", dataQuery.query);
    context.log("Executing count query:", countQuery.query);

    const [{ resources: totalResult }, { resources: tasks }] =
      await Promise.all([
        tasksContainer.items.query(countQuery).fetchAll(),
        tasksContainer.items.query(dataQuery).fetchAll(),
      ]);

    const total = totalResult[0] || 0;

    return {
      jsonBody: {
        data: tasks,
        total: total,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      status: 200,
    };
  } catch (error) {
    context.error("Error fetching tasks:", error);
    return {
      status: 500,
      jsonBody: { error: "An internal server error occurred." },
    };
  }
}

app.http("GetTasks", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetTasks,
});
