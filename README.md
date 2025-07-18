# Task Management API - Backend

This is the project backend for the Task Management application, built using **Azure Functions** and **TypeScript**. It provides a powerful, multi-tenant API for a highly customizable task management system, using **Azure Cosmos DB** as its database.

This project is composed of two core services:
1.  A robust **Task Management API** for all standard CRUD operations on tasks.
2.  A **Dynamic Form Builder API** that allows users to define custom form layouts, which are then used to create and display tasks.

The project has been architected with a focus on security, readability, and maintainability.

## ✨ Features

-   **Serverless Architecture:** Built on Azure Functions for automatic scaling and cost-effective performance.
-   **Full CRUD for Tasks:** Comprehensive operations for creating, reading, updating, and deleting tasks.
-   **Dynamic Form Customization:**
    -   Endpoints to store and retrieve complex, multi-column form layouts.
    -   Allows the frontend to build a drag-and-drop form editor.
-   **Custom Data Storage:** Tasks can store data for any custom fields defined in the form layout.
-   **Multi-Tenancy Support:** All data (Tasks and Form Settings) is partitioned by `organizationId`, ensuring strict data isolation.
-   **Secure by Design:** No hardcoded secrets. Configuration is loaded from environment variables (`local.settings.json` for local development).
-   **Maintainable Code:** Utilizes a centralized database client (DRY principle) and robust error handling for clear and predictable API responses.

## 🛠️ Technology Stack

-   **Runtime:** Node.js v18+
-   **Framework:** Azure Functions v4
-   **Language:** TypeScript 5.x
-   **Database:** Azure Cosmos DB (for NoSQL)
-   **Dependencies Utama:**
    -   `@azure/functions`: Core SDK for Azure Functions.
    -   `@azure/cosmos`: Official client for Azure Cosmos DB.
    -   `uuid`: For generating unique, secure IDs.

## 🚀 Getting Started Locally

Follow these steps to run the project on your local machine for development.

### 1. Prerequisites

-   [**Node.js**](https://nodejs.org/) (version 18.x or higher).
-   [**Azure Functions Core Tools**](https://github.com/Azure/azure-functions-core-tools) (v4). Install globally via npm:
    ```bash
    npm install -g azure-functions-core-tools@4 --unsafe-perm true
    ```
-   [**An Azure Account**](https://azure.microsoft.com/free/) with an active subscription.
-   An **Azure Cosmos DB** instance (see step 3b).

### 2. Clone the Repository

```bash
git clone https://github.com/afixv/kitameraki-be-test/
cd kitameraki-be-test
```

### 3. Installation and Configuration

**a. Install Dependencies**
```bash
npm install
```

**b. Setup Azure Cosmos DB**
This project requires **two** separate containers within the same database.

1.  In the Azure Portal, create an **Azure Cosmos DB for NoSQL** resource. Choose the **Serverless** capacity mode for development.
2.  Once created, go to **Data Explorer**.
3.  Create a new database with the ID: `TaskApp`.
4.  **Create the `Tasks` Container:**
    -   Container ID: `Tasks`
    -   Partition key: `/organizationId`
5.  **Create the `FormSettings` Container:**
    -   Container ID: `FormSettings`
    -   Partition key: `/organizationId`

    *Note: Correctly setting the partition key for both containers is **critical** for the API to function.*

**c. Configure Local Connection**
1.  In the Azure Portal, navigate to your Cosmos DB resource and copy the **PRIMARY CONNECTION STRING** from the **"Keys"** section.
2.  In the root of your local project, create a file named `local.settings.json`.
3.  Paste the following content into the file, replacing the placeholder with your connection string.

    ```json
    {
      "IsEncrypted": false,
      "Values": {
        "AzureWebJobsStorage": "",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AccountEndpoint=https://your-db.documents.azure.com:443/;AccountKey=yourPrimaryKey==;"
      }
    }
    ```
    *This file is included in `.gitignore` to prevent committing secrets to source control.*
    
**d. Alternate: Use Provided Database for Testing**    
If you prefer not to create your own Azure Cosmos DB, you can use a pre-configured connection string for development or testing purposes. Please refer to the details I’ve included in the email attachment.

### 4. Running the Application

After completing the configuration, start the local development server:
```bash
npm start
```
The terminal will display a list of all available HTTP endpoints, typically running on `http://localhost:7071`. The backend is now ready to accept requests from the frontend or an API client like Postman.

## 📖 API Endpoint Documentation

### Form Settings Endpoints

| Endpoint | Method | Description | Query Parameters | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/GetFormSettings` | `GET` | Retrieves the form layout for an organization. Returns a default empty layout if none exists. | `organizationId` | (empty) |
| `/api/UpdateFormSettings`| `PUT`, `POST` | Creates or updates the form layout for an organization. | `organizationId` | `{ "id": "...", "layout": [...] }` |

### Task Endpoints

| Endpoint | Method | Description | Query Parameters | Request Body (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/InsertTask` | `POST` | Creates a new task, including any custom field data. | `organizationId` | `{ "title": "...", ..., "customFields": { "field_id_1": "value1" } }` |
| `/api/GetTasks` | `GET` | Gets a paginated and filterable list of tasks. | `organizationId`, `status`, `priority`, `searchTerm`, `page`, `pageSize` | (empty) |
| `/api/GetTask` | `GET` | Gets the details of a single task. | `id`, `organizationId` | (empty) |
| `/api/UpdateTask` | `PATCH`, `POST` | Updates a task's standard and/or custom fields. | `id`, `organizationId` | `{ "status": "completed", "customFields": { "field_id_1": "new_value" } }` |
| `/api/DeleteTask` | `DELETE` | Deletes a single task. | `id`, `organizationId` | (empty) |
| `/api/BulkDeleteTasks`| `DELETE` | Deletes multiple tasks at once. | `organizationId` | `[ "id1", "id2" ]` |
