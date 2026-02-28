const express = require('express');
const router = express.Router();
const clockController = require('../controller/clock.controller');

// Clock routes
router.get('/', clockController.getClockPage);
router.get('/api/time', clockController.getCurrentTime);
router.get('/api/time/:timezone', clockController.getTimeInTimezone);

module.exports = router;
