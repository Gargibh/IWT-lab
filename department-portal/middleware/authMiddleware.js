// middleware/authMiddleware.js
// Protects routes that require a logged-in user (session-based).

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  // If the request expects JSON (API/fetch call), respond with JSON 401.
  if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }

  // Otherwise redirect to login page.
  return res.redirect('/login.html');
}

module.exports = { requireAuth };
