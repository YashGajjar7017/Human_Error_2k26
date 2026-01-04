const SignUPModel = require('../models/User.model');
const SignupModel = require('../models/Signup.model');
const OTP = require('../models/otpHandler.models');
const EmailService = require('../util/EmailService');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

require('dotenv').config(); // Load environment variables

// Helper Function: Generate OTP with timestamp
const generateOTP = (length = 6) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

// Helper Function: Enhanced email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper Function: Enhanced password validation
const validatePassword = (password) => {
    if (password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long." };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter." };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one lowercase letter." };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: "Password must contain at least one number." };
    }
    if (!/[!@#$%^&*]/.test(password)) {
        return { valid: false, message: "Password must contain at least one special character (!@#$%^&*)." };
    }
    return { valid: true };
};

// Sign Up Handler
exports.signUP = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ 
            success: false,
            error: "All fields are required." 
        });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false,
            error: "Passwords do not match." 
        });
    }

    // Enhanced email validation
    if (!validateEmail(email)) {
        return res.status(400).json({ 
            success: false,
            error: "Please provide a valid email address." 
        });
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ 
            success: false,
            error: passwordValidation.message 
        });
    }

    try {
        // Check if the user already exists in User model
        const existingUser = await SignUPModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    error: "Email already registered."
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    error: "Username already taken."
                });
            }
        }

        // Check if signup already exists
        const existingSignup = await SignupModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingSignup) {
            // Update attempt metadata for retry
            try {
                await SignupModel.updateOne({ _id: existingSignup._id }, { $inc: { attempts: 1 }, $set: { lastAttemptAt: new Date() } });
            } catch (updateErr) {
                console.error('Failed to update existing signup attempts:', updateErr);
            }

            return res.status(200).json({
                success: true,
                message: 'Signup already initiated for this email or username. Use the returned signupId to request OTP.',
                data: {
                    username: existingSignup.username,
                    email: existingSignup.email,
                    signupId: existingSignup._id
                }
            });
        }

        // Create signup entry - only pass required fields
        const newSignup = new SignupModel({
            username,
            email,
            password
        });

        // Track attempt metadata
        newSignup.lastAttemptAt = new Date();
        newSignup.attempts = (newSignup.attempts || 0) + 1;

        await newSignup.save();

        console.log("Signup initiated successfully:", username);

        // If OTP is disabled in env, create the user immediately and return tokens
        if (process.env.DISABLE_SIGNUP_OTP && process.env.DISABLE_SIGNUP_OTP.toLowerCase() === 'true') {
            try {
                const newUser = new SignUPModel({
                    username: newSignup.username,
                    email: newSignup.email,
                    password: newSignup.password
                });

                // generate tokens
                await newUser.save();
                const accessToken = newUser.generateAccessToken();
                const refreshToken = newUser.generateRefreshToken();

                // Save refresh token in DB
                newUser.refreshToken = refreshToken;
                await newUser.save();

                return res.status(201).json({
                    success: true,
                    message: 'User created (OTP disabled).',
                    data: {
                        user: {
                            _id: newUser._id,
                            username: newUser.username,
                            email: newUser.email
                        },
                        accessToken,
                        refreshToken
                    }
                });
            } catch (createErr) {
                console.error('Immediate user creation failed:', createErr);
                if (createErr.code === 11000) {
                    const key = Object.keys(createErr.keyValue || {})[0] || 'field';
                    return res.status(400).json({ success: false, error: `${key} already exists.` });
                }
                return res.status(500).json({ success: false, error: 'Immediate user creation failed' });
            }
        }

        res.status(201).json({
            success: true,
            message: "Signup initiated successfully. Please verify your email with OTP.",
            data: {
                username: newSignup.username,
                email: newSignup.email,
                signupId: newSignup._id
            }
        });

        // Note: OTP sending is handled separately via /api/otp/send endpoint
    } catch (err) {
        console.error("Database Error:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({ 
                success: false,
                error: `${field} already exists.` 
            });
        }
        res.status(500).json({ 
            success: false,
            error: "Database save failed" 
        });
    }
};

