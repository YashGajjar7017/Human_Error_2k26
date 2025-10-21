const express = require('express');
const router = express.Router();
const analyticsController = require('../controller/analytics.controller');
// const authMiddleware = require('../middleware/auth.middleware');
const { auth: authMiddleware } = require('../middleware/auth.middleware.js');

// User analytics
router.get('/user/overview', authMiddleware, analyticsController.getUserAnalytics);
router.get('/user/activity', authMiddleware, analyticsController.getUserActivityAnalytics);
router.get('/user/performance', authMiddleware, analyticsController.getUserPerformanceAnalytics);
router.get('/user/trends', authMiddleware, analyticsController.getUserTrends);

// System analytics
router.get('/system/overview', authMiddleware, analyticsController.getSystemAnalytics);
router.get('/system/usage', authMiddleware, analyticsController.getSystemUsageAnalytics);
router.get('/system/performance', authMiddleware, analyticsController.getSystemPerformanceAnalytics);
router.get('/system/real-time', analyticsController.getRealTimeAnalytics);

// Code analytics
router.get('/code/overview', authMiddleware, analyticsController.getCodeAnalytics);
router.get('/code/language-stats', authMiddleware, analyticsController.getLanguageStats);
router.get('/code/error-patterns', authMiddleware, analyticsController.getErrorPatterns);
router.get('/code/success-rate', authMiddleware, analyticsController.getCodeSuccessRate);

// Compilation analytics
router.get('/compilation/overview', authMiddleware, analyticsController.getCompilationAnalytics);
router.get('/compilation/history', authMiddleware, analyticsController.getCompilationHistory);
router.get('/compilation/efficiency', authMiddleware, analyticsController.getCompilationEfficiency);

// Export analytics
router.get('/export/user-data', authMiddleware, analyticsController.exportUserAnalytics);
router.get('/export/system-data', authMiddleware, analyticsController.exportSystemAnalytics);

// Custom analytics
router.post('/custom/query', authMiddleware, analyticsController.runCustomQuery);
router.get('/custom/reports', authMiddleware, analyticsController.getCustomReports);

module.exports = router;
