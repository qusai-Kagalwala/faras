// client/src/api/aiReports.api.js
// Matches server routes: GET /api/ai-reports/teacher/:teacherIts,
// GET /api/ai-reports, GET /api/ai-reports/:id

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const aiReportsApi = {
  getTeacherReports: (token, teacherIts) =>
    apiClient.get(`/ai-reports/teacher/${teacherIts}`, authHeader(token)),

  getAllReports: (token) => apiClient.get('/ai-reports', authHeader(token)),

  getReportDetail: (token, id) => apiClient.get(`/ai-reports/${id}`, authHeader(token)),
};