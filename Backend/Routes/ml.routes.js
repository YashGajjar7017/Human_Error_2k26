const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: './temp_uploads' });
const mlController = require('../controller/ml.controller');
const { auth: authMiddleware } = require('../middleware/auth.middleware.js');

// POST /api/ml/train - upload dataset and trigger training
router.post('/train', authMiddleware, upload.single('file'), mlController.startTraining);

module.exports = router;