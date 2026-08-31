// server/modules/auth/auth.routes.js
const express = require('express');
const { login, switchRole, getMe, changePassword, forgotPassword } = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/switch-role', authenticate, switchRole);
router.post('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;