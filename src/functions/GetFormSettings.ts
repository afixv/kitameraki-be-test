import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { formSettingsContainer } from "../lib/cosmosClient";

export async function GetFormSettings(
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
    const querySpec = {
      query: "SELECT * FROM c WHERE c.organizationId = @orgId OFFSET 0 LIMIT 1",
      parameters: [{ name: "@orgId", value: organizationId }],
    };
    const { resources } = await formSettingsContainer.items
      .query(querySpec)
      .fetchAll();

    const settings = resources[0] || {
      organizationId,
      layout: [],
    };

    return { jsonBody: settings, status: 200 };
  } catch (error) {
    context.error("Error fetching form settings:", error);
    return {
      status: 500,
      jsonBody: { error: "An internal server error occurred." },
    };
  }
}

app.http("GetFormSettings", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetFormSettings,
});
