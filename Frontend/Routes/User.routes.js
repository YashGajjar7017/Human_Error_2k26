const express = require('express');
const userController = require('../controller/user.controller');

const app = express.Router();

app.get("/Account/Dashboard", userController.Dashboard)
app.get('/Account/UserProfile',userController.registerUser)

module.exports = app;