// server/modules/classes/classes.service.js
// Super Admin management of the academic structure: classes, subjects,
// and which teacher is mapped to which subject for which class. This is
// the real data source scheduling.service.js reads from (class_subjects).

const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');

async function getAllClasses() {
  const result = await db.query(
    'SELECT id, darajah, section, gender, display_name FROM classes ORDER BY darajah, section, gender'
  );
  return result.rows;
}

async function getAllSubjects() {
  const result = await db.query('SELECT id, name FROM subjects ORDER BY name');
  return result.rows;
}

async function getAllTeachers() {
  const result = await db.query('SELECT its_number, name FROM teachers ORDER BY name');
  return result.rows;
}

async function assertClassExists(classId) {
  const result = await db.query('SELECT id FROM classes WHERE id = $1', [classId]);
  if (result.rows.length === 0) {
    throw Errors.notFound(`Class ${classId} not found.`);
  }
}

async function getClassSubjects(classId) {
  await assertClassExists(classId);
  const result = await db.query(
    `SELECT cs.subject_id, sub.name AS subject_name, cs.teacher_its, t.name AS teacher_name
     FROM class_subjects cs
     JOIN subjects sub ON sub.id = cs.subject_id
     LEFT JOIN teachers t ON t.its_number = cs.teacher_its
     WHERE cs.class_id = $1
     ORDER BY sub.name`,
    [classId]
  );
  return result.rows;
}

async function mapSubjectToClass(classId, subjectId, teacherIts) {
  await assertClassExists(classId);

  const subjectCheck = await db.query('SELECT id FROM subjects WHERE id = $1', [subjectId]);
  if (subjectCheck.rows.length === 0) {
    throw Errors.notFound(`Subject ${subjectId} not found.`);
  }

  if (teacherIts) {
    const teacherCheck = await db.query('SELECT its_number FROM teachers WHERE its_number = $1', [
      teacherIts,
    ]);
    if (teacherCheck.rows.length === 0) {
      throw Errors.notFound(`Teacher ${teacherIts} not found.`);
    }
  }

  await db.query(
    `INSERT INTO class_subjects (class_id, subject_id, teacher_its)
     VALUES ($1, $2, $3)
     ON CONFLICT (class_id, subject_id) DO UPDATE SET teacher_its = EXCLUDED.teacher_its`,
    [classId, subjectId, teacherIts || null]
  );

  return getClassSubjects(classId);
}

async function unmapSubjectFromClass(classId, subjectId) {
  await assertClassExists(classId);

  const result = await db.query(
    'DELETE FROM class_subjects WHERE class_id = $1 AND subject_id = $2',
    [classId, subjectId]
  );
  if (result.rowCount === 0) {
    throw Errors.notFound(`Subject ${subjectId} is not mapped to class ${classId}.`);
  }

  return getClassSubjects(classId);
}

module.exports = {
  getAllClasses,
  getAllSubjects,
  getAllTeachers,
  getClassSubjects,
  mapSubjectToClass,
  unmapSubjectFromClass,
};