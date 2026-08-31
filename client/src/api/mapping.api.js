// client/src/api/mapping.api.js
// Matches server route: GET /api/mapping/teacher/:teacherIts

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const mappingApi = {
  getTeacherFeedback: (token, teacherIts) =>
    apiClient.get(`/mapping/teacher/${teacherIts}`, authHeader(token)),
};