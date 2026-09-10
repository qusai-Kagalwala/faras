// server/modules/audit/auditLog.service.js
// Real gap closed: audit_logs (migration 014) existed with a complete
// schema but nothing anywhere ever wrote to it. Deliberately kept minimal
// — a single reusable logAction() call, wired into genuinely sensitive
// administrative actions (account creation/deactivation, role changes,
// schedule generation, login) rather than every possible endpoint.
//
// Logging is fire-and-forget: a failure to write an audit row must never
// break the real action it's describing — errors are caught and logged
// to the console, never thrown back to the caller.

const db = require('../../config/db');

async function logAction(userIts, action, details = null) {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_its, action, details) VALUES ($1, $2, $3::jsonb)',
      [userIts, action, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('[FARAS] Failed to write audit log:', action, err.message);
  }
}

async function getRecentLogs(limit = 50) {
  const result = await db.query(
    'SELECT id, user_its, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

module.exports = { logAction, getRecentLogs };