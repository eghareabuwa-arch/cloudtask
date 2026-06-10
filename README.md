# CloudTask

CloudTask is a Node.js and Express REST API for managing tasks and file attachments. The application will be deployed on Microsoft Azure using Azure App Service, Azure SQL Database, Azure Blob Storage, Azure Key Vault, Managed Identity, Azure Monitor, and GitHub Actions CI/CD.

## Project Features

- Create tasks
- View all tasks
- View a single task
- Update tasks
- Delete tasks
- Upload task attachments
- List task attachments
- Check application health

## API Endpoints

| Method | Endpoint                   | Description                             |
| ------ | -------------------------- | --------------------------------------- |
| GET    | /api/health                | Check API, database, and storage health |
| GET    | /api/tasks                 | List all tasks                          |
| POST   | /api/tasks                 | Create a new task                       |
| GET    | /api/tasks/:id             | Get one task                            |
| PUT    | /api/tasks/:id             | Update a task                           |
| DELETE | /api/tasks/:id             | Delete a task                           |
| POST   | /api/tasks/:id/attachments | Upload task attachment                  |
| GET    | /api/tasks/:id/attachments | List task attachments                   |
