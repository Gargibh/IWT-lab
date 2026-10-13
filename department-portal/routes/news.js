// routes/news.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ------------------------------------------------------------
// GET /news -> all news items, most recent first
// ------------------------------------------------------------
router.get('/news', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, published_date FROM news ORDER BY published_date DESC'
    );
    return res.json({ success: true, news: rows });
  } catch (err) {
    console.error('News fetch error:', err);
    return res.status(500).json({ success: false, message: 'Server error loading news.' });
  }
});

module.exports = router;
