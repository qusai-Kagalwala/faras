// shared/schemas/adminReport.js
// Shape of the ADMIN/department-facing AI report track only. Content here
// includes unfiltered comments, including harsh ones (FR-ADM-01) — this file
// never touches teacher-track filtered content. Do not import anything from
// teacherReport.js here, and do not import this file from the teacher-track
// generation code. Access to this data is restricted server-side to
// Department/Reviewer and Super Admin roles only (NFR-S-04) — enforced via
// requireRole(), not by this schema file.

/**
 * @typedef {Object} AdminReportActionPointer
 * @property {string} theme - e.g. "systemic syllabus-pacing issues" (FR-ADM-02)
 * @property {string} description
 * @property {string[]} affectedSubjects
 */

/**
 * @typedef {Object} AdminReportTrend
 * @property {'positive'|'negative'} direction
 * @property {string} description - department-level, not per-teacher (FR-ADM-03)
 */

/**
 * @typedef {Object} AdminReport
 * @property {string} cycleId
 * @property {AdminReportActionPointer[]} macroActionPointers
 * @property {AdminReportTrend[]} departmentTrends
 * @property {string} generatedAt - ISO timestamp
 */

const ADMIN_REPORT_REQUIRED_FIELDS = Object.freeze([
  'cycleId',
  'macroActionPointers',
  'departmentTrends',
  'generatedAt',
]);

const TREND_DIRECTIONS = Object.freeze(['positive', 'negative']);

function isValidAdminReport(obj) {
  if (!obj || typeof obj !== 'object') return false;

  const hasAllFields = ADMIN_REPORT_REQUIRED_FIELDS.every((field) => field in obj);
  if (!hasAllFields) return false;

  if (!Array.isArray(obj.macroActionPointers) || !Array.isArray(obj.departmentTrends)) {
    return false;
  }

  const trendsValid = obj.departmentTrends.every((t) => TREND_DIRECTIONS.includes(t.direction));
  if (!trendsValid) return false;

  return true;
}

module.exports = { ADMIN_REPORT_REQUIRED_FIELDS, TREND_DIRECTIONS, isValidAdminReport };