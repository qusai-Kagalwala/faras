// server/modules/audit/audit.controller.js
const { getRecentLogs } = require('./auditLog.service');
const { successResponse } = require('../../../shared/schemas/apiResponse');

async function getLogs(req, res, next) {
  try {
    const logs = await getRecentLogs(50);
    return res.status(200).json(successResponse({ logs }));
  } catch (err) {
    return next(err);
  }
}

module.exports = { getLogs };