// server/controllers/authController.js
// FR-AUTH-01: every role logs in with their own ITS Number. Checks `users`
// (staff: super_admin/department/teacher) and `students` separately, since
// they're different tables — never merge the lookup query across both.

const db = require('../config/db');
const { isValidItsNumber } = require('../../shared/validators');
const { encryptPassword, decryptPassword } = require('../utils/passwordCrypto');
const { signToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../../shared/schemas/apiResponse');
const { ERROR_CODES } = require('../../shared/constants');

async function login(req, res) {
  const { itsNumber, password } = req.body;

  if (!isValidItsNumber(itsNumber) || typeof password !== 'string' || password.length === 0) {
    return res
      .status(400)
      .json(errorResponse(ERROR_CODES.VALIDATION_FAILED, 'ITS Number and password are required.'));
  }

  const userResult = await db.query(
    'SELECT its_number, role, name, encrypted_password, must_change_password FROM users WHERE its_number = $1',
    [itsNumber]
  );

  let account = null;
  let role = null;

  if (userResult.rows.length > 0) {
    account = userResult.rows[0];
    role = account.role;
  } else {
    const studentResult = await db.query(
      'SELECT its_number, name, encrypted_password, must_change_password FROM students WHERE its_number = $1',
      [itsNumber]
    );
    if (studentResult.rows.length > 0) {
      account = studentResult.rows[0];
      role = 'student';
    }
  }

  if (!account) {
    return res
      .status(401)
      .json(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid ITS Number or password.'));
  }

  let decryptedPassword;
  try {
    decryptedPassword = decryptPassword(account.encrypted_password);
  } catch (err) {
    console.error('[FARAS] Password decryption failed for', itsNumber, ':', err.message);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_ERROR, 'Something went wrong. Please try again.'));
  }

  if (decryptedPassword !== password) {
    return res
      .status(401)
      .json(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid ITS Number or password.'));
  }

  const token = signToken({ itsNumber: account.its_number, role });

  return res.status(200).json(
    successResponse({
      token,
      user: {
        itsNumber: account.its_number,
        role,
        name: account.name,
        mustChangePassword: account.must_change_password,
      },
    })
  );
}

async function getMe(req, res) {
  const { itsNumber, role } = req.user;

  const table = role === 'student' ? 'students' : 'users';
  const result = await db.query(
    `SELECT its_number, name FROM ${table} WHERE its_number = $1`,
    [itsNumber]
  );

  if (result.rows.length === 0) {
    return res
      .status(404)
      .json(errorResponse(ERROR_CODES.NOT_FOUND, 'Account no longer exists.'));
  }

  return res.status(200).json(
    successResponse({
      itsNumber: result.rows[0].its_number,
      name: result.rows[0].name,
      role,
    })
  );
}

async function changePassword(req, res) {
  // FR-AUTH-03: any logged-in user can change their own password. Requires
  // the current password to prevent someone with a stolen-but-still-valid
  // token from silently locking the real owner out.
  const { itsNumber, role } = req.user;
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    return res
      .status(400)
      .json(errorResponse(ERROR_CODES.VALIDATION_FAILED, 'Current password is required.'));
  }

  if (typeof newPassword !== 'string' || newPassword.length < 4) {
    return res
      .status(400)
      .json(
        errorResponse(
          ERROR_CODES.VALIDATION_FAILED,
          'New password must be at least 4 characters.'
        )
      );
  }

  const table = role === 'student' ? 'students' : 'users';

  const result = await db.query(
    `SELECT encrypted_password FROM ${table} WHERE its_number = $1`,
    [itsNumber]
  );

  if (result.rows.length === 0) {
    return res
      .status(404)
      .json(errorResponse(ERROR_CODES.NOT_FOUND, 'Account no longer exists.'));
  }

  let decryptedCurrent;
  try {
    decryptedCurrent = decryptPassword(result.rows[0].encrypted_password);
  } catch (err) {
    console.error('[FARAS] Password decryption failed for', itsNumber, ':', err.message);
    return res
      .status(500)
      .json(errorResponse(ERROR_CODES.INTERNAL_ERROR, 'Something went wrong. Please try again.'));
  }

  if (decryptedCurrent !== currentPassword) {
    return res
      .status(401)
      .json(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Current password is incorrect.'));
  }

  const newEncrypted = encryptPassword(newPassword);

  await db.query(
    `UPDATE ${table} SET encrypted_password = $1, must_change_password = FALSE WHERE its_number = $2`,
    [newEncrypted, itsNumber]
  );

  return res.status(200).json(successResponse({ message: 'Password changed successfully.' }));
}

module.exports = { login, getMe, changePassword };