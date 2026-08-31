// server/modules/users/users.service.js
// FR-AUTH-08 (extended): Super Admin can assign/remove roles for a staff
// account. Scoped to STAFF roles only (super_admin/department/teacher) —
// students are never in user_roles and this module never touches them.

const db = require('../../config/db');
const { Errors } = require('../../middleware/errorHandler');

const STAFF_ROLES = ['super_admin', 'department', 'teacher'];

async function assertUserExists(itsNumber) {
  const result = await db.query('SELECT its_number FROM users WHERE its_number = $1', [
    itsNumber,
  ]);
  if (result.rows.length === 0) {
    throw Errors.notFound(`No staff account found for ITS Number ${itsNumber}.`);
  }
}

async function getRolesForUser(itsNumber) {
  await assertUserExists(itsNumber);
  const result = await db.query('SELECT role FROM user_roles WHERE its_number = $1', [
    itsNumber,
  ]);
  return result.rows.map((r) => r.role);
}

async function assignRole(itsNumber, role) {
  if (!STAFF_ROLES.includes(role)) {
    throw Errors.validationFailed(`"${role}" is not a valid staff role.`);
  }

  await assertUserExists(itsNumber);

  await db.query(
    `INSERT INTO user_roles (its_number, role) VALUES ($1, $2)
     ON CONFLICT (its_number, role) DO NOTHING`,
    [itsNumber, role]
  );

  return getRolesForUser(itsNumber);
}

async function removeRole(itsNumber, role) {
  if (!STAFF_ROLES.includes(role)) {
    throw Errors.validationFailed(`"${role}" is not a valid staff role.`);
  }

  await assertUserExists(itsNumber);

  const currentRoles = await getRolesForUser(itsNumber);

  if (!currentRoles.includes(role)) {
    throw Errors.notFound(`This account does not hold the "${role}" role.`);
  }

  if (currentRoles.length === 1) {
    throw Errors.conflict(
      "Cannot remove this account's last remaining role. Assign a different role first."
    );
  }

  await db.query('DELETE FROM user_roles WHERE its_number = $1 AND role = $2', [itsNumber, role]);

  return getRolesForUser(itsNumber);
}

module.exports = { getRolesForUser, assignRole, removeRole, STAFF_ROLES };