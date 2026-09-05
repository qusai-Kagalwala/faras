// client/src/api/classes.api.js
import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const classesApi = {
  getClasses: (token) => apiClient.get('/classes', authHeader(token)),

  getAllSubjects: (token) => apiClient.get('/classes/subjects', authHeader(token)),

  getAllTeachers: (token) => apiClient.get('/classes/teachers', authHeader(token)),

  getClassSubjects: (token, classId) =>
    apiClient.get(`/classes/${classId}/subjects`, authHeader(token)),

  mapSubject: (token, classId, subjectId, teacherIts) =>
    apiClient.post(`/classes/${classId}/subjects`, { subjectId, teacherIts }, authHeader(token)),

  unmapSubject: (token, classId, subjectId) =>
    apiClient.delete(`/classes/${classId}/subjects/${subjectId}`, authHeader(token)),
};