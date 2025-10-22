const express = require('express');
const loginRoute = require('../controller/login.controller');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express.Router();
app.use(bodyParser.json());

// Login routes - aligned with backend API
app.get('/Account/login', loginRoute.userIDGenerator);
app.get('/Account/login/:usrID', loginRoute.Getlogin);
app.post('/Account/login', loginRoute.Postlogin);
app.post('/Account/auth/:usr/:pass/:auth', loginRoute.AuthUser);
app.get('/Account/loginID/:loginID', loginRoute.loginID);
app.get('/Account/logout', loginRoute.logout);
app.get('/Account/check-auth', loginRoute.checkAuth);
app.post('/Account/refresh-token', loginRoute.refreshToken);

// Forgot password
app.get('/Account/forgotPassword', loginRoute.forgotPass);

module.exports = app;
