// Load environment variables from .env at the very top
require('dotenv').config();

// console.log('Loaded DB:', process.env.DB_NAME);

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

// Set port from environment or default
app.set('port', process.env.PORT || 3001);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve('client/build', 'index.html'));
  });
}

// Create MySQL connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
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
      : `SELECT * FROM authors WHERE first_name REGEXP '^${firstName}'`;

  try {
    const [rows] = await pool.promise().query(queryString);

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
    // console.error('Database error:', err);
    return res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// Start the server
app.listen(app.get('port'), () => {
  // console.log(`Server running at: http://localhost:${app.get('port')}/`);
});
