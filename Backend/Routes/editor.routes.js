const express = require('express');
const router = express.Router();
const editorCtrl = require('../controller/editor.controller');

// List directory
router.get('/list', editorCtrl.listDir);

// Read file (POST for body path)
router.post('/read', express.json(), editorCtrl.readFile);

// Write file
router.post('/write', express.json(), editorCtrl.writeFile);

// Endpoint to receive sync updates from a watcher tool
router.post('/sync', express.json(), editorCtrl.syncReceive);

module.exports = router;
