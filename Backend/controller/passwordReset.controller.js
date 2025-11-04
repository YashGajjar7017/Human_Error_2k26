const User = require('../models/User.model');
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

// Helper Function: Send Email
const sendMail = (email, otp) => {
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
            subject: 'Password Reset OTP',
            text: `Your password reset OTP is: ${otp}. This OTP is valid for 10 minutes. Please do not share it with anyone.`,
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

// Request Password Reset - Send OTP
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

        // Generate OTP
        const otp = generateOTP(6);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user
        await User.updateOne(
            { email },
            {
                otp: otp,
                otpExpiresAt: otpExpiresAt
            }
        );

        // Send OTP email
        await sendMail(email, otp);

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

// Verify Password Reset OTP
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

        if (!user.otp || !user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                error: "OTP not found. Please request a new password reset."
            });
        }

        if (Date.now() > user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                error: "OTP has expired. Please request a new password reset."
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                error: "Invalid OTP."
            });
        }

        // Generate a temporary reset token (valid for 15 minutes)
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save reset token and clear OTP
        await User.updateOne(
            { email },
            {
                resetToken: resetToken,
                resetTokenExpiresAt: resetTokenExpiresAt,
                $unset: { otp: "", otpExpiresAt: "" }
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
