const express = require('express');
const authController = require('../controller/auth.controller');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// Main auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getCurrentUser);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Health check
router.get('/health', authController.healthCheck);

// Legacy routes for backward compatibility (can be removed later)
router.post('/usrLogin', authController.usrLogin);
router.post('/regUser', authController.regUser);
router.post('/authToken', authController.authToken);
router.post('/verifyEmail', authController.verifyEmail);
router.post('/SendOTPEmail', authController.SendOTPEmail);
router.get('/userAccept', authController.userAccept);
router.post('/regUserQR', authController.regUserQR);
router.get('/UserProtected', authController.UserProtected);
router.post('/verifyOTP', authController.verifyOTP);

module.exports = router;
