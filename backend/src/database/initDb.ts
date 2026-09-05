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
    console.log('[DB] Tables `companies` and `users` from schema.sql are verified and ready.');
  } finally {
    conn.release();
  }
}
