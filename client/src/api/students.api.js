// client/src/api/students.api.js
// Matches server routes: GET /api/students/:itsNumber,
// PATCH /api/students/:itsNumber/deactivate, PATCH /api/students/:itsNumber/reactivate.

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const studentsApi = {
  getStudent: (token, itsNumber) => apiClient.get(`/students/${itsNumber}`, authHeader(token)),

  deactivate: (token, itsNumber) =>
    apiClient.patch(`/students/${itsNumber}/deactivate`, {}, authHeader(token)),

  reactivate: (token, itsNumber) =>
    apiClient.patch(`/students/${itsNumber}/reactivate`, {}, authHeader(token)),
};