/**
 * controllers/adminController.js
 *
 * Every function here is only reachable through routes
 * protected by requireAdmin (see routes/admin.js) - a regular
 * employee session can never trigger these, even if they
 * guessed the URL, because the middleware blocks it first.
 */

const pool = require("../config/db");

// ---- GET /admin/employees (with optional ?search=) ----
async function getAllEmployees(req, res) {
  const search = req.query.search ? `%${req.query.search}%` : null;

  try {
    let query = `
      SELECT u.id, u.full_name, u.employee_id, u.email, u.phone,
             u.department, u.designation, u.created_at,
             p.joining_date
      FROM users u
      LEFT JOIN employee_profiles p ON p.user_id = u.id
      WHERE u.role = 'employee'`;
    const params = [];

    if (search) {
      query += ` AND (u.full_name LIKE ? OR u.employee_id LIKE ? OR u.department LIKE ?)`;
      params.push(search, search, search);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load employees." });
  }
}

// ---- GET /admin/employees/:id ----
async function getEmployeeById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.employee_id, u.email, u.phone,
              u.department, u.designation,
              p.gender, p.dob, p.address, p.city, p.state,
              p.joining_date, p.skills, p.emergency_contact
       FROM users u
       LEFT JOIN employee_profiles p ON p.user_id = u.id
       WHERE u.id = ? AND u.role = 'employee'`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load employee." });
  }
}

// ---- PUT /admin/employees/:id ----
async function updateEmployee(req, res) {
  const { id } = req.params;
  const {
    full_name, phone, department, designation,
    gender, dob, address, city, state, joining_date, skills, emergency_contact,
  } = req.body;

  try {
    await pool.query(
      `UPDATE users SET full_name = ?, phone = ?, department = ?, designation = ?
       WHERE id = ? AND role = 'employee'`,
      [full_name, phone, department, designation, id]
    );

    await pool.query(
      `UPDATE employee_profiles SET
        gender = ?, dob = ?, address = ?, city = ?, state = ?,
        joining_date = ?, skills = ?, emergency_contact = ?
       WHERE user_id = ?`,
      [gender, dob || null, address, city, state, joining_date || null, skills, emergency_contact, id]
    );

    res.json({ message: "Employee updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update employee." });
  }
}

// ---- DELETE /admin/employees/:id ----
async function deleteEmployee(req, res) {
  try {
    const [result] = await pool.query(
      "DELETE FROM users WHERE id = ? AND role = 'employee'",
      [req.params.id]
    );
    // employee_profiles row is removed automatically via ON DELETE CASCADE

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete employee." });
  }
}

// ---- GET /admin/stats ----
async function getStats(req, res) {
  try {
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'employee'"
    );
    const [[{ departments }]] = await pool.query(
      "SELECT COUNT(DISTINCT department) AS departments FROM users WHERE role = 'employee'"
    );
    const [[{ recent }]] = await pool.query(
      `SELECT COUNT(*) AS recent FROM users
       WHERE role = 'employee' AND created_at >= (NOW() - INTERVAL 30 DAY)`
    );
    res.json({ total, departments, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats." });
  }
}

module.exports = { getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, getStats };
