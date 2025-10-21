const express = require('express');
const signUP = require('../controller/SignupApi.controller');

const app = express.Router();

// GET routes for frontend access - keeping consistent naming
app.get('/Account/Signup', (req, res) => {
    res.json({ message: 'Signup page endpoint - use POST /Account/Signup for registration' });
});

app.get('/Account/Signup/:SignUpToken', (req, res) => {
    const { SignUpToken } = req.params;
    res.json({ 
        message: 'Token-based signup endpoint', 
        token: SignUpToken,
        valid: SignUpToken && SignUpToken.length === 15 
    });
});

// POST routes for actual signup functionality - using consistent /Account/Signup prefix
app.post('/Account/Signup', signUP.signUP);
app.post('/Account/SignupOTP', signUP.sendOtp);
app.post('/Account/verifyOTP', signUP.verifyOtp);

module.exports = app;
