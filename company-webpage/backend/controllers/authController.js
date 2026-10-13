/**
 * controllers/authController.js
 *
 * Handles account creation and login. The most important new
 * concept here vs your earlier project: passwords are never
 * stored as plain text. bcrypt "hashes" the password into an
 * irreversible scrambled string before it ever touches the
 * database - so even if someone stole the database, they
 * couldn't read anyone's actual password.
 */

const bcrypt = require("bcrypt");
const pool = require("../config/db");

const SALT_ROUNDS = 10;

// ---- POST /auth/register ----
async function register(req, res) {
  const {
    full_name,
    employee_id,
    email,
    phone,
    department,
    designation,
    password,
    confirm_password,
  } = req.body;

  const errors = [];

  if (!full_name || full_name.trim() === "") errors.push("Full name is required.");
  if (!employee_id || employee_id.trim() === "") errors.push("Employee ID is required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required.");
  }
  if (!phone || !/^[0-9]{10}$/.test(phone)) errors.push("A valid 10-digit phone number is required.");
  if (!department) errors.push("Department is required.");
  if (!designation || designation.trim() === "") errors.push("Designation is required.");
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters.");
  if (password !== confirm_password) errors.push("Passwords do not match.");

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Turn the plain-text password into a bcrypt hash before storing it
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.query(
      `INSERT INTO users
        (full_name, employee_id, email, phone, department, designation, password, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'employee')`,
      [full_name, employee_id, email, phone, department, designation, passwordHash]
    );

    res.status(201).json({ message: "Account created successfully. You can now log in." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ errors: ["An account with this Employee ID or Email already exists."] });
    }
    console.error(err);
    res.status(500).json({ errors: ["Registration failed. Please try again."] });
  }
}

// ---- POST /auth/login ----
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];

    // Compare the typed password against the stored hash.
    // bcrypt.compare re-hashes the input and checks if it matches -
    // the original password is never decrypted, because it can't be.
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Save identifying info in the session so future requests
    // from this browser are recognized as "logged in as this user"
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.fullName = user.full_name;

    res.json({
      message: "Login successful.",
      role: user.role,
      fullName: user.full_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
}

// ---- GET /auth/logout ----
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed." });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
}

// ---- GET /auth/me (helper so the frontend can check "am I logged in?") ----
function me(req, res) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ loggedIn: false });
  }
  res.json({
    loggedIn: true,
    role: req.session.role,
    fullName: req.session.fullName,
  });
}

module.exports = { register, login, logout, me };
