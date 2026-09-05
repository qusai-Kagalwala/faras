// client/src/api/users.api.js
// Matches server routes: POST /api/users, PATCH /api/users/:itsNumber/deactivate,
// PATCH /api/users/:itsNumber/reactivate, GET/POST /api/users/:itsNumber/roles,
// DELETE /api/users/:itsNumber/roles/:role — Super Admin only.

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const usersApi = {
  getRoles: (token, itsNumber) => apiClient.get(`/users/${itsNumber}/roles`, authHeader(token)),

  assignRole: (token, itsNumber, role) =>
    apiClient.post(`/users/${itsNumber}/roles`, { role }, authHeader(token)),

  removeRole: (token, itsNumber, role) =>
    apiClient.delete(`/users/${itsNumber}/roles/${role}`, authHeader(token)),

  createAccount: (token, itsNumber, name, email, initialRole) =>
    apiClient.post('/users', { itsNumber, name, email, initialRole }, authHeader(token)),

  deactivate: (token, itsNumber) =>
    apiClient.patch(`/users/${itsNumber}/deactivate`, {}, authHeader(token)),

  reactivate: (token, itsNumber) =>
    apiClient.patch(`/users/${itsNumber}/reactivate`, {}, authHeader(token)),
};