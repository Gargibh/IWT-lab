// routes/profile.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

const SALT_ROUNDS = 10;

// ------------------------------------------------------------
// GET /profile  -> current logged-in user's details
// ------------------------------------------------------------
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, register_number, department, email, phone,
              gender, dob, year_of_study, username, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
});

// ------------------------------------------------------------
// PUT /profile/update  -> update email, phone, and/or password
// ------------------------------------------------------------
router.put('/profile/update', requireAuth, async (req, res) => {
  try {
    const { email, phone, new_password, confirm_new_password } = req.body;
    const userId = req.session.userId;

    const fields = [];
    const values = [];

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
      }

      // Ensure email isn't taken by someone else
      const [dupe] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (dupe.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use by another account.' });
      }

      fields.push('email = ?');
      values.push(email);
    }

    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
      }
      fields.push('phone = ?');
      values.push(phone);
    }

    if (new_password || confirm_new_password) {
      if (!new_password || !confirm_new_password) {
        return res.status(400).json({ success: false, message: 'Both new password fields are required to change password.' });
      }
      if (new_password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
      }
      if (new_password !== confirm_new_password) {
        return res.status(400).json({ success: false, message: 'New passwords do not match.' });
      }
      const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
      fields.push('password_hash = ?');
      values.push(password_hash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No changes provided.' });
    }

    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

module.exports = router;
