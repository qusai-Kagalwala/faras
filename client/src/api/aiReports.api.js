// client/src/api/aiReports.api.js
// Matches server routes: POST /api/ai-reports/teacher/:teacherIts,
// POST /api/ai-reports/admin, GET /api/ai-reports/teacher/:teacherIts,
// GET /api/ai-reports, GET /api/ai-reports/:id

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const aiReportsApi = {
  generateTeacherReport: (token, teacherIts, cycleId) =>
    apiClient.post(`/ai-reports/teacher/${teacherIts}`, { cycleId }, authHeader(token)),

  generateAdminReport: (token, cycleId) =>
    apiClient.post('/ai-reports/admin', { cycleId }, authHeader(token)),

  getTeacherReports: (token, teacherIts) =>
    apiClient.get(`/ai-reports/teacher/${teacherIts}`, authHeader(token)),

  getAllReports: (token) => apiClient.get('/ai-reports', authHeader(token)),

  getReportDetail: (token, id) => apiClient.get(`/ai-reports/${id}`, authHeader(token)),
};