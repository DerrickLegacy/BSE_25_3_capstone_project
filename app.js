// app.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
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

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve('client/build', 'index.html'));
  });
}

// postgre pool
const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_NAME,
  port: process.env.PG_PORT || 5432,
});

const COLUMNS = ['last_name', 'first_name'];

// API endpoint
// app.get('/api/books', (req, res) => {
//   const { firstName } = req.query;

//   if (!firstName) {
//     return res.json({ error: 'Missing required parameters' });
//   }

//   const queryString =
//     firstName === '*'
//       ? 'SELECT * FROM authors'
//       // : `SELECT * FROM authors WHERE first_name REGEXP '^${firstName}'`;
//       : `SELECT * FROM authors WHERE first_name ~* '^${firstName}'`;

//   return pool.query(queryString, (err, rows) => {
//     if (err) throw err;

//     if (rows.length > 0) {
//       const result = rows.map((entry) => {
//         const e = {};
//         COLUMNS.forEach((c) => {
//           e[c] = entry[c];
//         });
//         return e;
//       });
//       res.json(result);
//       return;
//     }
//     res.json([]);
//   });
// });
app.get('/api/books', async (req, res) => {
  const { firstName } = req.query;

  if (!firstName) {
    return res.json({ error: 'Missing required parameters' });
  }

  try {
    let rows;
    if (firstName === '*') {
      const result = await pool.query('SELECT * FROM authors');
      rows = result.rows;
    } else {
      const result = await pool.query(
        'SELECT * FROM authors WHERE first_name ~* $1',
        [`^${firstName}`]
      );
      rows = result.rows;
    }

    const result = rows.map((entry) => {
      const e = {};
      COLUMNS.forEach((c) => {
        e[c] = entry[c];
      });
      return e;
    });

    return res.json(result);
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = app;
