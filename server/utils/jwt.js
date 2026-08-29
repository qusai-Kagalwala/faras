// server/utils/jwt.js
// Session token sign/verify. Every authenticated request carries one of
// these; requireRole() (T-04) expects req.user to be populated from a
// verified token by an upstream auth middleware (built in a later task).

const jwt = require('jsonwebtoken');
const env = require('../config/env');

const DEFAULT_EXPIRY = '7d'; // FR-AUTH-07: sessions expire after a configurable duration

function signToken(payload, options = {}) {
  // payload should be the minimum needed to identify + authorize the user —
  // e.g. { itsNumber, role } — never put the encrypted password or any
  // other secret in here; JWT payloads are base64, not encrypted.
  return jwt.sign(payload, env.sessionSecret, {
    expiresIn: options.expiresIn || DEFAULT_EXPIRY,
  });
}

function verifyToken(token) {
  // Throws (TokenExpiredError, JsonWebTokenError, etc.) on invalid/expired
  // tokens — callers must catch, not assume this always succeeds.
  return jwt.verify(token, env.sessionSecret);
}

module.exports = { signToken, verifyToken, DEFAULT_EXPIRY };