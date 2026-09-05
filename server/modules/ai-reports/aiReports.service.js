// server/modules/ai-reports/aiReports.service.js
// FR-AI/FR-ADM: generates both report tracks. The two tracks are kept
// structurally separate — generateTeacherReport() and generateAdminReport()
// never call each other or share prompt-building logic.

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

  const insertResult = await db.query(
    `INSERT INTO ai_reports (teacher_its, cycle_id, track, report_json)
     VALUES ($1, $2, 'teacher', $3::jsonb) RETURNING id`,
    [teacherIts, cycleId, JSON.stringify(reportJson)]
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
            (SELECT stage FROM report_approvals rp
             WHERE rp.ai_report_id = ar.id
             ORDER BY rp.occurred_at DESC, rp.id DESC LIMIT 1) AS current_stage
     FROM ai_reports ar
     WHERE ar.teacher_its = $1 AND ar.track = 'teacher'
     ORDER BY ar.created_at DESC`,
    [teacherIts]
  );
  return result.rows;
}

async function getAllReports() {
  const result = await db.query(
    `SELECT ar.id, ar.teacher_its, ar.cycle_id, ar.track, ar.created_at,
            (SELECT stage FROM report_approvals rp
             WHERE rp.ai_report_id = ar.id
             ORDER BY rp.occurred_at DESC, rp.id DESC LIMIT 1) AS current_stage
     FROM ai_reports ar
     ORDER BY ar.created_at DESC`
  );
  return result.rows;
}

async function getReportById(aiReportId) {
  const result = await db.query(
    `SELECT id, teacher_its, cycle_id, track, report_json, created_at FROM ai_reports WHERE id = $1`,
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