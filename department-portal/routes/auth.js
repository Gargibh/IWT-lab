// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/db');

const SALT_ROUNDS = 10;

// ------------------------------------------------------------
// POST /register
// ------------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      register_number,
      department,
      email,
      phone,
      gender,
      dob,
      year_of_study,
      username,
      password,
      confirm_password
    } = req.body;

    // Server-side validation (mirrors frontend validation)
    if (!full_name || !register_number || !department || !email || !phone ||
        !gender || !dob || !year_of_study || !username || !password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check duplicate email, username, or register_number
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ? OR register_number = ? LIMIT 1',
      [email, username, register_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email, username, or register number already in use.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.query(
      `INSERT INTO users
        (full_name, register_number, department, email, phone, gender, dob, year_of_study, username, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, register_number, department, email, phone, gender, dob, year_of_study, username, password_hash]
    );

    return res.status(201).json({ success: true, message: 'Registration successful! You can now log in.' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ------------------------------------------------------------
// GET /check-username?username=xyz  (uniqueness check for frontend)
// ------------------------------------------------------------
router.get('/check-username', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    return res.json({ success: true, available: rows.length === 0 });
  } catch (err) {
    console.error('Check username error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ------------------------------------------------------------
// POST /login
// ------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, remember } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;

    // "Remember me" extends the session cookie lifetime
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    return res.json({ success: true, message: 'Login successful.', redirect: '/dashboard.html' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ------------------------------------------------------------
// GET /logout
// ------------------------------------------------------------
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    return res.redirect('/index.html');
  });
});

// ------------------------------------------------------------
// GET /session-status  (used by frontend to render navbar state)
// ------------------------------------------------------------
router.get('/session-status', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ loggedIn: true, username: req.session.username });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;
