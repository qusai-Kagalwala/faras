// client/src/api/notifications.api.js
// Matches server routes: GET /api/notifications, GET /api/notifications/unread-count,
// PATCH /api/notifications/:id/read, PATCH /api/notifications/read-all

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const notificationsApi = {
  getNotifications: (token) => apiClient.get('/notifications', authHeader(token)),

  getUnreadCount: (token) => apiClient.get('/notifications/unread-count', authHeader(token)),

  markAsRead: (token, id) => apiClient.patch(`/notifications/${id}/read`, {}, authHeader(token)),

  markAllAsRead: (token) => apiClient.patch('/notifications/read-all', {}, authHeader(token)),
};