const { Pool } = require('pg');
const env = require('../../config/env');
const { encryptPassword } = require('../../utils/passwordCrypto');

const pool = new Pool({ connectionString: env.databaseUrl });

async function run() {
  const { rows } = await pool.query(
    `SELECT its_number FROM students WHERE encrypted_password = 'PLACEHOLDER_NOT_REAL'`
  );

  console.log(`[FARAS] Found ${rows.length} students with placeholder passwords.`);

  let updated = 0;
  for (const { its_number } of rows) {
    const encrypted = encryptPassword(its_number);
    await pool.query(
      `UPDATE students SET encrypted_password = $1 WHERE its_number = $2`,
      [encrypted, its_number]
    );
    updated++;
  }

  console.log(`[FARAS] Updated ${updated} student passwords.`);
  await pool.end();
}

run().catch((err) => {
  console.error('[FARAS] Seed script failed:', err.message);
  process.exit(1);
});