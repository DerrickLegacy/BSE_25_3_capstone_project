// =====================
// server.js – Express server with PostgreSQL connection
// =====================

// Load environment variables
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const promClient = require('prom-client');

const app = express();

const VERSION = process.env.VERSION || 'latest';
const ENV = process.env.NODE_ENV || 'development';
console.log(`Server starting — environment: ${ENV}, version: ${VERSION}`);

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
  console.error('Unexpected error on idle client', err);
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
      console.log('Adding sample notes...');
      await client.query(`
        INSERT INTO notes (title, content) VALUES 
        ('Welcome to Notes App', 'This is your first note! You can create, edit, and delete notes here.'),
        ('Meeting Notes', 'Remember to discuss the project timeline and deliverables.'),
        ('Shopping List', 'Milk, Bread, Eggs, Coffee');
      `);
      console.log('Sample notes added successfully!');
    } else {
      console.log(
        `Notes table already has ${count} records — skipping sample data.`
      );
    }

    dbInitialized = true;
  } catch (err) {
    console.error('Error initializing database:', err.stack);
  } finally {
    client.release();
  }
};

// =====================
// API Endpoints
// =====================
// Metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  console.log('Loading metrics');
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
    return res.json(rows);
  } catch (err) {
    console.error('DB Query Error:', err);
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
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create new note
app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title, content || '']
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update note
app.put('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = now() WHERE id = $3 RETURNING *',
      [title, content || '', id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
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
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// // health check
// app.get('/health', async (req, res) => {

//     // ===============================================
//     // 🔥 START: TEMPORARY CODE TO TEST ROLLBACK FAILURE
//     // ===============================================
//     // This looks for the environment variable we set on the Render test service
//     if (process.env.ROLLBACK_TEST_FAIL === 'true') {
//         console.error("Rollback Test Triggered: Intentionally returning 503.");
//         // Returning a non-200 status code immediately fails the CI health check
//         return res.status(503).json({
//             status: 'UNHEALTHY',
//             error: 'DELIBERATE FAILURE: Testing automated rollback.'
//         });
//     }

app.get('/api/version', (req, res) => {
  res.json({ version: VERSION, environment: ENV });
});

// =====================
// Serve React Frontend
// =====================

const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// =====================
// Start Server
// =====================

if (require.main === module) {
  initializeDatabase().then(() => {
    app.listen(app.get('port'), () => {
      console.log(`✅ Server running on port ${app.get('port')} [${ENV}]`);
    });
  });
}

// =====================
// Export for testing or reuse
// =====================
module.exports = { app, pool, initializeDatabase };
