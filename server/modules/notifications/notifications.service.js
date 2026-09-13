// server/modules/notifications/notifications.service.js
// General-purpose notifications — role changes, becoming a Group Head,
// survey reminders, deadline warnings. Fire-and-forget creation, same
// philosophy as auditLog.service.js: a notification failing to write must
// never break the real action it's describing.

const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');

async function createNotification(recipientIts, type, message) {
  try {
    await db.query(
      'INSERT INTO notifications (recipient_its, type, message) VALUES ($1, $2, $3)',
      [recipientIts, type, message]
    );
  } catch (err) {
    console.error('[FARAS] Failed to create notification:', type, err.message);
  }
}

async function getNotificationsForUser(itsNumber, limit = 50) {
  const result = await db.query(
    'SELECT id, type, message, is_read, created_at FROM notifications WHERE recipient_its = $1 ORDER BY created_at DESC LIMIT $2',
    [itsNumber, limit]
  );
  return result.rows;
}

async function getUnreadCount(itsNumber) {
  const result = await db.query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_its = $1 AND is_read = FALSE',
    [itsNumber]
  );
  return result.rows[0].count;
}

async function markAsRead(notificationId, itsNumber) {
  const result = await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_its = $2 RETURNING id',
    [notificationId, itsNumber]
  );
  if (result.rows.length === 0) {
    throw Errors.notFound(`Notification ${notificationId} not found for this account.`);
  }
  return { id: notificationId };
}

async function markAllAsRead(itsNumber) {
  await db.query('UPDATE notifications SET is_read = TRUE WHERE recipient_its = $1', [itsNumber]);
  return { message: 'All notifications marked as read.' };
}

module.exports = {
  createNotification,
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};