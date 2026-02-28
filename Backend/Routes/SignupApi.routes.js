const express = require('express');
const signUP = require('../controller/SignupApi.controller');
const { auth } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// RESTful signup routes mounted under the prefix used by server.js (e.g. /api/signup)
// POST /api/signup              -> register a new user
// POST /api/signup/otp          -> send OTP for an existing user
// POST /api/signup/verify-otp   -> verify provided OTP
// GET  /api/signup              -> small health/info endpoint for the signup API

/**
 * GET /api/signup
 * API documentation and health check
 */
router.get('/', (req, res) => {
    res.json({ 
        message: 'Signup API v1.0',
        status: 'operational',
        endpoints: {
            signup: 'POST /api/signup',
            sendOtp: 'POST /api/signup/otp',
            verifyOtp: 'POST /api/signup/verify-otp',
            tokenValidation: 'GET /api/signup/:signupToken'
        }
    });
});

/**
 * GET /api/signup/:signupToken
 * Validate signup token format
 */
router.get('/:signupToken', (req, res) => {
    const { signupToken } = req.params;
    res.json({ 
        message: 'Token-based signup endpoint', 
        token: signupToken,
        valid: signupToken && signupToken.length === 15
    });
});

/**
 * POST /api/signup
 * Register a new user - creates signup entry
 */
router.post('/', signUP.signUP);

/**
 * POST /api/signup/otp
 * Send OTP for email verification
 */
router.post('/otp', signUP.sendOtp);

/**
 * POST /api/signup/verify-otp
 * Verify OTP and create user account
 */
router.post('/verify-otp', signUP.verifyOtp);

/**
 * POST /api/signup/admin/force-verify
 * Admin helper: force-create a user from a signup entry (for debugging/troubleshooting)
 * Requires: admin role
 */
router.post('/admin/force-verify', auth, authorize('admin'), signUP.forceVerifySignup);

module.exports = router;
