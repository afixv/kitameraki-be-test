import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { tasksContainer } from "../lib/cosmosClient";

export async function GetTask(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const taskId = request.query.get('id');
    const organizationId = request.query.get('organizationId');

    if (!taskId || !organizationId) {
        return { status: 400, jsonBody: { error: "Both 'id' and 'organizationId' are required." } };
    }

    try {
        const { resource: task } = await tasksContainer.item(taskId, organizationId).read();
        return { jsonBody: task, status: 200 };

    } catch (error) {
        if (error.code === 404) {
            return { status: 404, jsonBody: { error: "Task not found." } };
        }
        
        context.error("Error reading task:", error);
        return { status: 500, jsonBody: { error: "An internal server error occurred." } };
    }
}

app.http('GetTask', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetTask
});