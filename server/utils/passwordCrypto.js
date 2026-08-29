// server/utils/passwordCrypto.js
// Reversible password encryption — NOT hashing. This is intentional (see
// NFR-S-06 in the SRS): "forgot password" emails back the current password,
// which is only possible if we can decrypt it. Do not replace this with
// bcrypt/argon2 without a documented decision to drop the email-current-
// password flow first — this is a known, requested trade-off, not a bug.
//
// Uses AES-256-GCM: a random IV per encryption, plus an auth tag that
// detects tampering/corruption on decrypt.

const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended IV length for GCM

function getKey() {
  // PASSWORD_ENCRYPTION_KEY must decode to exactly 32 bytes for AES-256.
  // Expecting it as a hex string in .env (64 hex chars = 32 bytes).
  const key = Buffer.from(env.passwordEncryptionKey, 'hex');
  if (key.length !== 32) {
    throw new Error(
      `[FARAS] PASSWORD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes) for AES-256. ` +
        `Got ${key.length} bytes. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }
  return key;
}

function encryptPassword(plainTextPassword) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainTextPassword, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store iv + authTag + ciphertext together, colon-separated, all hex —
  // one string fits in a single DB column.
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

function decryptPassword(encryptedString) {
  const key = getKey();
  const [ivHex, authTagHex, dataHex] = encryptedString.split(':');

  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error('[FARAS] Malformed encrypted password value.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encryptPassword, decryptPassword };