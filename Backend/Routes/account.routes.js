const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const signupController = require('../controller/SignupApi.controller');

const router = express.Router();

// Rate limiting for signup endpoints
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many signup attempts, please try again later.'
    }
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 OTP requests per windowMs
    message: {
        error: 'Too many OTP requests, please try again later.'
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
router.get('/Account/Signup', (req, res) => {
    res.json({
        success: true,
        message: 'Account Signup API',
        endpoints: {
            signup: {
                method: 'POST',
                path: '/Account/Signup',
                description: 'Register a new user account',
                body: {
                    username: 'string (required)',
                    email: 'string (required, valid email)',
                    password: 'string (required, min 6 chars)',
                    confirmPassword: 'string (required, must match password)'
                }
            },
            sendOtp: {
                method: 'POST',
                path: '/Account/SignupOTP',
                description: 'Send OTP to email for verification',
                body: {
                    email: 'string (required, valid email)'
                }
            },
            verifyOtp: {
                method: 'POST',
                path: '/Account/verifyOTP',
                description: 'Verify OTP sent to email',
                body: {
                    email: 'string (required, valid email)',
                    otp: 'string (required, 6 digits)'
                }
            }
        }
    });
});

// POST routes with validation and rate limiting
router.post(
    '/Account/Signup',
    signupLimiter,
    [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        body('confirmPassword')
            .custom((value, { req }) => value === req.body.password)
            .withMessage('Passwords do not match')
    ],
    handleValidationErrors,
    signupController.signUP
);

router.post(
    '/Account/SignupOTP',
    otpLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address')
    ],
    handleValidationErrors,
    signupController.sendOtp
);

router.post(
    '/Account/verifyOTP',
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
    signupController.verifyOtp
);

module.exports = router;
