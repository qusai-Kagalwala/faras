// client/src/api/survey.api.js
import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const surveyApi = {
  getCurrent: (token) => apiClient.get('/survey/current', authHeader(token)),

  submit: (token, answers) => apiClient.post('/survey/submit', { answers }, authHeader(token)),
};