// Send OTP Handler - Using centralized OTP model
exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: "Email is required."
        });
    }

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({
            success: false,
            error: "Please provide a valid email address."
        });
    }

    try {
        const signup = await SignupModel.findOne({ email });
        if (!signup) {
            return res.status(404).json({
                success: false,
                error: "Signup not found with this email. Please initiate signup first."
            });
        }

        // Check for existing valid OTP
        const existingOTP = await OTP.findOne({
            email,
            purpose: 'signup_verification',
            isVerified: false,
            expiresAt: { $gt: new Date() }
        });

        if (existingOTP) {
            const timeRemaining = Math.ceil((existingOTP.expiresAt - new Date()) / 1000);
            return res.status(429).json({
                success: false,
                error: "OTP already sent. Please wait before requesting a new one.",
                data: {
                    expiresIn: timeRemaining
                }
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to centralized database
        const otpRecord = new OTP({
            email,
            otp,
            purpose: 'signup_verification',
            isVerified: false,
            attempts: 0,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        await otpRecord.save();

        // Send OTP email using EmailService
        try {
            await EmailService.sendOTPEmail(email, otp, 'signup_verification');
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Delete OTP record if email failed
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(500).json({
                success: false,
                error: "Failed to send email. Please try again later.",
                code: "EMAIL_SEND_FAILED"
            });
        }

        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email.",
            data: {
                expiresIn: 600, // 10 minutes in seconds
                email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
            }
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send OTP. Please try again later."
        });
    }
};

// Verify OTP Handler - Using centralized OTP model
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            error: "Email and OTP are required."
        });
    }

    // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({
            success: false,
            error: "Please provide a valid email address."
        });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp.trim())) {
        return res.status(400).json({
            success: false,
            error: "OTP must be 6 digits."
        });
    }

    try {
        const signup = await SignupModel.findOne({ email });

        if (!signup) {
            return res.status(404).json({
                success: false,
                error: "Signup not found. Please initiate signup first."
            });
        }

        // Find OTP record from centralized database
        const otpRecord = await OTP.findOne({
            email,
            purpose: 'signup_verification',
            isVerified: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                error: "OTP not found. Please request a new OTP."
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                error: "OTP has expired. Please request a new OTP.",
                code: "OTP_EXPIRED"
            });
        }

        // Check attempts
        if (otpRecord.attempts >= 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({
                success: false,
                error: "Too many failed attempts. Please request a new OTP."
            });
        }

        // Verify OTP
        if (otpRecord.otp !== otp.trim()) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            const attemptsLeft = 5 - otpRecord.attempts;
            return res.status(400).json({
                success: false,
                error: `Invalid OTP. ${attemptsLeft} attempts remaining.`
            });
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        otpRecord.verifiedAt = new Date();
        await otpRecord.save();

        // Create User instance after successful OTP verification
        const newUser = new SignUPModel({
            username: signup.username,
            email: signup.email,
            password: signup.password // Password is already hashed in Signup model
        });

        try {
            await newUser.save();
        } catch (saveErr) {
            console.error('Error saving verified user:', saveErr);
            if (saveErr.code === 11000) {
                const key = Object.keys(saveErr.keyValue || {})[0] || 'field';
                return res.status(400).json({ success: false, error: `${key} already exists.` });
            }
            return res.status(500).json({ success: false, error: 'Failed to save user after OTP verification.' });
        }

        // Remove the signup entry after successful user creation
        await SignupModel.deleteOne({ email });

        // Generate tokens after successful OTP verification
        let accessToken, refreshToken;
        try {
            accessToken = newUser.generateAccessToken();
            refreshToken = newUser.generateRefreshToken();
            console.log("Tokens generated successfully for user:", newUser.username);
        } catch (tokenError) {
            console.error("Token generation failed:", tokenError);
            return res.status(500).json({
                success: false,
                error: "Failed to generate authentication tokens."
            });
        }

        console.log("User registered successfully after OTP verification:", newUser.username);

        res.status(200).json({
            success: true,
            message: "OTP verified successfully. User account created.",
            data: {
                username: newUser.username,
                email: newUser.email,
                userId: newUser._id,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            success: false,
            error: "Failed to verify OTP."
        });
    }
};

// Force-verify endpoint (admin only) to convert signup to user (useful for debugging)
exports.forceVerifySignup = async (req, res) => {
    try {
        const { email, signupId } = req.body;

        let signup;
        if (signupId) signup = await SignupModel.findById(signupId);
        if (!signup && email) signup = await SignupModel.findOne({ email });

        if (!signup) return res.status(404).json({ success: false, error: 'Signup entry not found' });

        // If user exists already, return error
        const existingUser = await SignUPModel.findOne({ $or: [{ email: signup.email }, { username: signup.username }] });
        if (existingUser) return res.status(400).json({ success: false, error: 'User already exists for this signup.' });

        const newUser = new SignUPModel({ username: signup.username, email: signup.email, password: signup.password });
        try {
            await newUser.save();
        } catch (saveErr) {
            console.error('Force-verify save error:', saveErr);
            if (saveErr.code === 11000) {
                const key = Object.keys(saveErr.keyValue || {})[0] || 'field';
                return res.status(400).json({ success: false, error: `${key} already exists.` });
            }
            return res.status(500).json({ success: false, error: 'Failed to create user from signup.' });
        }

        // Remove signup record on success
        await SignupModel.deleteOne({ _id: signup._id });

        res.json({ success: true, message: 'User created from signup (admin force-verify).', data: { userId: newUser._id } });
    } catch (err) {
        console.error('Force-verify error:', err);
        res.status(500).json({ success: false, error: 'Failed to force-verify signup' });
    }
};
