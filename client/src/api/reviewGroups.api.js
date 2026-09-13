// client/src/api/reviewGroups.api.js
// Matches server routes: POST/GET /api/review-groups

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const reviewGroupsApi = {
  createGroup: (token, name, subjectId, departmentHeadIts, deadline) =>
    apiClient.post(
      '/review-groups',
      { name, subjectId, departmentHeadIts, deadline: deadline || null },
      authHeader(token)
    ),

  getGroups: (token) => apiClient.get('/review-groups', authHeader(token)),
};