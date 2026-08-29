// shared/schemas/teacherReport.js
// Shape of the TEACHER-facing AI report track only. Content here has already
// passed the toxicity/sentiment filter (FR-AI-01) — this file never touches
// unfiltered admin content. Do not import anything from adminReport.js here,
// and do not import this file from the admin-track generation code.

/**
 * @typedef {Object} TeacherReportQuote
 * @property {string} text - moderated/filtered representative student comment
 * @property {string} focusArea - which Focus Area this quote relates to
 */

/**
 * @typedef {Object} TeacherReportCategory
 * @property {string} focusArea
 * @property {number} averageScore - aggregated Likert average for this focus area
 * @property {TeacherReportQuote[]} representativeQuotes - moderated only
 */

/**
 * @typedef {Object} TeacherReport
 * @property {string} teacherItsNumber
 * @property {string} cycleId
 * @property {string[]} strengths - high-level strengths (FR-AI-03)
 * @property {string[]} concerns - high-level concerns (FR-AI-03)
 * @property {TeacherReportCategory[]} categorizedFeedback
 * @property {string[]} recommendations - 1-2 specific, actionable items (FR-AI-03)
 * @property {string} generatedAt - ISO timestamp
 */

const TEACHER_REPORT_REQUIRED_FIELDS = Object.freeze([
  'teacherItsNumber',
  'cycleId',
  'strengths',
  'concerns',
  'categorizedFeedback',
  'recommendations',
  'generatedAt',
]);

function isValidTeacherReport(obj) {
  if (!obj || typeof obj !== 'object') return false;

  const hasAllFields = TEACHER_REPORT_REQUIRED_FIELDS.every((field) => field in obj);
  if (!hasAllFields) return false;

  if (!Array.isArray(obj.strengths) || !Array.isArray(obj.concerns)) return false;
  if (!Array.isArray(obj.categorizedFeedback)) return false;
  if (!Array.isArray(obj.recommendations)) return false;

  // FR-AI-03: 1-2 specific recommendations — not zero, not a dumped list.
  if (obj.recommendations.length < 1 || obj.recommendations.length > 2) return false;

  return true;
}

module.exports = { TEACHER_REPORT_REQUIRED_FIELDS, isValidTeacherReport };