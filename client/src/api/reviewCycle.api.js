// client/src/api/reviewCycle.api.js
// Matches server routes under /api/review-cycles/:groupId/*

import { apiClient } from './client';

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const reviewCycleApi = {
  propose: (token, groupId, week) =>
    apiClient.post(`/review-cycles/${groupId}/propose`, { week }, authHeader(token)),

  getProposals: (token, groupId, week) =>
    apiClient.get(`/review-cycles/${groupId}/proposals/${week}`, authHeader(token)),

  toggleProposal: (token, groupId, proposalId, included) =>
    apiClient.patch(
      `/review-cycles/${groupId}/proposals/toggle/${proposalId}`,
      { included },
      authHeader(token)
    ),

  start: (token, groupId, week) =>
    apiClient.post(`/review-cycles/${groupId}/start`, { week }, authHeader(token)),
};