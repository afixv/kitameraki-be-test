import { CosmosClient } from "@azure/cosmos";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";


export async function UpdateTask(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const body = await request.json() as object;
    const taskId = request.query.get('id');
    const organizationId = request.query.get('organizationId');

    let patchRequests = [];

    for (let key in body) {
        patchRequests.push({
            "op": "replace",
            "path": `/${key}`,
            "value": body[key]
        });
    }

    const client = new CosmosClient("this is a connection string");
    const createdTask = await client.database("TaskApp")
        .container("Tasks")
        .item(taskId, organizationId)
        .patch(patchRequests);

    return { jsonBody: createdTask.resource, status: 200 };
};

app.http('UpdateTask', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: UpdateTask
});
