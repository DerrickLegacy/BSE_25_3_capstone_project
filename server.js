// server.js – Express server with PostgreSQL connection and sample data loader

// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

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
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

let sampleDataLoaded = false;

const loadSampleDataIfEmpty = async () => {
  if (sampleDataLoaded) return;
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT COUNT(*) FROM authors');
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      console.log('Loading sample data from sample.sql');

      const sqlFilePath = path.join(__dirname, 'sample.sql');
      const sql = fs.readFileSync(sqlFilePath, 'utf8');

      await client.query(sql);
      console.log(`Sample data of  ${count} record(s) loaded successfully`);
    }
    sampleDataLoaded = true;
  } catch (err) {
    console.error('Error checking or loading sample data:', err.stack);
  } finally {
    client.release();
  }
};

loadSampleDataIfEmpty();

const COLUMNS = ['last_name', 'first_name'];

app.get('/api/books', async (req, res) => {
  const { firstName } = req.query;

  if (!firstName) return res.json({ error: 'Missing required parameters' });

  const queryString =
    firstName === '*'
      ? 'SELECT * FROM authors'
      : `SELECT * FROM authors WHERE first_name ~ '^${firstName}'`;

  try {
    const { rows } = await pool.query(queryString);

    if (rows.length > 0) {
      const filtered = rows.map((entry) => {
        const e = {};
        COLUMNS.forEach((c) => {
          e[c] = entry[c];
        });
        return e;
      });
      return res.json(filtered);
    }

    return res.json([]);
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});

// =====================
// Export for testing / other modules
// =====================

module.exports = { app, pool };
