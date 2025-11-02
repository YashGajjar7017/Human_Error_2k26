const express = require('express');
const WebHandler = require('../controller/engine.controller');

const router = express.Router();

// .env config
require('dotenv').config();

// express.json import
router.use(express.json());

// === ACCOUNT ROUTES ===
router.get('/account', WebHandler.account);
router.get('/account/user/:userState/:NO', WebHandler.accountNumber);
router.get('/account/complier/user/:NO', WebHandler.ComplierPage);

module.exports = router;