const express = require('express');
const loginController = require('../controller/login.controller');

const router = express.Router();

// Login route
router.post('/', loginController.login);

module.exports = router;
