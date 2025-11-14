/**
 * Member Middleware
 * Validates member-related requests
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Validate member input data
 */
const validateMemberInput = [
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
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be either "user" or "admin"'),
    
    // Error handler middleware
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

/**
 * Validate member ID
 */
const validateMemberId = [
    param('memberId')
        .isMongoId()
        .withMessage('Invalid member ID format'),
    
    // Error handler middleware
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validate plan upgrade
 */
const validatePlanUpgrade = [
    body('plan')
        .isIn(['free', 'pro', 'enterprise'])
        .withMessage('Invalid plan type'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validate member suspension
 */
const validateMemberSuspension = [
    body('reason')
        .optional()
        .trim()
        .isLength({ min: 5 })
        .withMessage('Reason must be at least 5 characters long'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validate profile update
 */
const validateProfileUpdate = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters'),
    
    body('socialLinks')
        .optional()
        .isObject()
        .withMessage('Social links must be an object'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validate settings update
 */
const validateSettingsUpdate = [
    body('notifications')
        .optional()
        .isObject()
        .withMessage('Notifications must be an object'),
    
    body('privacy')
        .optional()
        .isObject()
        .withMessage('Privacy settings must be an object'),
    
    body('theme')
        .optional()
        .isIn(['light', 'dark', 'auto'])
        .withMessage('Theme must be light, dark, or auto'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateMemberInput,
    validateMemberId,
    validatePlanUpgrade,
    validateMemberSuspension,
    validateProfileUpdate,
    validateSettingsUpdate
};
