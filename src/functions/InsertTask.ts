import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { tasksContainer } from "../lib/cosmosClient";
import { v4 as uuidv4 } from "uuid";

export async function InsertTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const organizationId = request.query.get("organizationId");

  if (!organizationId) {
    return {
      status: 400,
      jsonBody: { error: "Organization ID is required in query parameters." },
    };
  }

  try {
    const body = (await request.json()) as {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: string;
      tags?: string[];
      customFields?: object;
    };

    if (!body || !body.title || typeof body.title !== "string") {
      return {
        status: 400,
        jsonBody: {
          error: "A non-empty 'title' is required in the request body.",
        },
      };
    }

    const newTask = {
      id: uuidv4(),
      organizationId,
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate || null,
      priority: body.priority || "medium",
      status: "todo",
      tags: body.tags || [],
      customFields: body.customFields || {},
    };

    const { resource: createdTask } = await tasksContainer.items.create(
      newTask
    );

    return { jsonBody: createdTask, status: 201 };
  } catch (error) {
    context.error("Error inserting task:", error);
    return {
      status: 500,
      jsonBody: { error: "An internal server error occurred." },
    };
  }
}

app.http("InsertTask", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: InsertTask,
});
