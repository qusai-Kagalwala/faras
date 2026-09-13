// server/modules/ai-reports/aiReports.service.js
// FR-AI/FR-ADM: generates both report tracks. The two tracks are kept
// structurally separate — generateTeacherReport() and generateAdminReport()
// never call each other or share prompt-building logic.
//
// N-07: teacher reports now record WHICH subject they're about, when
// unambiguous (a teacher teaching more than one subject makes it
// genuinely ambiguous, so subject_id stays NULL in that case rather than
// guessing). List queries now also return real teacher/subject names
// instead of raw ITS numbers, since the Report Queue previously showed
// only "Teacher 30313106" with no context.

const db = require('../../config/db');
const { getMappedFeedbackForTeacher } = require('../mapping/mapping.service');
const { getDepartmentAnalytics } = require('../analytics/analytics.service');
const { filterQuotesForTeacherTrack } = require('./contentFilter');
const { buildTeacherPrompt } = require('./teacherPrompt');
const { buildAdminPrompt } = require('./adminPrompt');
const { generateStructuredJSON } = require('./openaiClient');
const { isValidTeacherReport } = require('../../../shared/schemas/teacherReport');
const { isValidAdminReport } = require('../../../shared/schemas/adminReport');
const { initializeApproval } = require('../approval/approval.service');
const { Errors } = require('../../middleware/errorHandler');

async function detectUnambiguousSubject(teacherIts) {
  const result = await db.query(
    'SELECT DISTINCT subject_id FROM class_subjects WHERE teacher_its = $1',
    [teacherIts]
  );
  return result.rows.length === 1 ? result.rows[0].subject_id : null;
}

async function generateTeacherReport(teacherIts, cycleId) {
  const mapped = await getMappedFeedbackForTeacher(teacherIts);

  const filteredFeedback = mapped.categorizedFeedback.map((f) => ({
    ...f,
    representativeQuotes: filterQuotesForTeacherTrack(f.representativeQuotes),
  }));

  const { systemPrompt, userPrompt } = buildTeacherPrompt({
    teacherName: mapped.teacherName,
    cycleId,
    categorizedFeedback: filteredFeedback,
  });

  const llmOutput = await generateStructuredJSON({ systemPrompt, userPrompt });

  const reportJson = {
    teacherItsNumber: teacherIts,
    cycleId,
    strengths: llmOutput.strengths,
    concerns: llmOutput.concerns,
    categorizedFeedback: filteredFeedback,
    recommendations: llmOutput.recommendations,
    generatedAt: new Date().toISOString(),
  };

  if (!isValidTeacherReport(reportJson)) {
    throw Errors.internal('The AI response did not match the expected report shape.');
  }

  const subjectId = await detectUnambiguousSubject(teacherIts);

  const insertResult = await db.query(
    `INSERT INTO ai_reports (teacher_its, cycle_id, track, report_json, subject_id)
     VALUES ($1, $2, 'teacher', $3::jsonb, $4) RETURNING id`,
    [teacherIts, cycleId, JSON.stringify(reportJson), subjectId]
  );
  const aiReportId = insertResult.rows[0].id;
  await initializeApproval(aiReportId);

  return { aiReportId, report: reportJson };
}

async function generateAdminReport(cycleId) {
  const { weeklyTrend, focusAreaBreakdown } = await getDepartmentAnalytics();

  const { systemPrompt, userPrompt } = buildAdminPrompt({ cycleId, weeklyTrend, focusAreaBreakdown });

  const llmOutput = await generateStructuredJSON({ systemPrompt, userPrompt });

  const reportJson = {
    cycleId,
    macroActionPointers: llmOutput.macroActionPointers,
    departmentTrends: llmOutput.departmentTrends,
    generatedAt: new Date().toISOString(),
  };

  if (!isValidAdminReport(reportJson)) {
    throw Errors.internal('The AI response did not match the expected report shape.');
  }

  const insertResult = await db.query(
    `INSERT INTO ai_reports (teacher_its, cycle_id, track, report_json)
     VALUES (NULL, $1, 'admin', $2::jsonb) RETURNING id`,
    [cycleId, JSON.stringify(reportJson)]
  );
  const aiReportId = insertResult.rows[0].id;
  await initializeApproval(aiReportId);

  return { aiReportId, report: reportJson };
}

async function getReportsForTeacher(teacherIts) {
  const result = await db.query(
    `SELECT ar.id, ar.cycle_id, ar.track, ar.report_json, ar.created_at,
            sub.name AS subject_name,
            (SELECT stage FROM report_approvals rp
             WHERE rp.ai_report_id = ar.id
             ORDER BY rp.occurred_at DESC, rp.id DESC LIMIT 1) AS current_stage
     FROM ai_reports ar
     LEFT JOIN subjects sub ON sub.id = ar.subject_id
     WHERE ar.teacher_its = $1 AND ar.track = 'teacher'
     ORDER BY ar.created_at DESC`,
    [teacherIts]
  );
  return result.rows;
}

async function getAllReports() {
  const result = await db.query(
    `SELECT ar.id, ar.teacher_its, ar.cycle_id, ar.track, ar.created_at,
            t.name AS teacher_name, sub.name AS subject_name,
            (SELECT stage FROM report_approvals rp
             WHERE rp.ai_report_id = ar.id
             ORDER BY rp.occurred_at DESC, rp.id DESC LIMIT 1) AS current_stage
     FROM ai_reports ar
     LEFT JOIN teachers t ON t.its_number = ar.teacher_its
     LEFT JOIN subjects sub ON sub.id = ar.subject_id
     ORDER BY ar.created_at DESC`
  );
  return result.rows;
}

async function getReportById(aiReportId) {
  const result = await db.query(
    `SELECT ar.id, ar.teacher_its, ar.cycle_id, ar.track, ar.report_json, ar.created_at,
            t.name AS teacher_name, sub.name AS subject_name
     FROM ai_reports ar
     LEFT JOIN teachers t ON t.its_number = ar.teacher_its
     LEFT JOIN subjects sub ON sub.id = ar.subject_id
     WHERE ar.id = $1`,
    [aiReportId]
  );
  if (result.rows.length === 0) {
    throw Errors.notFound(`AI report ${aiReportId} not found.`);
  }
  return result.rows[0];
}

module.exports = {
  generateTeacherReport,
  generateAdminReport,
  getReportsForTeacher,
  getAllReports,
  getReportById,
};