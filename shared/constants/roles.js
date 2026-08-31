// shared/constants/roles.js
// The four FARAS roles, per SRS Section 2.2. Every login, RBAC check, and
// route guard references these — never hardcode role strings elsewhere.
//
// MULTI-ROLE SUPPORT (added after initial SRS): a single staff person at
// AJSM can genuinely hold multiple roles at once (e.g. a department head
// who is also a teacher and a super admin). Students are never multi-role.
// ROLE_HIERARCHY defines which assigned role becomes the default ACTIVE
// role on login when a person has more than one — highest privilege wins.

const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  DEPARTMENT: 'department',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

const ALL_ROLES = Object.freeze(Object.values(ROLES));

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.DEPARTMENT]: 2,
  [ROLES.TEACHER]: 3,
  [ROLES.STUDENT]: 4,
});

function getHighestRole(roles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error('[FARAS] getHighestRole() requires a non-empty array of roles.');
  }
  return roles.reduce((highest, current) =>
    ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest] ? current : highest
  );
}

module.exports = { ROLES, ALL_ROLES, ROLE_HIERARCHY, getHighestRole };