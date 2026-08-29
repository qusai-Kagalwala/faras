// client/src/utils/roles.js
// Mirrors shared/constants/roles.js. Duplicated (not imported) because
// shared/ is CommonJS and lives outside Vite's project root — cross-module-
// system imports there are fragile. If these ever drift out of sync, that's
// a real bug: keep both files' values identical by hand.

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  DEPARTMENT: 'department',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));