/**
 * server.js
 * The Node.js/Express backend. This single file replaces
 * insert_employee.php, employees.php, edit_employee.php,
 * and delete_employee.php from the PHP version - each one
 * is now just a route below.
 *
 * The frontend (public/ folder) is served as static files,
 * and talks to these routes using fetch().
 */

require("dotenv").config();
const express = require("express");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON request bodies (equivalent of reading $_POST in PHP)
app.use(express.json());

// Serve index.html, style.css, script.js, etc. from the public/ folder
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------------------------------------
// Validation helpers (mirrors the checks script.js already
// does in the browser - the server must never trust the
// client alone, so everything is re-checked here too)
// -----------------------------------------------------------
function validateEmployee(data) {
  const errors = [];

  const employeeId = parseInt(data.employee_id, 10);
  if (!employeeId || employeeId <= 0) {
    errors.push("A valid Employee ID is required.");
  }

  const name = (data.employee_name || "").trim();
  if (!name || !/^[A-Za-z\s.'-]{2,100}$/.test(name)) {
    errors.push("A valid Employee Name is required.");
  }

  const email = (data.email || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid Email address is required.");
  }

  const phone = (data.phone || "").trim();
  if (!/^[0-9]{10}$/.test(phone)) {
    errors.push("A valid 10-digit Phone Number is required.");
  }

  if (!["Male", "Female", "Other"].includes(data.gender)) {
    errors.push("Please select a valid Gender.");
  }

  if (!data.date_of_birth) {
    errors.push("Date of Birth is required.");
  }

  if (!data.department) {
    errors.push("Department is required.");
  }

  if (!(data.designation || "").trim()) {
    errors.push("Designation is required.");
  }

  const salary = parseFloat(data.salary);
  if (!salary || salary <= 0) {
    errors.push("A valid Salary is required.");
  }

  if (!data.date_of_joining) {
    errors.push("Date of Joining is required.");
  }

  return errors;
}

// -----------------------------------------------------------
// GET /api/employees - list every employee
// (equivalent of employees.php's SELECT * query)
// -----------------------------------------------------------
app.get("/api/employees", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM employees ORDER BY employee_id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees." });
  }
});

// -----------------------------------------------------------
// GET /api/employees/:id - fetch a single employee
// (equivalent of edit_employee.php's initial load)
// -----------------------------------------------------------
app.get("/api/employees/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM employees WHERE employee_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employee." });
  }
});

// -----------------------------------------------------------
// POST /api/employees - create a new employee
// (equivalent of insert_employee.php)
// -----------------------------------------------------------
app.post("/api/employees", async (req, res) => {
  const errors = validateEmployee(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    employee_id,
    employee_name,
    email,
    phone,
    gender,
    date_of_birth,
    department,
    designation,
    salary,
    date_of_joining,
    address,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO employees
        (employee_id, employee_name, email, phone, gender, date_of_birth,
         department, designation, salary, date_of_joining, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        employee_name,
        email,
        phone,
        gender,
        date_of_birth,
        department,
        designation,
        salary,
        date_of_joining,
        address || "",
      ]
    );
    res.status(201).json({ message: "Employee added successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ errors: ["An employee with this ID or Email already exists."] });
    }
    console.error(err);
    res.status(500).json({ errors: ["Failed to save employee record."] });
  }
});

// -----------------------------------------------------------
// PUT /api/employees/:id - update an existing employee
// (equivalent of edit_employee.php's UPDATE)
// -----------------------------------------------------------
app.put("/api/employees/:id", async (req, res) => {
  const errors = validateEmployee({ ...req.body, employee_id: req.params.id });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    employee_name,
    email,
    phone,
    gender,
    date_of_birth,
    department,
    designation,
    salary,
    date_of_joining,
    address,
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE employees SET
        employee_name = ?, email = ?, phone = ?, gender = ?,
        date_of_birth = ?, department = ?, designation = ?,
        salary = ?, date_of_joining = ?, address = ?
       WHERE employee_id = ?`,
      [
        employee_name,
        email,
        phone,
        gender,
        date_of_birth,
        department,
        designation,
        salary,
        date_of_joining,
        address || "",
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ errors: ["Employee not found."] });
    }
    res.json({ message: "Employee updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["Failed to update employee record."] });
  }
});

// -----------------------------------------------------------
// DELETE /api/employees/:id - delete an employee
// (equivalent of delete_employee.php)
// -----------------------------------------------------------
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM employees WHERE employee_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete employee." });
  }
});



app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
