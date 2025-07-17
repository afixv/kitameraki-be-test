import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { tasksContainer } from "../lib/cosmosClient";

export async function BulkDeleteTasks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const organizationId = request.query.get("organizationId");

  if (!organizationId) {
    return {
      status: 400,
      jsonBody: { error: "'organizationId' is required." },
    };
  }

  try {
    const taskIdsToDelete = (await request.json()) as string[];

    if (!Array.isArray(taskIdsToDelete) || taskIdsToDelete.length === 0) {
      return {
        status: 400,
        jsonBody: {
          error: "Request body must be a non-empty array of task IDs.",
        },
      };
    }

    const deletePromises = taskIdsToDelete.map((id) =>
      tasksContainer.item(id, organizationId).delete()
    );

    await Promise.all(deletePromises);

    return { status: 204 };
  } catch (error) {
    context.error("Error in bulk delete:", error);
    return {
      status: 500,
      jsonBody: {
        error:
          "An error occurred during bulk deletion. Some tasks may not have been deleted.",
      },
    };
  }
}

app.http("BulkDeleteTasks", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: BulkDeleteTasks,
});
