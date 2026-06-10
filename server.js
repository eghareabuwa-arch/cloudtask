const crypto = require('crypto');

if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto;
}
const express = require('express');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

let pool;
let blobContainer;

async function initServices() {
  const credential = new DefaultAzureCredential();

  const keyVaultUrl = process.env.KEY_VAULT_URL;
  const storageUrl = process.env.STORAGE_URL;

  if (!keyVaultUrl) {
    throw new Error('KEY_VAULT_URL is not set');
  }

  if (!storageUrl) {
    throw new Error('STORAGE_URL is not set');
  }

  const secretClient = new SecretClient(keyVaultUrl, credential);

  const connSecret = await secretClient.getSecret('sql-connection-string');

  pool = await sql.connect(connSecret.value);
  console.log('Connected to Azure SQL Database');

  const blobServiceClient = new BlobServiceClient(storageUrl, credential);
  blobContainer = blobServiceClient.getContainerClient('attachments');

  await blobContainer.createIfNotExists();

  console.log('Connected to Azure Blob Storage');
}

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CloudTask API',
    project: 'Azure Capstone Project',
    status: 'running on Azure-ready backend'
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    if (!pool || !blobContainer) {
      return res.status(503).json({
        status: 'starting',
        message: 'Azure services are still initializing'
      });
    }

    await pool.request().query('SELECT 1');
    await blobContainer.getProperties();

    res.json({
      status: 'healthy',
      db: 'connected',
      storage: 'connected'
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});

// List all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM Tasks';
    const request = pool.request();

    if (status) {
      query += ' WHERE Status = @status';
      request.input('status', sql.NVarChar, status);
    }

    query += ' ORDER BY CreatedAt DESC';

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Get one task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Tasks WHERE Id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, assignee, priority } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Task title is required'
      });
    }

    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('assignee', sql.NVarChar, assignee || '')
      .input('priority', sql.NVarChar, priority || 'Medium')
      .query(`
        INSERT INTO Tasks (Title, Description, Assignee, Priority, Status, CreatedAt)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @assignee, @priority, 'Open', GETUTCDATE())
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, assignee, priority, status } = req.body;

    const existing = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Tasks WHERE Id = @id');

    if (!existing.recordset.length) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    const currentTask = existing.recordset[0];

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.NVarChar, title || currentTask.Title)
      .input('description', sql.NVarChar, description || currentTask.Description)
      .input('assignee', sql.NVarChar, assignee || currentTask.Assignee)
      .input('priority', sql.NVarChar, priority || currentTask.Priority)
      .input('status', sql.NVarChar, status || currentTask.Status)
      .query(`
        UPDATE Tasks
        SET Title = @title,
            Description = @description,
            Assignee = @assignee,
            Priority = @priority,
            Status = @status
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Tasks WHERE Id = @id');

    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Upload attachment
app.post('/api/tasks/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    const taskId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const taskCheck = await pool.request()
      .input('id', sql.Int, taskId)
      .query('SELECT * FROM Tasks WHERE Id = @id');

    if (!taskCheck.recordset.length) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    const blobName = `${taskId}/${Date.now()}-${file.originalname}`;
    const blockBlobClient = blobContainer.getBlockBlobClient(blobName);

    await blockBlobClient.upload(file.buffer, file.size, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    await pool.request()
      .input('taskId', sql.Int, taskId)
      .input('fileName', sql.NVarChar, file.originalname)
      .input('blobName', sql.NVarChar, blobName)
      .input('size', sql.Int, file.size)
      .query(`
        INSERT INTO Attachments (TaskId, FileName, BlobName, Size, UploadedAt)
        VALUES (@taskId, @fileName, @blobName, @size, GETUTCDATE())
      `);

    res.status(201).json({
      message: 'Uploaded',
      fileName: file.originalname,
      blobName
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// List attachments
app.get('/api/tasks/:id/attachments', async (req, res) => {
  try {
    const result = await pool.request()
      .input('taskId', sql.Int, req.params.id)
      .query('SELECT * FROM Attachments WHERE TaskId = @taskId ORDER BY UploadedAt DESC');

    const attachments = result.recordset.map((attachment) => {
      const blockBlobClient = blobContainer.getBlockBlobClient(attachment.BlobName);

      return {
        id: attachment.Id,
        taskId: attachment.TaskId,
        fileName: attachment.FileName,
        blobName: attachment.BlobName,
        size: attachment.Size,
        uploadedAt: attachment.UploadedAt,
        blobUrl: blockBlobClient.url
      };
    });

    res.json(attachments);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

// Start the server first so Azure App Service can detect that the app is running
app.listen(PORT, () => {
  console.log(`CloudTask API running on port ${PORT}`);

  // Connect to Azure services after the server has started
  initServices()
    .then(() => {
      console.log('Azure services initialized successfully');
    })
    .catch((err) => {
      console.error('Azure services initialization failed:', err.message);
    });
});