const express = require('express');
const router = express.Router();
const maintenanceController = require('../controller/maintenance.controller');

// Maintenance routes
router.get('/status', maintenanceController.getMaintenanceStatus);
router.post('/enable', maintenanceController.enableMaintenance);
router.post('/disable', maintenanceController.disableMaintenance);
router.put('/message', maintenanceController.updateMaintenanceMessage);
router.post('/allowed-ip/add', maintenanceController.addAllowedIP);
router.delete('/allowed-ip/remove', maintenanceController.removeAllowedIP);

module.exports = router;
