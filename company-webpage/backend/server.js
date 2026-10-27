/**
 * server.js
 * Entry point. Sets up sessions (how the server remembers
 * "this browser is logged in as user #7"), serves the
 * frontend, and mounts all the route files.
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);
const db = require('./config/db');
const path = require("path");
const fs = require('fs');

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT;
const isProduction = process.env.NODE_ENV === "production";

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: {
        ca: fs.readFileSync(
            path.join(__dirname, '..', 'ca.pem'),
            'utf8'
        )
    }
});

app.use(session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 8
    }
}));

app.set("trust proxy", 1); // needed when deployed behind a host's proxy (Railway, Render, etc.)

app.use(express.json());

// ---- Sessions ----
// Every visitor gets a signed cookie identifying their session.
// req.session is where login state (userId, role) is stored,
// tied to that cookie - that's how the server "remembers" them
// across separate requests (HTTP itself has no memory otherwise).
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // only send cookie over HTTPS once deployed
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

// ---- Serve the frontend ----
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ---- API routes ----
app.use("/auth", authRoutes);
app.use("/employee", employeeRoutes);
app.use("/admin", adminRoutes);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Meridian Corp EMS running at ${PORT}`);
});