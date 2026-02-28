const express = require('express');
const router = express.Router();

/**
 * Validation Routes for Form Submission
 * Provides endpoints to validate user input before submission
 */

/**
 * POST /api/validate/email
 * Validate email format and check if already registered
 */
router.post('/email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format',
            valid: false
        });
    }

    try {
        // Check if email already exists
        const User = require('../models/User.model');
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: 'Email already registered',
                valid: false,
                available: false
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email is valid and available',
            valid: true,
            available: true
        });
    } catch (error) {
        console.error('Email validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
});

/**
 * POST /api/validate/username
 * Validate username format and availability
 */
router.post('/username', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            success: false,
            message: 'Username is required'
        });
    }

    // Username validation: 3-20 chars, alphanumeric + underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({
            success: false,
            message: 'Username must be 3-20 characters, alphanumeric and underscore only',
            valid: false
        });
    }

    try {
        const User = require('../models/User.model');
        const existingUser = await User.findOne({ username: username.toLowerCase() });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: 'Username already taken',
                valid: false,
                available: false
            });
        }

        res.status(200).json({
            success: true,
            message: 'Username is available',
            valid: true,
            available: true
        });
    } catch (error) {
        console.error('Username validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
});

/**
 * POST /api/validate/password
 * Validate password strength
 */
router.post('/password', (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required'
        });
    }

    const validationResult = {
        valid: true,
        strength: 'weak',
        requirements: {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        },
        errors: []
    };

    if (password.length < 8) {
        validationResult.errors.push('Password must be at least 8 characters');
        validationResult.valid = false;
    }
    if (!/[A-Z]/.test(password)) {
        validationResult.errors.push('Must contain uppercase letter');
        validationResult.valid = false;
    }
    if (!/[a-z]/.test(password)) {
        validationResult.errors.push('Must contain lowercase letter');
        validationResult.valid = false;
    }
    if (!/[0-9]/.test(password)) {
        validationResult.errors.push('Must contain number');
        validationResult.valid = false;
    }
    if (!/[!@#$%^&*]/.test(password)) {
        validationResult.errors.push('Must contain special character (!@#$%^&*)');
        validationResult.valid = false;
    }

    // Calculate strength
    const requirementsMet = Object.values(validationResult.requirements).filter(v => v).length;
    if (requirementsMet >= 5 && password.length >= 12) {
        validationResult.strength = 'strong';
    } else if (requirementsMet >= 4) {
        validationResult.strength = 'medium';
    }

    res.status(200).json({
        success: validationResult.valid,
        message: validationResult.valid ? 'Password is strong' : 'Password does not meet requirements',
        ...validationResult
    });
});

/**
 * POST /api/validate/signup-data
 * Validate complete signup form data
 */
router.post('/signup-data', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    const errors = [];

    // Validate all fields
    if (!username) errors.push('Username is required');
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (!confirmPassword) errors.push('Confirm password is required');

    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
            valid: false
        });
    }

    try {
        const User = require('../models/User.model');
        
        // Check email availability
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        } else {
            const existingEmail = await User.findOne({ email: email.toLowerCase() });
            if (existingEmail) {
                errors.push('Email already registered');
            }
        }

        // Check username availability
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            errors.push('Username must be 3-20 characters, alphanumeric and underscore');
        } else {
            const existingUsername = await User.findOne({ username: username.toLowerCase() });
            if (existingUsername) {
                errors.push('Username already taken');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
                valid: false
            });
        }

        res.status(200).json({
            success: true,
            message: 'All validations passed',
            valid: true
        });
    } catch (error) {
        console.error('Signup validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }
});

module.exports = router;
