const express = require('express');
const path = require('path')
const AuthController = require('../controller/adminApi.controller')
const AuthMiddleware = require('../middleware/auth.middleware')

const app = express.Router();
require('dotenv').config();

app.get('/', AuthController.homePage);

module.exports = app