/**
 * controllers/employeeController.js
 *
 * These routes only ever act on the CURRENTLY LOGGED-IN
 * employee's own data - notice every query uses
 * req.session.userId (set during login), never an ID sent
 * by the frontend. This is what stops one employee from
 * editing someone else's profile just by changing a URL.
 */

const pool = require("../config/db");

// ---- GET /employee/profile ----
async function getProfile(req, res) {
  const userId = req.session.userId;

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.employee_id, u.email, u.phone,
              u.department, u.designation,
              p.gender, p.dob, p.address, p.city, p.state,
              p.joining_date, p.skills, p.emergency_contact
       FROM users u
       LEFT JOIN employee_profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile." });
  }
}

// ---- POST /employee/profile (create, first time filling it in) ----
async function createProfile(req, res) {
  const userId = req.session.userId;
  const { gender, dob, address, city, state, joining_date, skills, emergency_contact } = req.body;

  try {
    await pool.query(
      `INSERT INTO employee_profiles
        (user_id, gender, dob, address, city, state, joining_date, skills, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, gender, dob || null, address, city, state, joining_date || null, skills, emergency_contact]
    );
    res.status(201).json({ message: "Profile saved successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Profile already exists. Use update instead." });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to save profile." });
  }
}

// ---- PUT /employee/profile (update an existing profile) ----
async function updateProfile(req, res) {
  const userId = req.session.userId;
  const { gender, dob, address, city, state, joining_date, skills, emergency_contact } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE employee_profiles SET
        gender = ?, dob = ?, address = ?, city = ?, state = ?,
        joining_date = ?, skills = ?, emergency_contact = ?
       WHERE user_id = ?`,
      [gender, dob || null, address, city, state, joining_date || null, skills, emergency_contact, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No existing profile to update - create one first." });
    }
    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile." });
  }
}

module.exports = { getProfile, createProfile, updateProfile };
