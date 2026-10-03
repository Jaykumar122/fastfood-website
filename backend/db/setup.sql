-- ---------------------------------------------------------------------------
-- fastfood backend - MySQL bootstrap
--
-- Run as a MySQL admin (root):
--   mysql -u root -p < db/setup.sql
--
-- The Spring Boot app also creates the schema itself (ddl-auto=update) and the
-- database automatically (createDatabaseIfNotExist=true), so this script is only
-- needed when you want a dedicated application user.
-- ---------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS fastfood
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Dedicated application user (password: fastfood)
CREATE USER IF NOT EXISTS 'fastfood'@'localhost' IDENTIFIED BY 'fastfood';
CREATE USER IF NOT EXISTS 'fastfood'@'%' IDENTIFIED BY 'fastfood';

GRANT ALL PRIVILEGES ON fastfood.* TO 'fastfood'@'localhost';
GRANT ALL PRIVILEGES ON fastfood.* TO 'fastfood'@'%';

FLUSH PRIVILEGES;