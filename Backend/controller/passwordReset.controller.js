const User = require('../models/User.model');
const OTP = require('../models/otpHandler.models');
const EmailService = require('../util/EmailService');
const bcrypt = require('bcryptjs');
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

// Request Password Reset - Send OTP - Using centralized OTP model
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "No account found with this email address."
            });
        }

        // Check for existing valid OTP
        const existingOTP = await OTP.findOne({
            email,
            purpose: 'password_reset',
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
        const otp = generateOTP(6);

        // Save OTP to centralized database
        const otpRecord = new OTP({
            email,
            otp,
            purpose: 'password_reset',
            isVerified: false,
            attempts: 0,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        await otpRecord.save();

        // Send OTP email using EmailService
        try {
            await EmailService.sendOTPEmail(email, otp, 'password_reset');
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(500).json({
                success: false,
                error: "Failed to send password reset OTP."
            });
        }

        res.status(200).json({
            success: true,
            message: "Password reset OTP sent successfully.",
            data: {
                expiresIn: 600 // 10 minutes in seconds
            }
        });
    } catch (error) {
        console.error("Error requesting password reset:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send password reset OTP."
        });
    }
};

// Verify Password Reset OTP - Using centralized OTP model
exports.verifyPasswordResetOTP = async (req, res) => {
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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found."
            });
        }

        // Find OTP record from centralized database
        const otpRecord = await OTP.findOne({
            email,
            purpose: 'password_reset',
            isVerified: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                error: "OTP not found. Please request a new password reset."
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                error: "OTP has expired. Please request a new password reset."
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

        // Generate a temporary reset token (valid for 15 minutes)
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save reset token
        await User.updateOne(
            { email },
            {
                resetToken: resetToken,
                resetTokenExpiresAt: resetTokenExpiresAt
            }
        );

        res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password.",
            data: {
                resetToken: resetToken,
                expiresIn: 900 // 15 minutes in seconds
            }
        });
    } catch (error) {
        console.error("Error verifying password reset OTP:", error);
        res.status(500).json({
            success: false,
            error: "Failed to verify OTP."
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            error: "Reset token, new password, and confirm password are required."
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            error: "Passwords do not match."
        });
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        return res.status(400).json({
            success: false,
            error: passwordValidation.message
        });
    }

    try {
        const user = await User.findOne({
            resetToken: resetToken,
            resetTokenExpiresAt: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired reset token."
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await User.updateOne(
            { _id: user._id },
            {
                password: hashedPassword,
                $unset: {
                    resetToken: "",
                    resetTokenExpiresAt: ""
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now log in with your new password."
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({
            success: false,
            error: "Failed to reset password."
        });
    }
};
