// server/controllers/authController.js
// FR-AUTH-01: every role logs in with their own ITS Number. Checks `users`
// (staff: super_admin/department/teacher) and `students` separately, since
// they're different tables — never merge the lookup query across both.

const db = require('../config/db');
const { isValidItsNumber } = require('../../shared/validators');
const { decryptPassword } = require('../utils/passwordCrypto');
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

  // Check staff (users) first, then students — a given ITS Number will only
  // ever exist in one of the two tables, never both.
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

  // Deliberately identical error for "no such account" and "wrong password" —
  // never reveal which one it was, that's a login-enumeration leak.
  if (!account) {
    return res
      .status(401)
      .json(errorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid ITS Number or password.'));
  }

  let decryptedPassword;
  try {
    decryptedPassword = decryptPassword(account.encrypted_password);
  } catch (err) {
    // Malformed/corrupted stored value — treat as an internal error, not a
    // login failure, since this points to a data problem, not a wrong password.
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

module.exports = { login };