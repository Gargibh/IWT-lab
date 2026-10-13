-- ============================================================
-- Department of Computer Science Portal - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS department_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE department_portal;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  register_number VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  dob DATE NOT NULL,
  year_of_study VARCHAR(20) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table: news
-- ------------------------------------------------------------
DROP TABLE IF EXISTS news;
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  published_date DATE NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Sample news data
-- ------------------------------------------------------------
INSERT INTO news (title, description, published_date) VALUES
('Annual Tech Fest "InnovateX" Announced',
 'The Department of Computer Science will host its annual technical festival featuring hackathons, coding contests, and guest lectures from industry experts.',
 '2026-08-20'),
('Placement Drive Results',
 'Congratulations to our final-year students on achieving a 92% placement rate this season, with top offers from leading tech companies.',
 '2026-08-10'),
('New AI & Machine Learning Lab Inaugurated',
 'A state-of-the-art AI and Machine Learning lab equipped with GPU workstations has been inaugurated to support advanced research and coursework.',
 '2026-07-28'),
('Research Paper Published in IEEE Conference',
 'Faculty members and postgraduate students co-authored a paper on distributed systems accepted at an international IEEE conference.',
 '2026-07-15'),
('Workshop on Cloud Computing',
 'A two-day hands-on workshop on cloud computing and DevOps practices was conducted for third and final year students.',
 '2026-06-30');

-- ------------------------------------------------------------
-- Sample user (password: Test@1234)
-- Hash generated with bcrypt, rounds=10
-- You can also just register a new account via the website.
-- ------------------------------------------------------------
-- INSERT INTO users (full_name, register_number, department, email, phone, gender, dob, year_of_study, username, password_hash)
-- VALUES ('Demo Student', 'CS2026001', 'Computer Science', 'demo@example.com', '9876543210', 'Other', '2004-05-15', '3rd Year', 'demo', '$2b$10$replace_with_real_hash');
