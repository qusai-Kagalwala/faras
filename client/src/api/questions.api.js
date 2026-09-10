// client/src/api/questions.api.js
import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const questionsApi = {
  getStatements: (token) => apiClient.get('/questions', authHeader(token)),

  createStatement: (token, statement) => apiClient.post('/questions', statement, authHeader(token)),

  updateStatement: (token, id, statement) =>
    apiClient.put(`/questions/${id}`, statement, authHeader(token)),

  deleteStatement: (token, id) => apiClient.delete(`/questions/${id}`, authHeader(token)),

  getWeekFocusPlan: (token) => apiClient.get('/questions/week-plan', authHeader(token)),

  setWeekFocusAreas: (token, week, focusAreas) =>
    apiClient.put(`/questions/week-plan/${week}`, { focusAreas }, authHeader(token)),
};