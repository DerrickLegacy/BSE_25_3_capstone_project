// =====================
// server.js – Express server with PostgreSQL connection
// =====================

// Load environment variables
require('dotenv').config();

// Initialize Sentry first (before any other imports)
require('./instrument');

const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const promClient = require('prom-client');
const { logger, requestLogger, errorLogger } = require('./logger');
const { captureException, captureMessage } = require('./instrument');

const app = express();

const VERSION = process.env.VERSION || 'latest';
const ENV = process.env.NODE_ENV || 'development';
logger.info(`Server starting — environment: ${ENV}, version: ${VERSION}`);

// Create a Registry to register metrics
const register = new promClient.Registry();
// Add a default metrics collection
promClient.collectDefaultMetrics({ register });

// Example custom metric
// Define the Counter metric
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total', // required
  help: 'Total number of HTTP requests', // required
  labelNames: ['method', 'route', 'status_code'], // optional
});

register.registerMetric(httpRequestCounter);
// Middleware to increment the counter
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
  });
  next();
});

// =====================
// Middleware
// =====================

// Request logging middleware
app.use(requestLogger);

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Parse JSON bodies
app.use(express.json());

// Set port
app.set('port', process.env.PORT || 3004);

// =====================
// PostgreSQL Pool Setup
// =====================

const useSSL = ENV === 'production' || ENV === 'staging';

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_NAME,
  port: process.env.PG_PORT || 5432,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  captureException(err);
  process.exit(-1);
});

// =====================
// Database Setup
// =====================

let dbInitialized = false;

const initializeDatabase = async () => {
  if (dbInitialized) return;
  if (ENV === 'production') return; // skip auto-initialization in production

  const client = await pool.connect();
  try {
    // Create notes table if missing
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    // Add some sample notes if table is empty
    const result = await client.query('SELECT COUNT(*) FROM notes');
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      logger.info('Adding sample notes...');
      await client.query(`
        INSERT INTO notes (title, content) VALUES 
        ('Welcome to Notes App', 'This is your first note! You can create, edit, and delete notes here.'),
        ('Meeting Notes', 'Remember to discuss the project timeline and deliverables.'),
        ('Shopping List', 'Milk, Bread, Eggs, Coffee');
      `);
      logger.info('Sample notes added successfully!');
    } else {
      logger.info(
        `Notes table already has ${count} records — skipping sample data.`
      );
    }

    dbInitialized = true;
  } catch (err) {
    logger.error('Error initializing database:', err);
    captureException(err);
  } finally {
    client.release();
  }
};

// =====================
// API Endpoints
// =====================
// Metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  logger.debug('Loading metrics');
  res.setHeader('Content-Type', register.contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.send(await register.metrics());
});

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notes ORDER BY updated_at DESC'
    );
    logger.info(`Retrieved ${rows.length} notes`);
    return res.json(rows);
  } catch (err) {
    logger.error('DB Query Error:', err);
    captureException(err);
    return res.status(500).json({ error: err.message });
  }
});

// Get single note
app.get('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM notes WHERE id = $1', [
      id,
    ]);
    if (rows.length === 0) {
      logger.warn(`Note with id ${id} not found`);
      return res.status(404).json({ error: 'Note not found' });
    }
    logger.info(`Retrieved note with id ${id}`);
    return res.json(rows[0]);
  } catch (err) {
    logger.error('DB Query Error:', err);
    captureException(err);
    return res.status(500).json({ error: err.message });
  }
});

// Create new note
app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    logger.warn('Attempted to create note without title');
    const error = new Error('Title is required');
    captureException(error); // Capture validation error in Sentry
    return res.status(400).json({ error: error.message });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title, content || '']
    );
    logger.info(`Created new note with id ${rows[0].id}`);
    return res.status(201).json(rows[0]);
  } catch (err) {
    logger.error('DB Query Error:', err);
    captureException(err);
    return res.status(500).json({ error: err.message });
  }
});

// Update note
app.put('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title) {
    logger.warn(`Attempted to update note ${id} without title`);
    const error = new Error('Title is required');
    captureException(error); // Capture validation error in Sentry
    return res.status(400).json({ error: error.message });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = now() WHERE id = $3 RETURNING *',
      [title, content || '', id]
    );

    if (rows.length === 0) {
      logger.warn(`Note with id ${id} not found for update`);
      return res.status(404).json({ error: 'Note not found' });
    }

    logger.info(`Updated note with id ${id}`);
    return res.json(rows[0]);
  } catch (err) {
    logger.error('DB Query Error:', err);
    captureException(err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete note
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      logger.warn(`Note with id ${id} not found for deletion`);
      return res.status(404).json({ error: 'Note not found' });
    }

    logger.info(`Deleted note with id ${id}`);
    return res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    logger.error('DB Query Error:', err);
    captureException(err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/version', (req, res) => {
  res.json({ version: VERSION, environment: ENV });
});

// Test endpoint for error tracking
app.get('/api/test-error', () => {
  logger.info('Testing error tracking...');
  const error = new Error('This is a test error for Sentry tracking');
  captureException(error);
  throw error;
});

// Test endpoint for Sentry message (non-error)
app.get('/api/test-sentry', (req, res) => {
  logger.info('Testing Sentry message tracking...');
  captureMessage('This is a test message for Sentry tracking', 'info');
  res.json({ message: 'Sentry message sent successfully' });
});

// =====================
// Error Handling
// =====================

// Custom error handling middleware
app.use(errorLogger);

// Global error handler to ensure all errors are captured and returned consistently
// This must have 4 args to be recognized by Express
app.use((err, req, res, next) => {
  const status = err.status || 500;
  // Log and report to Sentry
  logger.error(`${err.message} - ${req.method} ${req.url} - ${req.ip}`, { error: err.stack });
  try { captureException(err); } catch (_) {}
  if (res.headersSent) return next(err);
  return res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
});

// =====================
// Serve React Frontend
// =====================

const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

// Catch-all handler: send back React's index.html file for any non-API routes
app.use((req, res) => {
  // Only serve React for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// =====================
// Start Server
// =====================

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      // Capture unexpected process-level errors too
      process.on('unhandledRejection', (reason) => {
        try { captureException(reason instanceof Error ? reason : new Error(String(reason))); } catch (_) {}
        logger.error('Unhandled Promise Rejection', { reason });
      });
      process.on('uncaughtException', (err) => {
        try { captureException(err); } catch (_) {}
        logger.error('Uncaught Exception', { error: err.stack || err.message });
      });

      app.listen(app.get('port'), () => {
        logger.info(`✅ Server running on port ${app.get('port')} [${ENV}]`);
      });
    })
    .catch((err) => {
      logger.error('Failed to start server:', err);
      captureException(err);
      process.exit(1);
    });
}

// =====================
// Export for testing or reuse
// =====================
module.exports = { app, pool, initializeDatabase };
