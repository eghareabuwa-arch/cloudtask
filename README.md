# CloudTask – Azure Capstone Project

CloudTask is a cloud-based task management REST API built with Node.js and Express and deployed on Microsoft Azure. The application allows users to create, view, update, delete, and manage tasks. It also supports file attachment upload for tasks using Azure Blob Storage.

This project was developed as part of the MEQuest Cloud Computing with Azure Capstone Project. It demonstrates practical use of Azure App Service, Azure SQL Database, Azure Blob Storage, Azure Key Vault, Managed Identity, GitHub Actions CI/CD, Azure Monitor, Log Analytics, and cost management.

---

## Live Application Links

Live Azure App:
https://cloudtask-abuwa2026.azurewebsites.net

Health Check Endpoint:
https://cloudtask-abuwa2026.azurewebsites.net/api/health

Tasks Endpoint:
https://cloudtask-abuwa2026.azurewebsites.net/api/tasks

GitHub Repository:
https://github.com/eghareabuwa-arch/cloudtask

---

## Project Objective

The purpose of this project is to build and deploy a production-ready task management API on Azure. The API is designed to support task creation, task assignment, progress tracking, and file attachment upload.

The project applies important cloud engineering concepts such as secure deployment, managed identity, secret management, database integration, storage integration, monitoring, logging, alerting, and automated deployment.

---

## Azure Services Used

The following Azure services were used in this project:

| Azure Service           | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| Azure App Service       | Hosts the Node.js and Express API                            |
| Azure SQL Database      | Stores task and attachment records                           |
| Azure Blob Storage      | Stores uploaded task attachment files                        |
| Azure Key Vault         | Stores sensitive configuration such as SQL connection string |
| Managed Identity        | Allows secure access from App Service to Azure services      |
| Log Analytics Workspace | Collects and stores diagnostic logs                          |
| Azure Monitor           | Tracks metrics, logs, and alert rules                        |
| Azure Monitor Alerts    | Sends alert when server errors occur                         |
| Cost Management Budget  | Tracks and controls Azure spending                           |
| GitHub Actions          | Automates build and deployment to Azure App Service          |

---

## Application Features

CloudTask supports the following features:

- Create new tasks
- View all tasks
- View a single task by ID
- Update task title, description, assignee, priority, and status
- Delete tasks
- Upload file attachments to a task
- List uploaded attachments for a task
- Check application health, database connection, and storage connection

---

## API Endpoints

| Method | Endpoint                     | Description                                          |
| ------ | ---------------------------- | ---------------------------------------------------- |
| GET    | `/`                          | Displays CloudTask API welcome message               |
| GET    | `/api/health`                | Checks API, Azure SQL, and Blob Storage connectivity |
| GET    | `/api/tasks`                 | Lists all tasks                                      |
| POST   | `/api/tasks`                 | Creates a new task                                   |
| GET    | `/api/tasks/:id`             | Gets a single task by ID                             |
| PUT    | `/api/tasks/:id`             | Updates an existing task                             |
| DELETE | `/api/tasks/:id`             | Deletes a task                                       |
| POST   | `/api/tasks/:id/attachments` | Uploads a file attachment to a task                  |
| GET    | `/api/tasks/:id/attachments` | Lists all attachments for a task                     |

---

## Example API Requests

### Health Check

```bash
curl https://cloudtask-abuwa2026.azurewebsites.net/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "db": "connected",
  "storage": "connected"
}
```

---

### Get All Tasks

```bash
curl https://cloudtask-abuwa2026.azurewebsites.net/api/tasks
```

---

### Create a Task

```bash
curl -X POST https://cloudtask-abuwa2026.azurewebsites.net/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Live Azure deployment test","description":"This task was created on the deployed Azure App Service API","assignee":"Abuwa","priority":"High"}'
```

---

### Update a Task

```bash
curl -X PUT https://cloudtask-abuwa2026.azurewebsites.net/api/tasks/5 \
  -H "Content-Type: application/json" \
  -d '{"title":"Azure SQL test task updated","description":"This task was updated through the Azure-connected API","assignee":"Abuwa","priority":"Medium","status":"Done"}'
```

---

### Upload an Attachment

```bash
curl -X POST https://cloudtask-abuwa2026.azurewebsites.net/api/tasks/5/attachments \
  -F "file=@/path/to/file.jpg"
```

---

### List Attachments

```bash
curl https://cloudtask-abuwa2026.azurewebsites.net/api/tasks/5/attachments
```

---

## Database Design

The application uses Azure SQL Database with two main tables:

### Tasks Table

Stores task details such as title, description, assignee, priority, status, and creation date.

### Attachments Table

Stores uploaded file metadata such as task ID, file name, blob name, file size, and upload time.

---

## Security Implementation

Security was implemented using the following methods:

- Sensitive configuration was not stored directly in source code.
- Azure Key Vault was used to store the SQL connection string.
- Managed Identity was enabled on the Azure App Service.
- Role-Based Access Control was used to grant permission to Key Vault and Blob Storage.
- `.env` was excluded from GitHub using `.gitignore`.
- `node_modules/` was excluded from GitHub using `.gitignore`.
- Azure Blob Storage access was controlled using Azure permissions.

---

## CI/CD with GitHub Actions

GitHub Actions was configured to automate deployment to Azure App Service. When code is pushed to the `main` branch, the workflow performs the following actions:

1. Checks out the source code
2. Sets up Node.js
3. Installs dependencies
4. Runs tests if available
5. Deploys the application to Azure App Service

The workflow file is located at:

```text
.github/workflows/deploy.yml
```

GitHub Actions deployment was tested successfully and confirmed from the GitHub Actions tab.

---

## Monitoring and Logging

Monitoring was configured using Azure Monitor and Log Analytics.

The monitoring setup includes:

- App Service metrics
- Request count monitoring
- Diagnostic settings
- HTTP logs
- App Service console logs
- App Service application logs
- Log Analytics workspace
- Azure Monitor alert rule for HTTP server errors

The Log Analytics workspace used for this project is:

```text
law-cloudtask
```

An alert rule was also created:

```text
cloudtask-http-5xx-alert
```

This alert is designed to detect HTTP server errors from the CloudTask App Service.

---

## Cost Management

A budget alert was configured using Azure Cost Management to monitor spending for the project. This helps prevent unexpected Azure charges and supports the cost optimization requirement of the capstone project.

---

## Evidence Captured

The following evidence was captured for submission:

- Azure subscription confirmation
- Resource group creation
- VNet and subnet setup
- Key Vault setup
- Azure SQL Database creation
- SQL tables and sample data
- Storage account and Blob container
- App Service deployment
- Managed Identity and RBAC configuration
- Local API testing
- Live Azure API testing
- File upload to Azure Blob Storage
- GitHub repository
- GitHub Actions CI/CD success
- Azure Monitor metrics
- Diagnostic settings
- Log Analytics query results
- Alert rule setup
- Budget alert setup

---

## Technologies Used

- Node.js
- Express.js
- Azure App Service
- Azure SQL Database
- Azure Blob Storage
- Azure Key Vault
- Azure Managed Identity
- Azure Monitor
- Log Analytics
- GitHub Actions
- Azure CLI
- VS Code
- cURL

---

## Project Status

CloudTask has been successfully developed, deployed, monitored, and tested on Microsoft Azure.

The live API is available at:

```text
https://cloudtask-abuwa2026.azurewebsites.net
```

The health endpoint confirms that the application is connected to Azure SQL Database and Azure Blob Storage.
