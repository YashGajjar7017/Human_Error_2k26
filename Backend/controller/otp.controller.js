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

// Send OTP for general purposes
exports.sendOTP = async (req, res) => {
    const { email, purpose = 'verification' } = req.body;

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
        // Check if user exists (optional, depending on use case)
        const user = await User.findOne({ email });

        // Generate OTP
        const otp = generateOTP(6);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user if they exist
        if (user) {
            await User.updateOne(
                { email },
                {
                    otp: otp,
                    otpExpiresAt: otpExpiresAt
                }
            );
        }

        // Send OTP email
        const subject = purpose === 'password_reset' ? 'Password Reset OTP' : 'OTP Verification';
        const message = purpose === 'password_reset' ? 'Your password reset OTP is: ' : 'Your verification OTP is: ';

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

// Verify OTP for general purposes
exports.verifyOTP = async (req, res) => {
    const { email, otp, purpose = 'verification' } = req.body;

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
                error: "OTP not found. Please request a new OTP."
            });
        }

        if (Date.now() > user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                error: "OTP has expired. Please request a new OTP."
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                error: "Invalid OTP."
            });
        }

        // Clear OTP after successful verification
        await User.updateOne(
            { email },
            {
                $unset: { otp: "", otpExpiresAt: "" },
                emailVerified: purpose === 'email_verification' ? true : user.emailVerified
            }
        );

        res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
            data: {
                purpose: purpose,
                emailVerified: purpose === 'email_verification' ? true : user.emailVerified
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

// Resend OTP
exports.resendOTP = async (req, res) => {
    const { email, purpose = 'verification' } = req.body;

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
                error: "User not found."
            });
        }

        // Generate new OTP
        const otp = generateOTP(6);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save new OTP
        await User.updateOne(
            { email },
            {
                otp: otp,
                otpExpiresAt: otpExpiresAt
            }
        );

        // Send OTP email
        const subject = purpose === 'password_reset' ? 'Password Reset OTP' : 'OTP Verification';
        const message = purpose === 'password_reset' ? 'Your password reset OTP is: ' : 'Your verification OTP is: ';

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
