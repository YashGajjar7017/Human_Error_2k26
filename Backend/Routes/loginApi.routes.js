const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const ApiLogin = require('../controller/loginApi.controller')

const app = express.Router();
app.use(bodyParser.json());

// Authentication routes
app.post('/register', ApiLogin.regUser);
app.post('/verify-token', ApiLogin.authToken);
app.post('/logout', ApiLogin.logout);

// OTP and verification routes
app.post('/register-qr', ApiLogin.regUserQR);
app.post('/verify-otp', ApiLogin.verifyOTP);
app.post('/verify-email', ApiLogin.verifyEmail);

// User management routes
app.get('/user', ApiLogin.userAccept);
app.post('/protected', ApiLogin.UserProtected);

// Health check
app.get('/health', ApiLogin.healthCheck);

module.exports = app
