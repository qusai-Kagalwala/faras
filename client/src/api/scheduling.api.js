// client/src/api/scheduling.api.js
// Matches server route: POST /api/scheduling/generate

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const schedulingApi = {
  generate: (token, classId, startWeek, numWeeks) =>
    apiClient.post('/scheduling/generate', { classId, startWeek, numWeeks }, authHeader(token)),
};