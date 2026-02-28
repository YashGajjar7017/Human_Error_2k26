const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const sessionTrackingController = require('../controller/session-tracking.controller');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

/**
 * GET /api/session-tracking
 * API documentation
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Session Tracking API',
        endpoints: {
            createSession: {
                method: 'POST',
                path: '/create',
                description: 'Create a new session',
                body: { userId: 'string (required)' }
            },
            trackPageView: {
                method: 'POST',
                path: '/page-view',
                description: 'Track a page view',
                body: {
                    sessionId: 'string (required)',
                    url: 'string (required)',
                    path: 'string',
                    referrer: 'string',
                    timeSpent: 'number',
                    scrollDepth: 'number'
                }
            },
            trackEvent: {
                method: 'POST',
                path: '/event',
                description: 'Track user event',
                body: {
                    sessionId: 'string (required)',
                    eventType: 'string (required: click|form_submit|search|navigation|download|error|custom)',
                    eventName: 'string',
                    elementId: 'string',
                    metadata: 'object'
                }
            },
            endSession: {
                method: 'POST',
                path: '/end',
                description: 'End a session',
                body: { sessionId: 'string (required)' }
            },
            getSessionDetails: {
                method: 'GET',
                path: '/details/:sessionId',
                description: 'Get session details'
            },
            getUserSessions: {
                method: 'GET',
                path: '/user/:userId',
                description: 'Get user sessions',
                query: {
                    limit: 'number (default: 10)',
                    skip: 'number (default: 0)'
                }
            },
            getBehaviorAnalytics: {
                method: 'GET',
                path: '/analytics/:userId',
                description: 'Get user behavior analytics'
            },
            trackError: {
                method: 'POST',
                path: '/error',
                description: 'Track error',
                body: {
                    sessionId: 'string (required)',
                    type: 'string (required)',
                    message: 'string',
                    stackTrace: 'string'
                }
            }
        }
    });
});

/**
 * POST /api/session-tracking/create
 * Create a new session
 */
router.post(
    '/create',
    [
        body('userId')
            .notEmpty()
            .withMessage('User ID is required')
            .isMongoId()
            .withMessage('Invalid user ID format')
    ],
    handleValidationErrors,
    async (req, res) => {
        await sessionTrackingController.createSession(req, res);
    }
);

/**
 * POST /api/session-tracking/page-view
 * Track page view
 */
router.post(
    '/page-view',
    [
        body('sessionId')
            .notEmpty()
            .withMessage('Session ID is required'),
        body('url')
            .notEmpty()
            .withMessage('URL is required')
            .isURL()
            .withMessage('Invalid URL format'),
        body('timeSpent')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Time spent must be non-negative'),
        body('scrollDepth')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('Scroll depth must be between 0 and 100')
    ],
    handleValidationErrors,
    async (req, res) => {
        await sessionTrackingController.trackPageView(req, res);
    }
);

/**
 * POST /api/session-tracking/event
 * Track user event
 */
router.post(
    '/event',
    [
        body('sessionId')
            .notEmpty()
            .withMessage('Session ID is required'),
        body('eventType')
            .notEmpty()
            .withMessage('Event type is required')
            .isIn(['click', 'form_submit', 'search', 'navigation', 'download', 'error', 'custom'])
            .withMessage('Invalid event type'),
        body('eventName')
            .optional()
            .isString()
            .withMessage('Event name must be string')
    ],
    handleValidationErrors,
    async (req, res) => {
        await sessionTrackingController.trackEvent(req, res);
    }
);

/**
 * POST /api/session-tracking/end
 * End session
 */
router.post(
    '/end',
    [
        body('sessionId')
            .notEmpty()
            .withMessage('Session ID is required')
    ],
    handleValidationErrors,
    async (req, res) => {
        await sessionTrackingController.endSession(req, res);
    }
);

/**
 * GET /api/session-tracking/details/:sessionId
 * Get session details
 */
router.get(
    '/details/:sessionId',
    [
        param('sessionId')
            .notEmpty()
            .withMessage('Session ID is required')
    ],
    handleValidationErrors,
    async (req, res) => {
        await sessionTrackingController.getSessionDetails(req, res);
    }
);

/**
 * GET /api/session-tracking/user/:userId
 * Get user sessions
 */
router.get(
    '/user/:userId',
    [
        param('userId')
            .isMongoId()
            .withMessage('Invalid user ID format'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        query('skip')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Skip must be non-negative')
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        // Only allow users to view their own sessions or admins
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        await sessionTrackingController.getUserSessions(req, res);
    }
);

/**
 * GET /api/session-tracking/analytics/:userId
 * Get user behavior analytics
 */
router.get(
    '/analytics/:userId',
    [
        param('userId')
            .isMongoId()
            .withMessage('Invalid user ID format')
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        await sessionTrackingController.getBehaviorAnalytics(req, res);
    }
);

/**
 * POST /api/session-tracking/error
 * Track error
 */
router.post(
    '/error',
    [
        body('sessionId')
            .notEmpty()
            .withMessage('Session ID is required'),
        body('type')
            .notEmpty()
            .withMessage('Error type is required'),
        body('message')
            .optional()
            .isString()
            .withMessage('Message must be string')
    ],
    handleValidationErrors,
    async (req, res) => {
        await sessionTrackingController.trackError(req, res);
    }
);

module.exports = router;
