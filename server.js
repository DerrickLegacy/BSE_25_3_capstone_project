// server.js  defines express app

// Load environment variables from .env at the very top
require('dotenv').config();

// eslint-disable-next-line no-console
console.log('Loaded DB:', process.env.DB_NAME);

const express = require('express');

const path = require('path');

const app = express();

// Middleware to handle CORS
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

// Serve React app in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('client/build'));
//   app.get('/', (req, res) => {
//     res.sendFile(path.resolve('client/build', 'index.html'));
//   });
// }



// Create MySQL connection pool using environment variables
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_NAME,
  port: process.env.PG_PORT || 5432,
});


const COLUMNS = ['last_name', 'first_name'];

// API endpoint to fetch books/authors
app.get('/api/books', async (req, res) => {
  const { firstName } = req.query;

  if (!firstName) {
    return res.json({ error: 'Missing required parameters' });
  }

  const queryString =
    firstName === '*'
      ? 'SELECT * FROM authors'
      : `SELECT * FROM authors WHERE first_name ~ '^${firstName}'`;

  try {
    const [rows] = await pool.query(queryString);

    if (rows.length > 0) {
      const result = rows.map((entry) => {
        const e = {};
        COLUMNS.forEach((c) => {
          e[c] = entry[c];
        });
        return e;
      });
      return res.json(result);
    }

    return res.json([]);
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});



// Serve React frontend for all environments (production/staging)
const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

// Keep API routes above this!
// Catch-all to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// export sql pool
module.exports = { app, pool };
