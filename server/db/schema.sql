CREATE DATABASE IF NOT EXISTS learnlog;
USE learnlog;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  github_id VARCHAR(255) DEFAULT NULL,
  username VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Nodes table (hierarchical folder/file structure)
CREATE TABLE IF NOT EXISTS nodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('folder', 'file') NOT NULL,
  parent_id INT DEFAULT NULL,
  resource_url TEXT DEFAULT NULL,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES nodes(id) ON DELETE CASCADE
);

-- Seed a default user
INSERT IGNORE INTO users (id, username) VALUES (1, 'default_user');
