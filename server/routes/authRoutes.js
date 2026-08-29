// server/routes/authRoutes.js
const express = require('express');
const { login, getMe, changePassword, forgotPassword } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;