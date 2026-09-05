import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, createDatabaseIfNotExists } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  // Step 1: Ensure database exists
  await createDatabaseIfNotExists();

  const conn = await pool.getConnection();
  try {
    console.log('[DB] Initializing database tables from schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema.sql directly using MySQL connection
    await conn.query(sqlContent);
    
    // Auto-migrate security columns if missing
    const securityColumns = [
      { name: 'failed_login_attempts', type: 'INT DEFAULT 0' },
      { name: 'locked_until', type: 'DATETIME NULL' },
      { name: 'last_login_at', type: 'DATETIME NULL' },
      { name: 'last_login_ip', type: 'VARCHAR(50) NULL' },
    ];

    for (const col of securityColumns) {
      const [existing]: any = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'bnorbit_crm' AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
        [col.name]
      );
      if (!existing || existing.length === 0) {
        console.log(`[DB Migration] Adding missing column \`${col.name}\` to \`users\` table...`);
        await conn.query(`ALTER TABLE \`users\` ADD COLUMN \`${col.name}\` ${col.type}`);
      }
    }

    console.log('[DB] Tables `companies` and `users` from schema.sql are verified and ready.');
  } finally {
    conn.release();
  }
}
