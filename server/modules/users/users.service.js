// server/modules/users/users.service.js
// FR-AUTH-08: Super Admin can create, deactivate/reactivate, and assign
// roles to staff accounts. Scoped to STAFF only (super_admin/department/
// teacher) — students are managed separately and never touched here.

const db = require('../../config/db');
const { encryptPassword } = require('../../utils/passwordCrypto');
const { Errors } = require('../../middleware/errorHandler');
const { isValidItsNumber } = require('../../../shared/validators');

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

async function createAccount({ itsNumber, name, email, initialRole }) {
  if (!isValidItsNumber(itsNumber)) {
    throw Errors.validationFailed('A valid 8-digit ITS Number is required.');
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw Errors.validationFailed('A name is required.');
  }
  if (!STAFF_ROLES.includes(initialRole)) {
    throw Errors.validationFailed(`"${initialRole}" is not a valid staff role.`);
  }

  const existing = await db.query('SELECT its_number FROM users WHERE its_number = $1', [
    itsNumber,
  ]);
  if (existing.rows.length > 0) {
    throw Errors.conflict(`An account already exists for ITS Number ${itsNumber}.`);
  }

  const encryptedPassword = encryptPassword(itsNumber);

  await db.query(
    `INSERT INTO users (its_number, role, name, email, encrypted_password, must_change_password, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)`,
    [itsNumber, initialRole, name.trim(), email || null, encryptedPassword]
  );
  await db.query('INSERT INTO user_roles (its_number, role) VALUES ($1, $2)', [
    itsNumber,
    initialRole,
  ]);

  return { itsNumber, name: name.trim(), email: email || null, roles: [initialRole] };
}

async function setActive(itsNumber, isActive) {
  await assertUserExists(itsNumber);
  await db.query('UPDATE users SET is_active = $1 WHERE its_number = $2', [isActive, itsNumber]);
  return { itsNumber, isActive };
}

module.exports = {
  getRolesForUser,
  assignRole,
  removeRole,
  createAccount,
  setActive,
  STAFF_ROLES,
};