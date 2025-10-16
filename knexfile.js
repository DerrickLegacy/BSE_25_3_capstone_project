// /**
//  * @type { Object.<string, import("knex").Knex.Config> }
//  */
// require('dotenv').config();

// module.exports = {
//   development: {
//     client: 'mysql2',
//     connection: {
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT || 3306,
//     },
//     migrations: {
//       tableName: 'knex_migrations',
//       directory: './migrations',
//     },
//   },

//   staging: {
//     client: 'mysql2',
//     connection: {
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT || 3306,
//     },
//     pool: {
//       min: 2,
//       max: 10,
//     },
//     migrations: {
//       tableName: 'knex_migrations',
//       directory: './migrations',
//     },
//   },

//   production: {
//     client: 'mysql2',
//     connection: {
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT || 3306,
//     },
//     pool: {
//       min: 2,
//       max: 10,
//     },
//     migrations: {
//       tableName: 'knex_migrations',
//       directory: './migrations',
//     },
//   },
// };

//adapted to postgres
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_NAME,
      port: process.env.PG_PORT || 5432, // changed from 3306 to 5432 for Postgres
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
  },

  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL, // Render will use this single env var
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL, // also for production on Render
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
  },
};
