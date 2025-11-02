const express = require('express');
const path = require('path')
const AuthController = require('../controller/adminApi.controller')
const AuthMiddleware = require('../middleware/auth.middleware')

const app = express.Router();
require('dotenv').config();

// Apply admin authorization to all admin routes
app.use(AuthMiddleware.authorize('admin'));

app.get('/', AuthController.homePage);

// Admin XML config routes
app.get('/config', AuthController.getAdminConfig);
app.put('/config', AuthController.updateAdminConfig);

// Maintenance control routes (proxy to maintenance server)
app.get('/maintenance/status', AuthController.getMaintenanceStatus);
app.post('/maintenance/enable', AuthController.enableMaintenance);
app.post('/maintenance/disable', AuthController.disableMaintenance);
app.put('/maintenance/message', AuthController.updateMaintenanceMessage);
app.post('/maintenance/allowed-ip/add', AuthController.addAllowedIP);
app.delete('/maintenance/allowed-ip/remove', AuthController.removeAllowedIP);

// Additional routes for frontend admin panel
app.get('/dashboard', AuthController.homePage);
app.get('/users', AuthController.getAllUsers);
app.delete('/users/:id', AuthController.deleteUser);
app.get('/maintenance/status', AuthController.getMaintenanceStatusForAdmin);

// System settings routes
app.get('/settings', AuthController.getSettings);
app.put('/settings', AuthController.saveSettings);

// Analytics route
app.get('/analytics', AuthController.getAnalytics);

// Logs route
app.get('/logs', AuthController.getLogs);

// Remove allowed IP route
app.delete('/maintenance/allowed-ip/remove', AuthController.removeAllowedIP);

module.exports = app
