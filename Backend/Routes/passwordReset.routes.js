const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const passwordResetController = require('../controller/passwordReset.controller');

const router = express.Router();

// Rate limiting for password reset endpoints
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 reset requests per windowMs
    message: {
        error: 'Too many password reset attempts, please try again later.'
    }
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 OTP verification requests per windowMs
    message: {
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
        message: 'Password Reset API',
        endpoints: {
            requestReset: {
                method: 'POST',
                path: '/request',
                description: 'Request password reset OTP',
                body: {
                    email: 'string (required, valid email)'
                }
            },
            verifyOTP: {
                method: 'POST',
                path: '/verify-otp',
                description: 'Verify password reset OTP',
                body: {
                    email: 'string (required, valid email)',
                    otp: 'string (required, 6 digits)'
                }
            },
            resetPassword: {
                method: 'POST',
                path: '/reset',
                description: 'Reset password with new password',
                body: {
                    resetToken: 'string (required)',
                    newPassword: 'string (required, strong password)',
                    confirmPassword: 'string (required, must match newPassword)'
                }
            }
        }
    });
});

// POST routes with validation and rate limiting
router.post(
    '/request',
    resetLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
    ],
    handleValidationErrors,
    passwordResetController.requestPasswordReset
);

router.post(
    '/verify-otp',
    otpLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('otp')
            .isLength({ min: 6, max: 6 })
            .isNumeric()
            .withMessage('OTP must be a 6-digit number')
    ],
    handleValidationErrors,
    passwordResetController.verifyPasswordResetOTP
);

router.post(
    '/reset',
    [
        body('resetToken')
            .notEmpty()
            .withMessage('Reset token is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        body('confirmPassword')
            .custom((value, { req }) => value === req.body.newPassword)
            .withMessage('Passwords do not match')
    ],
    handleValidationErrors,
    passwordResetController.resetPassword
);

module.exports = router;
