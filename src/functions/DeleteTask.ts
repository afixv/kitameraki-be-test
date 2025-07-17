import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { tasksContainer } from "../lib/cosmosClient";

export async function DeleteTask(
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
    await tasksContainer.item(taskId, organizationId).delete();
    return { status: 204 };
  } catch (error) {
    if (error.code === 404) {
      return { status: 404, jsonBody: { error: "Task not found." } };
    }
    context.error("Error deleting task:", error);
    return {
      status: 500,
      jsonBody: { error: "An internal server error occurred." },
    };
  }
}

app.http("DeleteTask", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: DeleteTask,
});
