import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================================
   MYSQL CONNECTION POOL
====================================== */

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    ssl : {
        ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem'), 'utf8')
    },
});

/* ======================================
   TEST CONNECTION
====================================== */

(async () => {
    try {
        const connection = await pool.getConnection();

        console.log("✅ Connected to MySQL");

        connection.release();
    } catch (error) {
        console.error("❌ Database connection failed");
        console.error(error.message);
    }
})();

export default pool;