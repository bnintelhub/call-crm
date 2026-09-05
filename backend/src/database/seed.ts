import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { initDatabase } from './initDb.js';

export async function seedDatabase() {
  await initDatabase();

  const conn = await pool.getConnection();
  try {
    console.log('[SEED] Seeding default companies and users...');

    // 1. Seed Demo Company
    const companyId = 'comp-bn-001';
    await conn.query(`
      INSERT INTO \`companies\` (
        \`id\`, \`code\`, \`name\`, \`legal_name\`, \`city\`, \`contact_name\`, 
        \`contact_email\`, \`login_email\`, \`contact_phone\`, \`admin_password_plain\`,
        \`status\`, \`activation_key\`, \`activation_key_status\`, \`plan_name\`
      ) VALUES (
        ?, '1001', 'B.N. Singh Associates', 'B.N. Singh & Associates Recovery LLP', 'Ranchi', 'Priyam Kumar Singh',
        'priyam@bnsinghassociates.com', 'admin@bnsinghassociates.com', '+91 9876543210', 'Admin@123',
        'active', 'BN10-ORBX-2609-P4Q8', 'active', 'Enterprise IVR'
      )
      ON DUPLICATE KEY UPDATE 
        \`name\` = VALUES(\`name\`),
        \`status\` = VALUES(\`status\`),
        \`activation_key_status\` = VALUES(\`activation_key_status\`);
    `, [companyId]);

    // 2. Prepare Hashed Passwords
    const saltRounds = 10;
    const superAdminHash = await bcrypt.hash('SuperAdmin@123', saltRounds);
    const supervisorHash = await bcrypt.hash('Admin@123', saltRounds);
    const telecallerHash = await bcrypt.hash('Telecaller@123', saltRounds);

    const users = [
      {
        id: 'user-superadmin-001',
        employeeId: 'SA-001',
        name: 'BN Orbit Super Admin',
        email: 'superadmin@bnorbit.com',
        passwordHash: superAdminHash,
        role: 'SUPER_ADMIN',
        companyId: null,
      },
      {
        id: 'user-admin-001',
        employeeId: 'EMP-BN-001',
        name: 'Priyam Kumar Singh',
        email: 'admin@bnsinghassociates.com',
        passwordHash: supervisorHash,
        role: 'TEAM_LEAD',
        companyId: companyId,
      },
      {
        id: 'user-telecaller-001',
        employeeId: 'BN5263',
        name: 'Demo Telecaller',
        email: 'telecaller@bnorbit.com',
        passwordHash: telecallerHash,
        role: 'TELECALLER',
        companyId: companyId,
      },
    ];

    for (const u of users) {
      await conn.query(`
        INSERT INTO \`users\` (
          \`id\`, \`employee_id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`company_id\`, \`is_active\`
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, 1
        )
        ON DUPLICATE KEY UPDATE
          \`password_hash\` = VALUES(\`password_hash\`),
          \`role\` = VALUES(\`role\`),
          \`is_active\` = VALUES(\`is_active\`),
          \`company_id\` = VALUES(\`company_id\`);
      `, [u.id, u.employeeId, u.name, u.email, u.passwordHash, u.role, u.companyId]);
    }

    console.log('[SEED] Seeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Initial Seed Credentials:');
    console.log('1. Super Admin : superadmin@bnorbit.com / SuperAdmin@123');
    console.log('2. Supervisor  : admin@bnsinghassociates.com / Admin@123');
    console.log('3. Telecaller  : telecaller@bnorbit.com / Telecaller@123');
    console.log('--------------------------------------------------');
  } finally {
    conn.release();
  }
}

// Allow running directly via `tsx src/database/seed.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SEED ERROR]', err);
      process.exit(1);
    });
}
