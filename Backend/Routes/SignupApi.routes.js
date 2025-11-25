const express = require('express');
const signUP = require('../controller/SignupApi.controller');

const router = express.Router();

// RESTful signup routes mounted under the prefix used by server.js (e.g. /api/signup)
// POST /api/signup              -> register a new user
// POST /api/signup/otp          -> send OTP for an existing user
// POST /api/signup/verify-otp   -> verify provided OTP
// GET  /api/signup              -> small health/info endpoint for the signup API
router.get('/', (req, res) => {
    res.json({ message: 'Signup API root - use POST /api/signup to register' });
});

router.get('/:signupToken', (req, res) => {
    const { signupToken } = req.params;
    res.json({ 
        message: 'Token-based signup endpoint', 
        token: signupToken,
        valid: signupToken && signupToken.length === 15
    });
});

router.post('/', signUP.signUP);
router.post('/otp', signUP.sendOtp);
router.post('/verify-otp', signUP.verifyOtp);

module.exports = router;
