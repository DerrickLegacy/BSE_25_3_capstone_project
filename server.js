// // server.js  defines express app

// // Load environment variables from .env at the very top
// require('dotenv').config();

// // eslint-disable-next-line no-console
// console.log('Loaded DB:', process.env.PG_NAME);

// const express = require('express');

// const path = require('path');

// const app = express();

// // Middleware to handle CORS
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
//   next();
// });

// // Set port from environment or default
// app.set('port', process.env.PORT || 3001);

// // Serve React app in production
// // if (process.env.NODE_ENV === 'production') {
// //   app.use(express.static('client/build'));
// //   app.get('/', (req, res) => {
// //     res.sendFile(path.resolve('client/build', 'index.html'));
// //   });
// // }

// // Create MySQL connection pool using environment variables
// const { Pool } = require('pg');

// const pool = new Pool({
//   host: process.env.PG_HOST,
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_NAME,
//   port: process.env.PG_PORT || 5432,
// });

// const COLUMNS = ['last_name', 'first_name'];

// // API endpoint to fetch books/authors
// app.get('/api/books', async (req, res) => {
//   const { firstName } = req.query;

//   if (!firstName) {
//     return res.json({ error: 'Missing required parameters' });
//   }

//   const queryString =
//     firstName === '*'
//       ? 'SELECT * FROM authors'
//       : `SELECT * FROM authors WHERE first_name ~ '^${firstName}'`;

//   try {
//     const result = await pool.query(queryString);
//     const { rows } = result;

//     if (rows.length > 0) {
//       const filtered = rows.map((entry) => {
//         const e = {};
//         COLUMNS.forEach((c) => {
//           e[c] = entry[c];
//         });
//         return e;
//       });
//       return res.json(filtered);
//     }

//     return res.json([]);
//   } catch (err) {
//     console.error('DB Query Error:', err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // Serve React frontend for all environments (production/staging)
// const buildPath = path.join(__dirname, 'client', 'build');
// app.use(express.static(buildPath));

// // Keep API routes above this!
// // Catch-all to serve index.html for React Router
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(buildPath, 'index.html'));
// });

// // export sql pool
// module.exports = { app, pool };

// server.js - defines Express app
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

// eslint-disable-next-line no-console
console.log('Loaded DB:', process.env.PG_NAME);

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

// Create Postgres connection pool using PG_* env vars
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

const COLUMNS = ['last_name', 'first_name'];

// API endpoint to fetch authors/books
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

    const mappedResult = rows.map((entry) => {
      const e = {};
      COLUMNS.forEach((c) => {
        e[c] = entry[c];
      });
      return e;
    });

    return res.json(mappedResult);
  } catch (err) {
    console.error('DB Query Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Serve React frontend for all environments
const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

// Catch-all to serve index.html for React Router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Export app and pool
module.exports = { app, pool };
