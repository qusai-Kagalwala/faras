// shared/constants/roles.js
// The four FARAS roles, per SRS Section 2.2. Every login, RBAC check, and
// route guard references these — never hardcode role strings elsewhere.

const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  DEPARTMENT: 'department',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));

module.exports = { ROLES, ALL_ROLES };