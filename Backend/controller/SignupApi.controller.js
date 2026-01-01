const SignUPModel = require('../models/User.model');
const SignupModel = require('../models/Signup.model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

require('dotenv').config(); // Load environment variables

// Helper Function: Generate OTP with timestamp
const generateOTP = (length = 6) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

// Helper Function: Check OTP attempt rate limiting
const checkOTPAttempts = async (email) => {
    const signup = await SignupModel.findOne({ email });
    if (!signup) return true;
    
    const now = new Date();
    const lastAttempt = signup.lastAttemptAt ? new Date(signup.lastAttemptAt) : null;
    
    // Allow max 5 attempts per 15 minutes
    if (lastAttempt && (now - lastAttempt) < 15 * 60 * 1000 && signup.attempts >= 5) {
        return false;
    }
    return true;
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

// Helper Function: Send Email with retry logic
const sendMail = (email, otp) => {
    return new Promise((resolve, reject) => {
        // Validate email configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email configuration missing');
            return reject(new Error('Email service not configured'));
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Sign Up',
            html: `
                <h2>Your OTP for Sign Up</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <h1 style="color: #007bff; font-size: 32px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
            `,
            text: `Your OTP is: ${otp}. This OTP is valid for 10 minutes. Please do not share it with anyone.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email sending failed:", error);
                reject(error);
            } else {
                console.log("Email sent successfully:", info.messageId);
                resolve(info.response);
            }
        });
    });
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

// Send OTP Handler
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
        // Check rate limiting
        const canSendOTP = await checkOTPAttempts(email);
        if (!canSendOTP) {
            return res.status(429).json({
                success: false,
                error: "Too many OTP attempts. Please try again in 15 minutes."
            });
        }

        const signup = await SignupModel.findOne({ email });
        if (!signup) {
            return res.status(404).json({
                success: false,
                error: "Signup not found with this email. Please initiate signup first."
            });
        }

        const otp = generateOTP();
        const expirationTime = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        // Save OTP to signup database
        await SignupModel.updateOne(
            { email },
            {
                $set: {
                    otp,
                    otpExpiresAt: new Date(expirationTime),
                    lastAttemptAt: new Date()
                },
                $inc: { attempts: 1 }
            }
        );

        try {
            await sendMail(email, otp);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
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

// Verify OTP Handler
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

        if (!signup.otp || !signup.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                error: "OTP not found. Please request a new OTP."
            });
        }

        if (Date.now() > signup.otpExpiresAt) {
            // Clear expired OTP
            await SignupModel.updateOne({ email }, { $set: { otp: null, otpExpiresAt: null } });
            return res.status(400).json({
                success: false,
                error: "OTP has expired. Please request a new OTP.",
                code: "OTP_EXPIRED"
            });
        }

        if (signup.otp !== otp.trim()) {
            return res.status(400).json({
                success: false,
                error: "Invalid OTP. Please check and try again."
            });
        }

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
