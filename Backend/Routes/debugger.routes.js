const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const debuggerController = require('../controller/debugger.controller');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// Rate limiting
const compileLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: 'Too many compilation requests, please try again later.'
});

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
 * GET /api/debugger
 * Get debugger API documentation
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Debugger API',
        endpoints: {
            compile: {
                method: 'POST',
                path: '/compile',
                description: 'Compile code with debugging symbols',
                body: {
                    code: 'string (required, source code)',
                    language: 'string (optional, c|cpp|java|python, default: c)',
                    filename: 'string (optional, default: program)',
                    userId: 'string (optional, for logging)'
                }
            },
            compileAndRun: {
                method: 'POST',
                path: '/run',
                description: 'Compile and execute code',
                body: {
                    code: 'string (required)',
                    language: 'string (optional, default: c)',
                    input: 'string (optional, stdin)',
                    userId: 'string (optional)'
                }
            },
            debug: {
                method: 'POST',
                path: '/debug',
                description: 'Run debugger with GDB',
                body: {
                    sessionId: 'string (required)',
                    breakpoints: 'array (optional, e.g., ["main", "12"])',
                    command: 'string (optional, gdb command, default: run)',
                    userId: 'string (optional)'
                }
            },
            debugInfo: {
                method: 'GET',
                path: '/debug/:sessionId',
                description: 'Get debug session information'
            },
            languages: {
                method: 'GET',
                path: '/languages',
                description: 'Get supported languages'
            },
            cleanup: {
                method: 'POST',
                path: '/cleanup',
                description: 'Clean up old debug sessions (admin only)'
            }
        }
    });
});

/**
 * POST /api/debugger/compile
 * Compile code with debugging symbols
 */
router.post(
    '/compile',
    compileLimiter,
    [
        body('code').notEmpty().withMessage('Code is required'),
        body('language').optional().isIn(['c', 'cpp', 'java', 'python']).withMessage('Invalid language'),
        body('filename').optional().isAlphanumeric().withMessage('Filename must be alphanumeric')
    ],
    handleValidationErrors,
    async (req, res) => {
        await debuggerController.compileWithDebug(req, res);
    }
);

/**
 * POST /api/debugger/run
 * Compile and execute code
 */
router.post(
    '/run',
    compileLimiter,
    [
        body('code').notEmpty().withMessage('Code is required'),
        body('language').optional().isIn(['c', 'cpp', 'java', 'python']).withMessage('Invalid language'),
        body('input').optional().isString().withMessage('Input must be string')
    ],
    handleValidationErrors,
    async (req, res) => {
        await debuggerController.compileAndRun(req, res);
    }
);

/**
 * POST /api/debugger/debug
 * Run debugger with GDB
 */
router.post(
    '/debug',
    compileLimiter,
    [
        body('sessionId').notEmpty().withMessage('Session ID is required'),
        body('breakpoints').optional().isArray().withMessage('Breakpoints must be array'),
        body('command').optional().isString().withMessage('Command must be string')
    ],
    handleValidationErrors,
    async (req, res) => {
        await debuggerController.runDebugger(req, res);
    }
);

/**
 * GET /api/debugger/debug/:sessionId
 * Get debug session information
 */
router.get('/debug/:sessionId', (req, res) => {
    debuggerController.getDebugInfo(req, res);
});

/**
 * GET /api/debugger/languages
 * Get supported languages
 */
router.get('/languages', (req, res) => {
    debuggerController.getSupportedLanguages(req, res);
});

/**
 * POST /api/debugger/cleanup
 * Clean up old debug sessions
 */
router.post('/cleanup', auth, async (req, res) => {
    // Check if admin
    if (req.user && req.user.role === 'admin') {
        await debuggerController.cleanupSessions(req, res);
    } else {
        res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
});

module.exports = router;
