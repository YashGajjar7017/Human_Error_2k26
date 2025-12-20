const express = require('express');
const router = express.Router();
const securityController = require('../controller/security.controller');
const { auth: authMiddleware } = require('../middleware/auth.middleware.js');

router.post('/store-jwt', authMiddleware, securityController.storeJwt);

module.exports = router;
