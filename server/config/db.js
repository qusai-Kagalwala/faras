// server/config/db.js
// Single shared pooled connection. Never hardcode host/user/pass — always
// read from DATABASE_URL (see config/env.js).

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
});

pool.on('error', (err) => {
  console.error('[FARAS] Unexpected PostgreSQL pool error:', err.message);
});

module.exports = pool;