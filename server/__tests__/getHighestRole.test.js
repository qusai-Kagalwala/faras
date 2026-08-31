// server/__tests__/getHighestRole.test.js
const { getHighestRole, ROLES } = require('../../shared/constants');

describe('getHighestRole', () => {
  test('a department head who is also teacher and super_admin defaults to super_admin', () => {
    const result = getHighestRole([ROLES.TEACHER, ROLES.DEPARTMENT, ROLES.SUPER_ADMIN]);
    expect(result).toBe(ROLES.SUPER_ADMIN);
  });

  test('department outranks teacher', () => {
    expect(getHighestRole([ROLES.TEACHER, ROLES.DEPARTMENT])).toBe(ROLES.DEPARTMENT);
  });

  test('a single role returns itself', () => {
    expect(getHighestRole([ROLES.TEACHER])).toBe(ROLES.TEACHER);
  });

  test('order of the input array does not matter', () => {
    expect(getHighestRole([ROLES.STUDENT, ROLES.SUPER_ADMIN, ROLES.TEACHER])).toBe(
      ROLES.SUPER_ADMIN
    );
    expect(getHighestRole([ROLES.SUPER_ADMIN, ROLES.STUDENT, ROLES.TEACHER])).toBe(
      ROLES.SUPER_ADMIN
    );
  });

  test('throws on an empty array rather than silently returning undefined', () => {
    expect(() => getHighestRole([])).toThrow();
  });

  test('throws on a non-array input', () => {
    expect(() => getHighestRole(null)).toThrow();
    expect(() => getHighestRole('teacher')).toThrow();
  });
});