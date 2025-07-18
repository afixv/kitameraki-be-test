import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { formSettingsContainer } from "../lib/cosmosClient";
    
export async function UpdateFormSettings(
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
    const body = (await request.json()) as { layout: any[]; id?: string };

    if (!body || !Array.isArray(body.layout)) {
      return {
        status: 400,
        jsonBody: { error: "Request body must contain a 'layout' array." },
      };
    }

    const settingToUpsert = {
      id: body.id || `setting_${organizationId}`,
      organizationId: organizationId,
      layout: body.layout,
    };

    const { resource: updatedSettings } =
      await formSettingsContainer.items.upsert(settingToUpsert);
    return { jsonBody: updatedSettings, status: 200 };
  } catch (error) {
    context.error("Error updating form settings:", error);
    return {
      status: 500,
      jsonBody: { error: "An internal server error occurred." },
    };
  }
}

app.http("UpdateFormSettings", {
  methods: ["POST", "PUT"],
  authLevel: "anonymous",
  handler: UpdateFormSettings,
});
