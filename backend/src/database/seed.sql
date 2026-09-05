-- =======================================================
-- BN Orbit CRM Initial Seed Data
-- Database: bnorbit_crm
-- =======================================================

USE `bnorbit_crm`;

-- 1. Insert Initial Company
INSERT INTO `companies` (
  `id`, `code`, `name`, `legal_name`, `city`, `contact_name`, 
  `contact_email`, `login_email`, `contact_phone`, `admin_password_plain`,
  `status`, `activation_key`, `activation_key_status`, `plan_name`
) VALUES (
  'comp-bn-001', '1001', 'B.N. Singh Associates', 'B.N. Singh & Associates Recovery LLP', 'Ranchi', 'Priyam Kumar Singh',
  'priyam@bnsinghassociates.com', 'admin@bnsinghassociates.com', '+91 9876543210', 'Admin@123',
  'active', 'BN10-ORBX-2609-P4Q8', 'active', 'Enterprise IVR'
)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `status` = VALUES(`status`),
  `activation_key_status` = VALUES(`activation_key_status`);

-- 2. Insert Seed Users with Real Bcrypt Hashes (10 rounds)
-- Password for Super Admin : SuperAdmin@123
-- Password for Supervisor  : Admin@123
-- Password for Telecaller  : Telecaller@123

INSERT INTO `users` (
  `id`, `employee_id`, `name`, `email`, `password_hash`, `role`, `company_id`, `is_active`
) VALUES 
(
  'user-superadmin-001', 'SA-001', 'BN Orbit Super Admin', 'superadmin@bnorbit.com',
  '$2b$10$2jbsxVuqLtQQiSekx.WiruUk/cI.v8teGyq46a4AwqTHKdOlTgpDO', 'SUPER_ADMIN', NULL, 1
),
(
  'user-admin-001', 'EMP-BN-001', 'Priyam Kumar Singh', 'admin@bnsinghassociates.com',
  '$2b$10$PGATogyggTfHDL65FwRikuMgzHQwHzCAHcgq9D.SO4cwAUE/cXqRu', 'TEAM_LEAD', 'comp-bn-001', 1
),
(
  'user-telecaller-001', 'BN5263', 'Demo Telecaller', 'telecaller@bnorbit.com',
  '$2b$10$6zPQdQUREH0cB1ItxrYax./AQYxiA6VlXTNqYccQevXiWY7RZTXBq', 'TELECALLER', 'comp-bn-001', 1
)
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `role` = VALUES(`role`),
  `is_active` = VALUES(`is_active`),
  `company_id` = VALUES(`company_id`);
