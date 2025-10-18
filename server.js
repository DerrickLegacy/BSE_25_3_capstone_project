// =====================
// server.js – Express server with PostgreSQL connection
// =====================

// Load environment variables
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const fs = require('fs');

const VERSION = process.env.VERSION || 'staging-unknown';
console.log(`Server started — version: ${VERSION}`);

const app = express();

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
  next();
});

// Set port from environment or default
app.set('port', process.env.PORT || 3001);

// =====================
// PostgreSQL Pool Setup
// =====================

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_NAME,
  port: process.env.PG_PORT || 5432,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false, // only enable SSL in production
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// =====================
// Sample Data Loader (runs only once)
// =====================

let sampleDataLoaded = false;

const loadSampleDataIfEmpty = async () => {
  if (sampleDataLoaded) return;
  const client = await pool.connect();

  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'authors'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Table "authors" does not exist. Creating table...');
      await client.query(`
        CREATE TABLE authors (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          middle_name VARCHAR(255),
          last_name VARCHAR(255) NOT NULL
        );
      `);
    }

    // Check if table has data
    const result = await client.query('SELECT COUNT(*) FROM authors');
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      const sqlFilePath = path.join(__dirname, 'sample.sql');
      if (fs.existsSync(sqlFilePath)) {
        console.log('Loading sample data from sample.sql...');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        await client.query(sql);
        console.log('Sample data loaded successfully!');
      } else {
        console.warn('sample.sql file not found — skipping sample data load.');
      }
    } else {
      console.warn(`Table already has ${count} records, skipping sample load.`);
    }

    sampleDataLoaded = true;
  } catch (err) {
    console.error('Error checking/loading sample data:', err.stack);
  } finally {
    client.release();
  }
};

// =====================
// API Endpoints
// =====================

const COLUMNS = ['last_name', 'first_name'];

app.get('/api/books', async (req, res) => {
  const { firstName } = req.query;

  if (!firstName) return res.json({ error: 'Missing required parameters' });

  const queryString =
    firstName === '*'
      ? 'SELECT * FROM authors'
      : `SELECT * FROM authors WHERE first_name ~* '^${firstName}'`; // case-insensitive regex

  try {
    const { rows } = await pool.query(queryString);
    const filtered = rows.map((entry) => {
      const e = {};
      COLUMNS.forEach((c) => {
        e[c] = entry[c];
      });
      return e;
    });
    return res.json(filtered);
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/version', (req, res) => {
  res.json({ version: VERSION });
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
// Start Server (only when run directly)
// =====================

if (require.main === module) {
  loadSampleDataIfEmpty().then(() => {
    app.listen(app.get('port'), () => {
      console.log(`✅ Server running on port ${app.get('port')}`);
    });
  });
}

// =====================
// Export for testing or reuse
// =====================
module.exports = { app, pool, loadSampleDataIfEmpty };
