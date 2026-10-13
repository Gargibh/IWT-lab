-- ==========================================================
-- CONTACT MANAGER DATABASE
-- ==========================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS contact_manager;

-- Use the database
USE contact_manager;

-- ==========================================================
-- CONTACTS TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS contacts (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    phone VARCHAR(20) NOT NULL,

    email VARCHAR(120) NOT NULL UNIQUE,

    company VARCHAR(120),

    category ENUM('Friend','Family','Work','Other')
        DEFAULT 'Friend',

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);

-- ==========================================================
-- SAMPLE CONTACTS
-- These populate the dashboard immediately.
-- ==========================================================

INSERT INTO contacts
(name, phone, email, company, category, notes)
VALUES

(
    'Emma Wilson',
    '9876543210',
    'emma@gmail.com',
    'Sunrise Media',
    'Friend',
    'Met at a music festival last year. Loves indie music and hiking.'
),

(
    'Dad',
    '9876511111',
    'dad@family.com',
    'Home',
    'Family',
    'Call every Sunday evening.'
),

(
    'Priya Sharma',
    '9123456789',
    'priya@gmail.com',
    'The Baker''s Co.',
    'Work',
    'Graphic designer for bakery branding.'
),

(
    'Aarav Singh',
    '9988776655',
    'aarav@college.edu',
    'Pondicherry University',
    'Friend',
    'Classmate from MCA.'
),

(
    'Neha Kapoor',
    '9012345678',
    'neha@designstudio.com',
    'Pixel Studio',
    'Work',
    'UI/UX designer. Collaborated on a college project.'
),

(
    'Ishaan Verma',
    '8765478901',
    'ishaan@gmail.com',
    'Freelancer',
    'Other',
    'Met through a photography workshop.'
);