const express = require('express');
const path = require('path');
const AdminController = require('../controller/admin.controller');

const router = express.Router();

// Serve admin panel
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

// API routes for admin functionality
router.get('/api/dashboard', AdminController.dashboard);
router.get('/api/users', AdminController.getUsers);
router.post('/api/users', AdminController.createUser);
router.put('/api/users/:id', AdminController.updateUser);
router.delete('/api/users/:id', AdminController.deleteUser);
router.get('/api/services', AdminController.getServices);
router.put('/api/services/:id/status', AdminController.updateServiceStatus);
router.get('/api/logs', AdminController.getSystemLogs);
router.put('/api/settings', AdminController.updateSettings);
router.post('/api/backup', AdminController.createBackup);
router.get('/api/analytics', AdminController.getAnalytics);
router.post('/api/login', AdminController.adminLogin);
router.post('/api/logout', AdminController.adminLogout);

module.exports = router;
