/**
 * Admin Routes - Routes for administrative operations
 * Maps HTTP endpoints to admin controller methods
 */

const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const AdminController = require('../controller/admin.controller');
const AuthMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

// Public routes
router.get('/login', (req, res) => {
    res.sendFile(path.join(rootDir, 'views', 'admin', 'login.html'));
});

router.post('/login', AdminController.adminLogin);

// Protected routes - require admin authentication
router.use(AuthMiddleware.isAdmin);

// Dashboard
router.get('/', AdminController.dashboard);
router.get('/dashboard', AdminController.dashboard);

// User management routes
router.get('/users', AdminController.getUsers);
router.post('/users', AuthMiddleware.validateUserCreation, AdminController.createUser);
router.put('/users/:id', AuthMiddleware.validateUserId, AdminController.updateUser);
router.delete('/users/:id', AuthMiddleware.validateUserId, AdminController.deleteUser);

// Service management routes
router.get('/services', AdminController.getServices);
router.put('/services/:id/status', AuthMiddleware.validateServiceId, AuthMiddleware.validateServiceStatusUpdate, AdminController.updateServiceStatus);

// System routes
router.get('/logs', AdminController.getSystemLogs);
router.post('/settings', AdminController.updateSettings);
router.post('/backup', AdminController.createBackup);

// Analytics
router.get('/analytics', AdminController.getAnalytics);

// Logout
router.post('/logout', AdminController.adminLogout);

module.exports = router;
