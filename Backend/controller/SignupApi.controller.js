const SignUPModel = require('../models/UserSignUp.models');
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
        // Check if the user already exists
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

        // Create new user - only pass required fields
        const newUser = new SignUPModel({
            username,
            email,
            password
        });

        await newUser.save();

        // Generate tokens for immediate login
        const accessToken = newUser.generateAccessToken();
        const refreshToken = newUser.generateRefreshToken();

        console.log("User registered successfully:", username);
        
        res.status(201).json({ 
            success: true,
            message: "User registered successfully", 
            data: {
                username: newUser.username,
                email: newUser.email,
                userId: newUser._id,
                accessToken,
                refreshToken
            }
        });
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
        const user = await SignUPModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found with this email." 
            });
        }

        const otp = generateOTP();
        const expirationTime = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        // Save OTP to user database - using a temporary storage approach
        // In production, consider using Redis or a separate OTP collection
        await SignUPModel.updateOne(
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
        const user = await SignUPModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "User not found." 
            });
        }

        if (!user.otp || !user.otpExpiresAt) {
            return res.status(400).json({ 
                success: false, 
                error: "OTP not found." 
            });
        }

        if (Date.now() > user.otpExpiresAt) {
            return res.status(400).json({ 
                success: false, 
                error: "OTP has expired." 
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid OTP." 
            });
        }

        // Clear OTP after verification
        await SignUPModel.updateOne({ email }, { $unset: { otp: "", otpExpiresAt: "" } });

        // Generate tokens after successful OTP verification
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        res.status(200).json({ 
            success: true, 
            message: "OTP verified successfully.",
            data: {
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
