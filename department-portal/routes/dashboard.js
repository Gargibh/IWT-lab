// routes/dashboard.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');

// ------------------------------------------------------------
// GET /dashboard -> personalized dashboard data
// ------------------------------------------------------------
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT full_name, register_number, department, email, phone,
              gender, dob, year_of_study, username
       FROM users WHERE id = ? LIMIT 1`,
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [announcements] = await pool.query(
      'SELECT id, title, description, published_date FROM news ORDER BY published_date DESC LIMIT 3'
    );

    // Placeholder data for attendance / marks / events, since no
    // dedicated tables were requested for these in the schema.
    const upcomingEvents = [
      { title: 'Guest Lecture: AI in Industry', date: '2026-09-10' },
      { title: 'Hackathon Registrations Close', date: '2026-09-15' },
      { title: 'Mid-Semester Exams Begin', date: '2026-09-22' }
    ];

    const attendance = { percentage: 87, status: 'Good Standing' };
    const internalMarks = { subject: 'Overall Average', score: '38/50' };

    return res.json({
      success: true,
      student: rows[0],
      announcements,
      upcomingEvents,
      attendance,
      internalMarks
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error loading dashboard.' });
  }
});

module.exports = router;
