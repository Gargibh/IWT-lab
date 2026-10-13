/**
 * db.js
 * Sets up a reusable MySQL connection pool.
 * Every route in server.js imports and queries through this,
 * instead of opening a new connection every time (a "pool"
 * keeps several ready-to-use connections open, which is more
 * efficient than one connection per request).
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
