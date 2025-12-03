const User = require('../models/User.model');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

require('dotenv').config();

// Helper Function: Generate OTP
const generateOTP = (length = 6) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

// Helper Function: Enhanced email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper Function: Send Email
const sendMail = (email, otp, subject = 'OTP Verification', message = 'Your OTP is: ') => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransporter({
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
            subject: subject,
            text: `${message}${otp}. This OTP is valid for 10 minutes. Please do not share it with anyone.`,
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

// Send OTP for signup verification
exports.sendOTP = async (req, res) => {
    const { email, purpose = 'signup_verification' } = req.body;

    if (!email || !email.trim()) {
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
        // Check if signup exists for signup verification
        if (purpose === 'signup_verification') {
            const signup = await Signup.findOne({ email });
            if (!signup) {
                return res.status(404).json({
                    success: false,
                    error: "Signup not found. Please initiate signup first."
                });
            }
        }

        // Check if user exists for other purposes
        if (purpose !== 'signup_verification') {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found."
                });
            }
        }

        // Check for existing valid OTP
        const existingOTP = await OTP.findOne({
            email,
            purpose,
            isVerified: false,
            expiresAt: { $gt: new Date() }
        });

        if (existingOTP) {
            return res.status(429).json({
                success: false,
                error: "OTP already sent. Please wait before requesting a new one.",
                data: {
                    expiresIn: Math.floor((existingOTP.expiresAt - new Date()) / 1000)
                }
            });
        }

        // Generate and save OTP
        const otp = generateOTP(6);
        const newOTP = new OTP({
            email,
            otp,
            purpose
        });

        await newOTP.save();

        // Send OTP email
        const subject = purpose === 'password_reset' ? 'Password Reset OTP' :
                       purpose === 'email_verification' ? 'Email Verification OTP' : 'Signup Verification OTP';
        const message = purpose === 'password_reset' ? 'Your password reset OTP is: ' :
                       purpose === 'email_verification' ? 'Your email verification OTP is: ' : 'Your signup verification OTP is: ';

        await sendMail(email, otp, subject, message);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
            data: {
                expiresIn: 600, // 10 minutes in seconds
                purpose: purpose
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

// Verify OTP for signup verification
exports.verifyOTP = async (req, res) => {
    const { email, otp, purpose = 'signup_verification' } = req.body;

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
        // Find valid OTP
        const otpRecord = await OTP.findValidOTP(email, otp, purpose);

        if (!otpRecord) {
            // Check if OTP exists but is invalid/expired
            const existingOTP = await OTP.findOne({ email, purpose, isVerified: false });
            if (existingOTP) {
                if (existingOTP.attempts >= 5) {
                    return res.status(429).json({
                        success: false,
                        error: "Too many failed attempts. Please request a new OTP."
                    });
                }
                if (existingOTP.isExpired()) {
                    return res.status(400).json({
                        success: false,
                        error: "OTP has expired. Please request a new OTP."
                    });
                }
                // Increment attempts for invalid OTP
                await existingOTP.incrementAttempts();
                return res.status(400).json({
                    success: false,
                    error: "Invalid OTP."
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: "OTP not found. Please request a new OTP."
                });
            }
        }

        // Mark OTP as verified
        otpRecord.isVerified = true;
        await otpRecord.save();

        // Handle different purposes
        if (purpose === 'signup_verification') {
            // Complete signup process
            const signup = await Signup.findOne({ email });
            if (!signup) {
                return res.status(404).json({
                    success: false,
                    error: "Signup not found."
                });
            }

            // Create user account
            const newUser = new User({
                username: signup.username,
                email: signup.email,
                password: signup.password // Already hashed
            });

            await newUser.save();

            // Remove signup entry
            await Signup.deleteOne({ email });

            // Generate tokens
            const accessToken = newUser.generateAccessToken();
            const refreshToken = newUser.generateRefreshToken();

            // Update refresh token
            newUser.refreshToken = refreshToken;
            await newUser.save();

            res.status(200).json({
                success: true,
                message: "Signup verified successfully. Account created.",
                data: {
                    username: newUser.username,
                    email: newUser.email,
                    userId: newUser._id,
                    accessToken,
                    refreshToken,
                    purpose: purpose
                }
            });
        } else {
            // For other purposes (password reset, email verification)
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found."
                });
            }

            // Handle specific purpose actions
            let updateData = {};
            if (purpose === 'email_verification') {
                updateData.emailVerified = true;
            }

            if (Object.keys(updateData).length > 0) {
                await User.updateOne({ email }, updateData);
            }

            res.status(200).json({
                success: true,
                message: "OTP verified successfully.",
                data: {
                    purpose: purpose,
                    emailVerified: purpose === 'email_verification' ? true : user.emailVerified
                }
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            success: false,
            error: "Failed to verify OTP."
        });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    const { email, purpose = 'signup_verification' } = req.body;

    if (!email || !email.trim()) {
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
        // Check if signup exists for signup verification
        if (purpose === 'signup_verification') {
            const signup = await Signup.findOne({ email });
            if (!signup) {
                return res.status(404).json({
                    success: false,
                    error: "Signup not found. Please initiate signup first."
                });
            }
        }

        // Check if user exists for other purposes
        if (purpose !== 'signup_verification') {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found."
                });
            }
        }

        // Delete any existing unverified OTPs for this email and purpose
        await OTP.deleteMany({
            email,
            purpose,
            isVerified: false
        });

        // Generate and save new OTP
        const otp = generateOTP(6);
        const newOTP = new OTP({
            email,
            otp,
            purpose
        });

        await newOTP.save();

        // Send OTP email
        const subject = purpose === 'password_reset' ? 'Password Reset OTP' :
                       purpose === 'email_verification' ? 'Email Verification OTP' : 'Signup Verification OTP';
        const message = purpose === 'password_reset' ? 'Your password reset OTP is: ' :
                       purpose === 'email_verification' ? 'Your email verification OTP is: ' : 'Your signup verification OTP is: ';

        await sendMail(email, otp, subject, message);

        res.status(200).json({
            success: true,
            message: "OTP resent successfully.",
            data: {
                expiresIn: 600, // 10 minutes in seconds
                purpose: purpose
            }
        });
    } catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json({
            success: false,
            error: "Failed to resend OTP."
        });
    }
};
