// server/modules/notifications/notifications.routes.js
// Any authenticated user (staff or student) can view and manage their OWN
// notifications — no role restriction needed, since the query is always
// scoped to req.user.itsNumber.

const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('./notifications.controller');
const authenticate = require('../../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);

module.exports = router;