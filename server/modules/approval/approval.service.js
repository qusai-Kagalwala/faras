// server/modules/approval/approval.service.js
// FR-WF-01/02/03: manages report_approvals rows, enforcing the state
// machine in approvalStateMachine.js against real data.

const db = require('../../config/db');
const { validateTransition } = require('./approvalStateMachine');
const { Errors } = require('../../middleware/errorHandler');

async function getCurrentStage(aiReportId) {
  const result = await db.query(
    `SELECT stage FROM report_approvals
     WHERE ai_report_id = $1
     ORDER BY occurred_at DESC, id DESC
     LIMIT 1`,
    [aiReportId]
  );
  return result.rows.length > 0 ? result.rows[0].stage : null;
}

async function getApprovalHistory(aiReportId) {
  const result = await db.query(
    `SELECT id, stage, reviewed_by_its AS "reviewedByIts", sign_off_note AS "signOffNote", occurred_at AS "occurredAt"
     FROM report_approvals
     WHERE ai_report_id = $1
     ORDER BY occurred_at ASC, id ASC`,
    [aiReportId]
  );
  return result.rows;
}

async function advanceStage(aiReportId, requestedStage, reviewedByIts, signOffNote) {
  const reportResult = await db.query('SELECT id FROM ai_reports WHERE id = $1', [aiReportId]);
  if (reportResult.rows.length === 0) {
    throw Errors.notFound(`AI report ${aiReportId} not found.`);
  }

  const currentStage = await getCurrentStage(aiReportId);
  if (currentStage === null) {
    throw Errors.conflict(
      `Report ${aiReportId} has no approval history yet — it must be initialized to 'generated' first.`
    );
  }

  const { valid, error } = validateTransition(currentStage, requestedStage, { signOffNote });
  if (!valid) {
    throw Errors.validationFailed(error);
  }

  const result = await db.query(
    `INSERT INTO report_approvals (ai_report_id, stage, reviewed_by_its, sign_off_note)
     VALUES ($1, $2, $3, $4)
     RETURNING id, stage, reviewed_by_its AS "reviewedByIts", sign_off_note AS "signOffNote", occurred_at AS "occurredAt"`,
    [aiReportId, requestedStage, reviewedByIts, signOffNote || null]
  );

  return result.rows[0];
}

async function initializeApproval(aiReportId) {
  const existing = await getCurrentStage(aiReportId);
  if (existing !== null) {
    throw Errors.conflict(`Report ${aiReportId} already has an approval history.`);
  }

  const result = await db.query(
    `INSERT INTO report_approvals (ai_report_id, stage, reviewed_by_its, sign_off_note)
     VALUES ($1, 'generated', NULL, NULL)
     RETURNING id, stage, reviewed_by_its AS "reviewedByIts", sign_off_note AS "signOffNote", occurred_at AS "occurredAt"`,
    [aiReportId]
  );
  return result.rows[0];
}

module.exports = { getCurrentStage, getApprovalHistory, advanceStage, initializeApproval };