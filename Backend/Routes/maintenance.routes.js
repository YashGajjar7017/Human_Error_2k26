const express = require('express');
const router = express.Router();
const maintenanceController = require('../controller/maintenance.controller');
const { authenticateAdmin } = require('../middleware/admin.middleware');

// Maintenance routes
router.get('/status', maintenanceController.getMaintenanceStatus);
router.post('/enable', authenticateAdmin, maintenanceController.enableMaintenance);
router.post('/disable', authenticateAdmin, maintenanceController.disableMaintenance);
router.put('/message', authenticateAdmin, maintenanceController.updateMaintenanceMessage);
router.post('/allowed-ip/add', authenticateAdmin, maintenanceController.addAllowedIP);
router.delete('/allowed-ip/remove', authenticateAdmin, maintenanceController.removeAllowedIP);

module.exports = router;
