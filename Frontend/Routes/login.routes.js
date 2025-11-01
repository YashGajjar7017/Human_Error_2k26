const express = require('express');
const loginRoute = require('../controller/login.controller');
const bodyParser = require('body-parser');

const app = express.Router();
app.use(bodyParser.json());

// Login routes - aligned with backend API
app.get('/login', loginRoute.userIDGenerator);
app.get('/login/:usrID', loginRoute.Getlogin);
app.post('/login', loginRoute.Postlogin);
app.post('/auth/:usr/:pass/:auth', loginRoute.AuthUser);
app.get('/loginID/:loginID', loginRoute.loginID);
app.get('/logout', loginRoute.logout);
app.get('/check-auth', loginRoute.checkAuth);
app.post('/refresh-token', loginRoute.refreshToken);

// Forgot password
app.get('/forgotPassword', loginRoute.forgotPass);

module.exports = app;
