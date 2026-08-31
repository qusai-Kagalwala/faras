// client/src/api/users.api.js
// Matches server routes: GET/POST /api/users/:itsNumber/roles,
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
};