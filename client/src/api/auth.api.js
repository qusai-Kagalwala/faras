// client/src/api/auth.api.js
// Matches server routes: POST /api/auth/login, GET /api/auth/me,
// POST /api/auth/switch-role, POST /api/auth/change-password,
// POST /api/auth/forgot-password.

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const authApi = {
  login: (itsNumber, password) => apiClient.post('/auth/login', { itsNumber, password }),

  getMe: (token) => apiClient.get('/auth/me', authHeader(token)),

  switchRole: (token, role) => apiClient.post('/auth/switch-role', { role }, authHeader(token)),

  changePassword: (token, currentPassword, newPassword) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword }, authHeader(token)),

  forgotPassword: (itsNumber) => apiClient.post('/auth/forgot-password', { itsNumber }),
};