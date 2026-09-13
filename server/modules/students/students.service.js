// server/modules/students/students.service.js
// FR-AUTH-08 (extended to students): Super Admin can look up a student
// account and deactivate/reactivate it (e.g. a student who has left the
// school). Mirrors users.service.js's setActive pattern.

const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');
const { logAction } = require('../audit/auditLog.service');

async function getStudentByIts(itsNumber) {
  const result = await db.query(
    `SELECT s.its_number, s.name, s.email, s.gender, s.is_active, c.display_name AS class_name
     FROM students s
     JOIN classes c ON c.id = s.class_id
     WHERE s.its_number = $1`,
    [itsNumber]
  );
  if (result.rows.length === 0) {
    throw Errors.notFound(`No student found for ITS Number ${itsNumber}.`);
  }
  return result.rows[0];
}

async function setActive(itsNumber, isActive, actorIts) {
  const result = await db.query('UPDATE students SET is_active = $1 WHERE its_number = $2', [
    isActive,
    itsNumber,
  ]);
  if (result.rowCount === 0) {
    throw Errors.notFound(`No student found for ITS Number ${itsNumber}.`);
  }

  logAction(actorIts, isActive ? 'student.reactivated' : 'student.deactivated', {
    targetIts: itsNumber,
  });

  return getStudentByIts(itsNumber);
}

module.exports = { getStudentByIts, setActive };