// server/config/env.js
// Loads and validates required environment variables at process boot.
// Never hardcode secrets or connection info — everything comes from here.

require('dotenv').config();

const REQUIRED_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'PASSWORD_ENCRYPTION_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'NODE_ENV',
  'PORT',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => {
    const val = process.env[key];
    return val === undefined || val === '';
  });

  if (missing.length > 0) {
    console.error(
      `[FARAS] Missing required environment variable(s): ${missing.join(', ')}\n` +
        `Copy server/.env.example to server/.env and fill in real values before starting.`
    );
    process.exit(1);
  }
}

validateEnv();

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  passwordEncryptionKey: process.env.PASSWORD_ENCRYPTION_KEY,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
};