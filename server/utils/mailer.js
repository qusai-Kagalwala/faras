// server/utils/mailer.js
// SMTP mailer — used only for the "forgot password" flow (FR-AUTH-04), which
// emails back the user's *current* password, not a reset link. This is a
// deliberate SRS-documented trade-off (NFR-S-06) — do not redesign this into
// a reset-link flow without an explicit scope change.

const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465, // true for port 465, false for 587/others (STARTTLS)
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

async function sendForgotPasswordEmail({ toEmail, itsNumber, currentPassword }) {
  const info = await transporter.sendMail({
    from: `"FARAS" <${env.smtp.user}>`,
    to: toEmail,
    subject: 'Your FARAS password',
    text:
      `Hello,\n\n` +
      `Your FARAS login details:\n` +
      `ITS Number: ${itsNumber}\n` +
      `Password: ${currentPassword}\n\n` +
      `You can change your password anytime after logging in.\n\n` +
      `— FARAS`,
  });

  return info;
}

module.exports = { transporter, sendForgotPasswordEmail };