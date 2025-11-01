const express = require('express');
const userController = require('../controller/user.controller');

const app = express.Router();

app.get("/Dashboard", userController.Dashboard)
app.get('/UserProfile',userController.registerUser)

module.exports = app;