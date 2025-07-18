import { CosmosClient } from "@azure/cosmos";

const connectionString = process.env.CosmosDbConnectionString;

if (!connectionString) {
    throw new Error("CosmosDB Connection String is not defined in environment variables.");
}

const client = new CosmosClient(connectionString);

const database = client.database("TaskApp");
export const tasksContainer = database.container("Tasks");

export const formSettingsContainer = database.container("FormSettings");

export default client;