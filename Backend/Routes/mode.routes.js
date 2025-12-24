const express = require('express');
const router = express.Router();
const modeController = require('../controller/mode.controller');
const { auth, optionalAuth } = require('../middleware/auth.middleware');

router.get('/', modeController.getMode);
router.post('/set', auth, modeController.setMode);
router.post('/launch', auth, modeController.launchElectron);

module.exports = router;
