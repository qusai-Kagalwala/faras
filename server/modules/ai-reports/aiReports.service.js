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

module.exports = { generateTeacherReport, generateAdminReport };