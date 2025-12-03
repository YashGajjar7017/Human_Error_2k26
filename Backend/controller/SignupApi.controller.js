const SignUPModel = require('../models/User.model');
const SignupModel = require('../models/Signup.model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

require('dotenv').config(); // Load environment variables

// Helper Function: Generate OTP
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

// Helper Function: Send Email
const sendMail = (email, otp) => {
    return new Promise((resolve, reject) => {
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
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}. This OTP is valid for 10 minutes. Please do not share it with anyone.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email sending failed:", error);
                reject(error);
            } else {
                console.log("Email sent:", info.response);
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
            if (existingSignup.email === email) {
                return res.status(400).json({
                    success: false,
                    error: "Signup already initiated for this email."
                });
            }
            if (existingSignup.username === username) {
                return res.status(400).json({
                    success: false,
                    error: "Username already taken."
                });
            }
        }

        // Create signup entry - only pass required fields
        const newSignup = new SignupModel({
            username,
            email,
            password
        });

        await newSignup.save();

        console.log("Signup initiated successfully:", username);

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
                    otpExpiresAt: new Date(expirationTime)
                }
            }
        );

        await sendMail(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            data: {
                expiresIn: 600 // 10 minutes in seconds
            }
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to send OTP." 
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

    try {
        const signup = await SignupModel.findOne({ email });

        if (!signup) {
            return res.status(404).json({
                success: false,
                error: "Signup not found."
            });
        }

        if (!signup.otp || !signup.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                error: "OTP not found."
            });
        }

        if (Date.now() > signup.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                error: "OTP has expired."
            });
        }

        if (signup.otp !== otp) {
            return res.status(400).json({
                success: false,
                error: "Invalid OTP."
            });
        }

        // Create User instance after successful OTP verification
        const newUser = new SignUPModel({
            username: signup.username,
            email: signup.email,
            password: signup.password // Password is already hashed in Signup model
        });

        await newUser.save();

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
