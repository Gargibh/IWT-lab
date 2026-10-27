/**
 * db.js
 * Sets up a reusable MySQL connection pool.
 * Every route in server.js imports and queries through this,
 * instead of opening a new connection every time (a "pool"
 * keeps several ready-to-use connections open, which is more
 * efficient than one connection per request).
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
   ca: fs.readFileSync(__dirname + "/ca.pem"),
},
});

module.exports = pool;
