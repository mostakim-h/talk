const express = require('express');
const {register, login, getUser, refreshToken, logout, sendEmailToVerifyUserEmail, verifyEmail,
  sendEmailToResetPassword, resetPassword
} = require("../controllers/authControllers");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../utils/validateUtils");
const {registerValidator, loginValidator} = require("../validators/authValidator");
const authRateLimiter = require("../middlewares/rateLimiterMiddleware");
router = express.Router();

router.post('/login', authRateLimiter, validate(loginValidator), login);
router.post('/register', validate(registerValidator), register);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/user', authMiddleware, getUser);
router.post('/send-email/email-verification', authMiddleware, sendEmailToVerifyUserEmail);
router.post('/verify-email', verifyEmail);
router.post('/send-email/password-reset', sendEmailToResetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;