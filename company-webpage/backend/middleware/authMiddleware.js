/**
 * middleware/authMiddleware.js
 *
 * A "middleware" is a function that runs BEFORE a route's real
 * logic, and decides whether to let the request continue.
 * These two functions are the actual security gate for this
 * whole app: nothing that touches employee/admin data runs
 * unless one of these calls next().
 */

// Blocks anyone who isn't logged in at all (no active session)
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Please log in to continue." });
  }
  next(); // logged in - let the request through to the real route
}

// Blocks anyone logged in as a regular employee from reaching admin routes
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Please log in to continue." });
  }
  if (req.session.role !== "admin") {
    return res.status(403).json({ error: "Admin access only." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
