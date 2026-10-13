// server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const newsRoutes = require('./routes/news');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day by default; extended if "remember me" is checked
  }
}));

// Static assets (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------
// Page routes (serve HTML views)
// ------------------------------------------------------------
const viewsDir = path.join(__dirname, 'views');

app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')));
app.get('/about.html', (req, res) => res.sendFile(path.join(viewsDir, 'about.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(viewsDir, 'login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(viewsDir, 'register.html')));

// Protected pages: if not logged in, redirect to login
app.get('/dashboard.html', requireAuth, (req, res) => res.sendFile(path.join(viewsDir, 'dashboard.html')));
app.get('/profile.html', requireAuth, (req, res) => res.sendFile(path.join(viewsDir, 'profile.html')));

// ------------------------------------------------------------
// API routes
// ------------------------------------------------------------
app.use('/', authRoutes);       // /register, /login, /logout, /check-username, /session-status
app.use('/', profileRoutes);    // /profile, /profile/update
app.use('/', dashboardRoutes);  // /dashboard
app.use('/', newsRoutes);       // /news

// ------------------------------------------------------------
// 404 handler
// ------------------------------------------------------------
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// ------------------------------------------------------------
// Global error handler
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Department of Computer Science portal running at http://localhost:${PORT}`);
});
