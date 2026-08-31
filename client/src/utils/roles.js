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

export const DASHBOARD_PATH_BY_ROLE = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/super-admin',
  [ROLES.DEPARTMENT]: '/department',
  [ROLES.TEACHER]: '/teacher',
  [ROLES.STUDENT]: '/student',
});

// Display labels + descriptions for the role picker / switcher UI.
export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: { label: 'Super Admin', description: 'Manage system configuration' },
  [ROLES.DEPARTMENT]: { label: 'Department', description: 'Review and approve reports' },
  [ROLES.TEACHER]: { label: 'Teacher', description: 'View your feedback reports' },
  [ROLES.STUDENT]: { label: 'Student', description: 'Submit weekly feedback' },
});

// Same ordering as shared/constants/roles.js ROLE_HIERARCHY — highest
// privilege first, used to order the role picker's cards consistently.
export const ROLE_ORDER = [ROLES.SUPER_ADMIN, ROLES.DEPARTMENT, ROLES.TEACHER, ROLES.STUDENT];