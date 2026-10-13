/**
 * seedAdmin.js
 *
 * The public registration form only ever creates 'employee'
 * accounts (see authController.register) - that's deliberate,
 * so nobody can sign up as an admin through the website.
 * This script is how YOU create the first admin account,
 * run once from the command line.
 *
 * Usage:  npm run seed-admin
 */

require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcrypt");
const pool = require("./config/db");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("=== Create an Admin Account ===");

  const full_name = await ask("Full name: ");
  const employee_id = await ask("Admin ID (any unique value, e.g. ADMIN001): ");
  const email = await ask("Email: ");
  const phone = await ask("Phone (10 digits): ");
  const password = await ask("Password (min 8 chars): ");

  rl.close();

  if (!full_name || !employee_id || !email || !password || password.length < 8) {
    console.error("All fields are required and password must be at least 8 characters.");
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (full_name, employee_id, email, phone, department, designation, password, role)
       VALUES (?, ?, ?, ?, 'Administration', 'System Administrator', ?, 'admin')`,
      [full_name, employee_id, email, phone, passwordHash]
    );

    console.log(`Admin account created for ${email}. You can now log in via login.html.`);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error("An account with that Employee ID or Email already exists.");
    } else {
      console.error("Failed to create admin:", err.message);
    }
  } finally {
    process.exit(0);
  }
}

main();
