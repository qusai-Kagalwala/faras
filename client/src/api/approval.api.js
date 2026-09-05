// client/src/api/approval.api.js
// Matches server routes: GET /api/approvals/:aiReportId/history,
// POST /api/approvals/:aiReportId/advance

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const approvalApi = {
  getHistory: (token, aiReportId) =>
    apiClient.get(`/approvals/${aiReportId}/history`, authHeader(token)),

  advance: (token, aiReportId, stage, signOffNote) =>
    apiClient.post(`/approvals/${aiReportId}/advance`, { stage, signOffNote }, authHeader(token)),
};