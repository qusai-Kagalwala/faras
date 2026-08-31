// server/modules/auth/auth.service.js
// FR-AUTH-01: every role logs in with their own ITS Number. Checks `users`
// (staff: super_admin/department/teacher) and `students` separately, since
// they're different tables — never merge the lookup query across both.
//
// MULTI-ROLE SUPPORT: a staff person can hold several roles at once (e.g.
// department head who is also a teacher and super admin) — see migration
// 019_user_roles.sql. Students are never multi-role. On login, the ACTIVE
// role for the session defaults to the highest-hierarchy assigned role
// (getHighestRole); switchRole() lets the person change it afterward
// without re-entering their password.

const db = require('../../config/db');
const { encryptPassword, decryptPassword } = require('../../utils/passwordCrypto');
const { signToken } = require('../../utils/jwt');
const { sendForgotPasswordEmail } = require('../../utils/mailer');
const { Errors } = require('../../middleware/errorHandler');
const { getHighestRole } = require('../../../shared/constants');

async function findAccountByIts(itsNumber) {
  let userResult;
  let studentResult;
  try {
    userResult = await db.query(
      'SELECT its_number, role, name, email, encrypted_password, must_change_password FROM users WHERE its_number = $1',
      [itsNumber]
    );

    if (userResult.rows.length > 0) {
      return { account: userResult.rows[0], role: userResult.rows[0].role };
    }

    studentResult = await db.query(
      'SELECT its_number, name, email, encrypted_password, must_change_password FROM students WHERE its_number = $1',
      [itsNumber]
    );
  } catch (err) {
    console.error('[FARAS] Database error in findAccountByIts:', err.message);
    throw Errors.internal();
  }

  if (studentResult.rows.length > 0) {
    return { account: studentResult.rows[0], role: 'student' };
  }

  return { account: null, role: null };
}

async function getAssignedRoles(itsNumber, fallbackRole) {
  const result = await db.query('SELECT role FROM user_roles WHERE its_number = $1', [itsNumber]);
  if (result.rows.length === 0) {
    return [fallbackRole];
  }
  return result.rows.map((r) => r.role);
}

function safeDecrypt(encryptedPassword, itsNumber) {
  try {
    return decryptPassword(encryptedPassword);
  } catch (err) {
    console.error('[FARAS] Password decryption failed for', itsNumber, ':', err.message);
    throw Errors.internal();
  }
}

function buildUserPayload(account, activeRole) {
  return {
    itsNumber: account.its_number,
    role: activeRole,
    name: account.name,
    mustChangePassword: account.must_change_password,
  };
}

async function login(itsNumber, password) {
  const { account, role } = await findAccountByIts(itsNumber);

  if (!account) {
    throw Errors.unauthorized('Invalid ITS Number or password.');
  }

  const decrypted = safeDecrypt(account.encrypted_password, itsNumber);

  if (decrypted !== password) {
    throw Errors.unauthorized('Invalid ITS Number or password.');
  }

  const assignedRoles = role === 'student' ? ['student'] : await getAssignedRoles(itsNumber, role);
  const activeRole = assignedRoles.length > 1 ? getHighestRole(assignedRoles) : assignedRoles[0];

  const token = signToken({ itsNumber: account.its_number, role: activeRole });

  return {
    token,
    user: buildUserPayload(account, activeRole),
    availableRoles: assignedRoles,
  };
}

async function switchRole(itsNumber, requestedRole) {
  const { account, role } = await findAccountByIts(itsNumber);

  if (!account || role === 'student') {
    throw Errors.forbidden('Role switching is not available for this account.');
  }

  const assignedRoles = await getAssignedRoles(itsNumber, role);

  if (!assignedRoles.includes(requestedRole)) {
    throw Errors.forbidden('You do not hold the requested role.');
  }

  const token = signToken({ itsNumber: account.its_number, role: requestedRole });

  return {
    token,
    user: buildUserPayload(account, requestedRole),
    availableRoles: assignedRoles,
  };
}

async function getMe(itsNumber, role) {
  const table = role === 'student' ? 'students' : 'users';
  const result = await db.query(`SELECT its_number, name FROM ${table} WHERE its_number = $1`, [
    itsNumber,
  ]);

  if (result.rows.length === 0) {
    throw Errors.notFound('Account no longer exists.');
  }

  const assignedRoles = role === 'student' ? ['student'] : await getAssignedRoles(itsNumber, role);

  return {
    itsNumber: result.rows[0].its_number,
    name: result.rows[0].name,
    role,
    availableRoles: assignedRoles,
  };
}

async function changePassword(itsNumber, role, currentPassword, newPassword) {
  const table = role === 'student' ? 'students' : 'users';

  const result = await db.query(
    `SELECT encrypted_password FROM ${table} WHERE its_number = $1`,
    [itsNumber]
  );

  if (result.rows.length === 0) {
    throw Errors.notFound('Account no longer exists.');
  }

  const decrypted = safeDecrypt(result.rows[0].encrypted_password, itsNumber);

  if (decrypted !== currentPassword) {
    throw Errors.unauthorized('Current password is incorrect.');
  }

  const newEncrypted = encryptPassword(newPassword);

  await db.query(
    `UPDATE ${table} SET encrypted_password = $1, must_change_password = FALSE WHERE its_number = $2`,
    [newEncrypted, itsNumber]
  );

  return { message: 'Password changed successfully.' };
}

async function forgotPassword(itsNumber) {
  const { account } = await findAccountByIts(itsNumber);

  const genericMessage = {
    message: 'If an account with that ITS Number exists, a password email has been sent.',
  };

  if (!account || !account.email) {
    return genericMessage;
  }

  let decrypted;
  try {
    decrypted = decryptPassword(account.encrypted_password);
  } catch (err) {
    console.error('[FARAS] Password decryption failed for', itsNumber, ':', err.message);
    return genericMessage;
  }

  try {
    await sendForgotPasswordEmail({
      toEmail: account.email,
      itsNumber: account.its_number,
      currentPassword: decrypted,
    });
  } catch (err) {
    console.error('[FARAS] Failed to send forgot-password email for', itsNumber, ':', err.message);
  }

  return genericMessage;
}

module.exports = {
  findAccountByIts,
  getAssignedRoles,
  login,
  switchRole,
  getMe,
  changePassword,
  forgotPassword,
};