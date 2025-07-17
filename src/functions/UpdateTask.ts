import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { tasksContainer } from "../lib/cosmosClient";
import { PatchOperation } from "@azure/cosmos";

export async function UpdateTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const taskId = request.query.get("id");
  const organizationId = request.query.get("organizationId");

  if (!taskId || !organizationId) {
    return {
      status: 400,
      jsonBody: { error: "Both 'id' and 'organizationId' are required." },
    };
  }

  try {
    const body = await request.json();
    const patchOperations: PatchOperation[] = [];

    const updatableFields = [
      "title",
      "description",
      "dueDate",
      "priority",
      "status",
      "tags",
    ];

    for (const field of updatableFields) {
      if (body.hasOwnProperty(field)) {
        patchOperations.push({
          op: "replace",
          path: `/${field}`,
          value: body[field],
        });
      }
    }

    if (patchOperations.length === 0) {
      return {
        status: 400,
        jsonBody: { error: "No valid fields provided to update." },
      };
    }

    const { resource: updatedTask } = await tasksContainer
      .item(taskId, organizationId)
      .patch(patchOperations);
    return { jsonBody: updatedTask, status: 200 };
  } catch (error) {
    if (error.code === 404) {
      return { status: 404, jsonBody: { error: "Task not found." } };
    }
    context.error("Error updating task:", error);
    return {
      status: 500,
      jsonBody: { error: "An internal server error occurred." },
    };
  }
}

app.http("UpdateTask", {
  methods: ["PATCH", "POST"],
  authLevel: "anonymous",
  handler: UpdateTask,
});
