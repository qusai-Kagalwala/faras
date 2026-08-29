// server/db/seed/seed-user-passwords.js
// Same reasoning as seed-student-passwords.js: raw SQL can't call the
// AES-256-GCM encryption utility. Per FR-AUTH-02, starter password = the
// user's own ITS Number, for every role including teachers.
//
// Run once, after 009_users_teachers.sql has been executed:
//   node db/seed/seed-user-passwords.js

const { Pool } = require('pg');
const env = require('../../config/env');
const { encryptPassword } = require('../../utils/passwordCrypto');

const pool = new Pool({ connectionString: env.databaseUrl });

async function run() {
  const { rows } = await pool.query(
    `SELECT its_number FROM users WHERE encrypted_password = 'PLACEHOLDER_NOT_REAL'`
  );

  console.log(`[FARAS] Found ${rows.length} users with placeholder passwords.`);

  let updated = 0;
  for (const { its_number } of rows) {
    const encrypted = encryptPassword(its_number);
    await pool.query(
      `UPDATE users SET encrypted_password = $1 WHERE its_number = $2`,
      [encrypted, its_number]
    );
    updated++;
  }

  console.log(`[FARAS] Updated ${updated} user passwords.`);
  await pool.end();
}

run().catch((err) => {
  console.error('[FARAS] Seed script failed:', err.message);
  process.exit(1);
});
