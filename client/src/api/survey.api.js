// client/src/api/survey.api.js
// Matches server routes: GET /api/survey/current, POST /api/survey/submit.

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const surveyApi = {
  getCurrent: (token, week) => apiClient.get(`/survey/current?week=${week}`, authHeader(token)),

  submit: (token, week, answers) =>
    apiClient.post('/survey/submit', { week, answers }, authHeader(token)),
};