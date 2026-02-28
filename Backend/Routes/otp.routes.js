const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const otpController = require('../controller/otp-improved.controller');

const router = express.Router();

// Rate limiting for OTP endpoints
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 OTP requests per windowMs
    message: {
        success: false,
        error: 'Too many OTP requests, please try again later.'
    }
});

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 OTP verification attempts per windowMs
    message: {
        success: false,
        error: 'Too many OTP verification attempts, please try again later.'
    }
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// GET route - provide API documentation
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'OTP API',
        endpoints: {
            sendOTP: {
                method: 'POST',
                path: '/send',
                description: 'Send OTP to email for verification',
                body: {
                    email: 'string (required, valid email)',
                    purpose: 'string (optional, e.g., "signup_verification", "password_reset", "email_verification")'
                }
            },
            verifyOTP: {
                method: 'POST',
                path: '/verify',
                description: 'Verify OTP sent to email',
                body: {
                    email: 'string (required, valid email)',
                    otp: 'string (required, 6 digits)',
                    purpose: 'string (optional, e.g., "signup_verification", "password_reset", "email_verification")'
                }
            },
            resendOTP: {
                method: 'POST',
                path: '/resend',
                description: 'Resend OTP to email',
                body: {
                    email: 'string (required, valid email)',
                    purpose: 'string (optional, e.g., "signup_verification", "password_reset", "email_verification")'
                }
            }
        }
    });
});

// POST routes with validation and rate limiting
router.post(
    '/send',
    otpLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('purpose')
            .optional()
            .isIn(['signup_verification', 'password_reset', 'email_verification'])
            .withMessage('Purpose must be one of: signup_verification, password_reset, email_verification')
    ],
    handleValidationErrors,
    otpController.sendOTPImproved
);

router.post(
    '/verify',
    verifyLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('otp')
            .isLength({ min: 6, max: 6 })
            .isNumeric()
            .withMessage('OTP must be a 6-digit number'),
        body('purpose')
            .optional()
            .isIn(['signup_verification', 'password_reset', 'email_verification'])
            .withMessage('Purpose must be one of: signup_verification, password_reset, email_verification')
    ],
    handleValidationErrors,
    otpController.verifyOTPImproved
);

router.post(
    '/resend',
    otpLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('purpose')
            .optional()
            .isIn(['signup_verification', 'password_reset', 'email_verification'])
            .withMessage('Purpose must be one of: signup_verification, password_reset, email_verification')
    ],
    handleValidationErrors,
    otpController.resendOTPImproved
);

// Enhanced verification with database backup methods
router.post(
    '/verify-advanced',
    verifyLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('otp')
            .isLength({ min: 6, max: 6 })
            .isNumeric()
            .withMessage('OTP must be a 6-digit number'),
        body('purpose')
            .optional()
            .isIn(['signup_verification', 'password_reset', 'email_verification'])
            .withMessage('Purpose must be one of: signup_verification, password_reset, email_verification')
    ],
    handleValidationErrors,
    (req, res) => otpController.verifyOTPWithDBBackup(req, res)
);

// Get verification status
router.get(
    '/status/:email',
    (req, res) => otpController.getOTPVerificationStatus(req, res)
);

module.exports = router;

