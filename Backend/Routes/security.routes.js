const express = require('express');
const router = express.Router();
const securityController = require('../controller/security.controller');
const { auth: authMiddleware } = require('../middleware/auth.middleware.js');
const { authorize } = require('../middleware/auth.middleware.js');

// Store JWT token
router.post('/store-jwt', authMiddleware, securityController.storeJWT);

// Revoke token(s)
router.post('/revoke-token', authMiddleware, securityController.revokeToken);

// Get active sessions
router.get('/sessions', authMiddleware, securityController.getActiveSessions);

// Check token status
router.post('/check-token', securityController.checkTokenStatus);

// Update token usage
router.put('/token-usage', authMiddleware, securityController.updateTokenUsage);

// Security audit logging
router.post('/audit', authMiddleware, securityController.securityAudit);

// Validate password strength
router.post('/validate-password', securityController.validatePassword);

// Get token statistics (admin only)
router.get('/stats', authMiddleware, authorize('admin'), securityController.getTokenStats);

module.exports = router;
