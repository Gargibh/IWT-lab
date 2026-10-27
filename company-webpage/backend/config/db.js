/**
 * config/db.js
 * Same role as db.js in your earlier project: one shared
 * connection pool that every route/controller reuses instead
 * of opening a new MySQL connection per request.
 */

require("dotenv").config();

const fs = require('fs');
const path = require('path');
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

   ssl : {
    ca: fs.readFileSync(path.join(__dirname, '..', '..', 'ca.pem'), 'utf8')
},

});

module.exports = pool;
