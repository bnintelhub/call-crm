-- =======================================================
-- BN Orbit CRM Database Schema
-- Database: bnorbit_crm
-- Engine: MySQL 8.0+ / InnoDB
-- =======================================================

CREATE DATABASE IF NOT EXISTS `bnorbit_crm`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bnorbit_crm`;

-- -------------------------------------------------------
-- 1. Table: companies (Tenants / Organizations)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `companies` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `legal_name` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `gst` VARCHAR(50) NULL,
  `contact_name` VARCHAR(150) NOT NULL,
  `contact_email` VARCHAR(255) NOT NULL,
  `login_email` VARCHAR(255) NOT NULL UNIQUE,
  `contact_phone` VARCHAR(50) NULL,
  `admin_password_plain` VARCHAR(255) NULL,
  `status` ENUM('trial', 'active', 'grace', 'expired', 'suspended', 'cancelled') DEFAULT 'active',
  `activation_key` VARCHAR(100) NULL,
  `activation_key_status` ENUM('active', 'deactivated') DEFAULT 'active',
  `plan_name` VARCHAR(100) DEFAULT 'Standard',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_company_login_email` (`login_email`),
  INDEX `idx_company_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 2. Table: users (Super Admins, Supervisors, Telecallers)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `employee_id` VARCHAR(50) NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD', 'TELECALLER') NOT NULL,
  `phone` VARCHAR(50) NULL,
  `company_id` VARCHAR(36) NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `status` VARCHAR(50) DEFAULT 'ACTIVE',
  `token_version` INT DEFAULT 0,
  `profile_pic` VARCHAR(500) NULL,
  `team_lead_id` VARCHAR(36) NULL,
  `operations_manager_id` VARCHAR(36) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_company` (`company_id`),
  CONSTRAINT `fk_users_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies` (`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
