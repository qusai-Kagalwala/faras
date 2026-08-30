// client/src/api/analytics.api.js
// Matches server routes: GET /api/analytics/teacher/:teacherIts

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const analyticsApi = {
  getTeacherTrend: (token, teacherIts) =>
    apiClient.get(`/analytics/teacher/${teacherIts}`, authHeader(token)),
};