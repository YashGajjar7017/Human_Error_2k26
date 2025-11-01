const express = require('express');
const WebHandler = require('../controller/engine.controller');

const router = express.Router();

// .env config
require('dotenv').config();

// express.json import
router.use(express.json());

// Route grouping for better organization

// === MAIN ROUTES ===
router.get('/', WebHandler.ComplierPage);
router.get('/start', WebHandler.startPage);
router.get('/features', WebHandler.features);

// === ACCOUNT ROUTES ===
router.get('/account', WebHandler.account);
router.get('/account/user/:userState/:NO', WebHandler.accountNumber);
router.get('/account/complier/user/:NO', WebHandler.ComplierPage);

// === SESSION ROUTES ===
router.get('/session', WebHandler.session);
router.post('/session/join/token=*', WebHandler.sessionToken);
router.post('/session/share', WebHandler.sessionShare);

// === FILE MANAGEMENT ROUTES ===
router.get('/update/:fileName', WebHandler.fileupload);
router.post('/upload', WebHandler.uploadFile);

// === ERROR HANDLING ===
router.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// === GLOBAL ERROR HANDLER ===
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

module.exports = router;
