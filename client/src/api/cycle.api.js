// client/src/api/cycle.api.js
import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const cycleApi = {
  getCurrentCycle: (token) => apiClient.get('/cycle/current-week', authHeader(token)),

  setCurrentCycle: (token, week, academicYear) =>
    apiClient.patch('/cycle', { week, academicYear }, authHeader(token)),
};