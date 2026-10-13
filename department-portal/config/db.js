// config/db.js
// MySQL connection pool using mysql2

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'department_portal',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Quick connectivity check at startup (non-fatal if it fails,
// so the server can still boot and log a helpful message).
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'department_portal');
    conn.release();
  } catch (err) {
    console.error('❌ Could not connect to MySQL. Check your .env credentials and that MySQL is running.');
    console.error('   Error:', err.message);
  }
})();

module.exports = pool;
