// app.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
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

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

const COLUMNS = ['last_name', 'first_name'];

// API endpoint
app.get('/api/books', (req, res) => {
  const { firstName } = req.query;

  if (!firstName) {
    return res.json({ error: 'Missing required parameters' });
  }

  const queryString =
    firstName === '*'
      ? 'SELECT * FROM authors'
      : `SELECT * FROM authors WHERE first_name REGEXP '^${firstName}'`;

  return pool.query(queryString, (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      const result = rows.map((entry) => {
        const e = {};
        COLUMNS.forEach((c) => {
          e[c] = entry[c];
        });
        return e;
      });
      res.json(result);
      return;
    }
    res.json([]);
  });
});

module.exports = app; // 👈 Export only the app
