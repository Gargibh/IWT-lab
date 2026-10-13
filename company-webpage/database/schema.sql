-- =========================================================
-- Meridian Corp - Employee Management System
-- Database schema
-- =========================================================

CREATE DATABASE IF NOT EXISTS meridian_ems;
USE meridian_ems;

-- Login accounts for BOTH employees and admins.
-- role decides what they're allowed to access.
CREATE TABLE IF NOT EXISTS users (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    full_name     VARCHAR(100) NOT NULL,
    employee_id   VARCHAR(30) UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    phone         VARCHAR(15),
    department    VARCHAR(50),
    designation   VARCHAR(50),
    password      VARCHAR(255) NOT NULL,   -- stores a bcrypt HASH, never plain text
    role          ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extra profile details an employee fills in themselves,
-- separate from their login/account info in `users`.
CREATE TABLE IF NOT EXISTS employee_profiles (
    id                 INT PRIMARY KEY AUTO_INCREMENT,
    user_id            INT NOT NULL UNIQUE,
    gender             VARCHAR(20),
    dob                DATE,
    address            TEXT,
    city               VARCHAR(50),
    state              VARCHAR(50),
    joining_date       DATE,
    skills             TEXT,
    emergency_contact  VARCHAR(20),
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
