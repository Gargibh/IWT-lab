-- =========================================================
-- Employee Details Management System (Node.js version)
-- Run this in phpMyAdmin's "SQL" tab, or any MySQL client,
-- to create the database and table.
-- =========================================================

CREATE DATABASE IF NOT EXISTS employee_db;

USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
    employee_id     INT PRIMARY KEY,
    employee_name   VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(15),
    gender          VARCHAR(10),
    date_of_birth   DATE,
    department      VARCHAR(50),
    designation     VARCHAR(50),
    salary          DECIMAL(10,2),
    date_of_joining DATE,
    address         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
