const User = require('../models/User.model');
const Signup = require('../models/Signup.model');
const OTP = require('../models/otpHandler.models');
const EmailService = require('../util/EmailService');
const mongoose = require('mongoose');

require('dotenv').config();

/**
 * Enhanced OTP Controller with improved email delivery
 */
class OTPController {
    /**
     * Generate OTP
     */
    generateOTP(length = 6) {
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Send OTP - Improved version with better error handling
     */
    async sendOTPImproved(req, res) {
        const { email, purpose = 'signup_verification' } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                error: "Email is required."
            });
        }

        if (!this.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid email address."
            });
        }

        try {
            // Check if user/signup exists
            if (purpose === 'signup_verification') {
                const signup = await Signup.findOne({ email });
                if (!signup) {
                    return res.status(404).json({
                        success: false,
                        error: "Signup not found. Please initiate signup first."
                    });
                }
            } else {
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        error: "User not found."
                    });
                }
            }

            // Check for rate limiting
            const existingOTP = await OTP.findOne({
                email,
                purpose,
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
            const otp = this.generateOTP(6);
            
            // Save OTP to database
            const otpRecord = new OTP({
                email,
                otp,
                purpose,
                isVerified: false,
                attempts: 0,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            });

            await otpRecord.save();
            console.log(`[OTP] Generated OTP for ${email}: ${otp}`);

            // Send email with improved error handling
            try {
                await EmailService.sendOTPEmail(email, otp, purpose);
                
                console.log(`[OTP] Email sent successfully to ${email}`);
                
                return res.status(200).json({
                    success: true,
                    message: "OTP sent successfully to your email.",
                    data: {
                        expiresIn: 600, // 10 minutes in seconds
                        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
                        purpose: purpose
                    }
                });
            } catch (emailError) {
                console.error(`[OTP] Email sending failed:`, emailError.message);
                
                // Delete the OTP record if email failed
                await OTP.deleteOne({ _id: otpRecord._id });
                
                return res.status(500).json({
                    success: false,
                    error: "Failed to send OTP email. Please check your email configuration.",
                    details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
                });
            }

        } catch (error) {
            console.error("[OTP] Error sending OTP:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to send OTP. Please try again later.",
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Verify OTP
     */
    async verifyOTPImproved(req, res) {
        const { email, otp, purpose = 'signup_verification' } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: "Email and OTP are required."
            });
        }

        if (!this.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid email address."
            });
        }

        try {
            // Find OTP record
            const otpRecord = await OTP.findOne({
                email,
                purpose,
                isVerified: false
            });

            if (!otpRecord) {
                return res.status(404).json({
                    success: false,
                    error: "No OTP found. Please request a new one."
                });
            }

            // Check if OTP is expired
            if (new Date() > otpRecord.expiresAt) {
                await OTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({
                    success: false,
                    error: "OTP has expired. Please request a new one."
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
                    error: `Invalid OTP. ${attemptsLeft} attempts remaining.`,
                    attemptsLeft: attemptsLeft
                });
            }

            // Mark OTP as verified
            otpRecord.isVerified = true;
            otpRecord.verifiedAt = new Date();
            await otpRecord.save();

            return res.status(200).json({
                success: true,
                message: "OTP verified successfully.",
                data: {
                    email: email,
                    purpose: purpose,
                    verified: true
                }
            });

        } catch (error) {
            console.error("[OTP] Error verifying OTP:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to verify OTP. Please try again later."
            });
        }
    }

    /**
     * Resend OTP
     */
    async resendOTPImproved(req, res) {
        const { email, purpose = 'signup_verification' } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                error: "Email is required."
            });
        }

        if (!this.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: "Please provide a valid email address."
            });
        }

        try {
            // Delete existing OTP
            await OTP.deleteMany({
                email,
                purpose,
                isVerified: false
            });

            // Generate new OTP
            const otp = this.generateOTP(6);
            
            const otpRecord = new OTP({
                email,
                otp,
                purpose,
                isVerified: false,
                attempts: 0,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            });

            await otpRecord.save();
            console.log(`[OTP] Resent OTP for ${email}: ${otp}`);

            // Send email
            try {
                await EmailService.sendOTPEmail(email, otp, purpose);
                
                return res.status(200).json({
                    success: true,
                    message: "OTP resent successfully.",
                    data: {
                        expiresIn: 600,
                        email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
                        purpose: purpose
                    }
                });
            } catch (emailError) {
                console.error(`[OTP] Email sending failed:`, emailError.message);
                
                await OTP.deleteOne({ _id: otpRecord._id });
                
                return res.status(500).json({
                    success: false,
                    error: "Failed to resend OTP email."
                });
            }

        } catch (error) {
            console.error("[OTP] Error resending OTP:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to resend OTP. Please try again later."
            });
        }
    }

    /**
     * Get OTP status
     */
    async getOTPStatus(req, res) {
        const { email, purpose = 'signup_verification' } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required."
            });
        }

        try {
            const otpRecord = await OTP.findOne({
                email,
                purpose,
                isVerified: false
            });

            if (!otpRecord) {
                return res.json({
                    success: true,
                    data: {
                        exists: false,
                        message: "No pending OTP found."
                    }
                });
            }

            const now = new Date();
            const expiresAt = new Date(otpRecord.expiresAt);
            const timeRemaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
            const isExpired = now > expiresAt;

            return res.json({
                success: true,
                data: {
                    exists: true,
                    email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
                    purpose: purpose,
                    attempts: otpRecord.attempts,
                    attemptsRemaining: 5 - otpRecord.attempts,
                    timeRemaining: timeRemaining,
                    isExpired: isExpired,
                    expiresAt: otpRecord.expiresAt
                }
            });
        } catch (error) {
            console.error("[OTP] Error getting status:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to get OTP status."
            });
        }
    }

    /**
     * Verify OTP with Database Backup Methods
     * Multiple verification strategies for reliability
     */
    async verifyOTPWithDBBackup(req, res) {
        const { email, otp, purpose = 'signup_verification' } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: "Email and OTP are required."
            });
        }

        try {
            // Method 1: Direct OTP table lookup
            const otpRecord = await OTP.findOne({
                email: { $eq: email },
                purpose: { $eq: purpose },
                isVerified: { $eq: false },
                expiresAt: { $gt: new Date() }
            }).lean();

            if (!otpRecord) {
                console.log(`[OTP] No valid OTP record found for ${email}`);
                return res.status(404).json({
                    success: false,
                    error: "OTP not found or expired",
                    method: "direct_lookup"
                });
            }

            // Method 2: Verify OTP value
            const isOTPValid = otpRecord.otp === otp.trim();
            
            if (!isOTPValid) {
                // Increment attempts
                await OTP.findByIdAndUpdate(otpRecord._id, {
                    $inc: { attempts: 1 }
                });

                return res.status(401).json({
                    success: false,
                    error: "Invalid OTP",
                    method: "otp_verification"
                });
            }

            // Method 3: Check if user exists in User collection (for additional verification)
            let userExists = false;
            try {
                userExists = await User.exists({ email: email });
            } catch (err) {
                console.warn("[OTP] Warning: Could not check user existence", err.message);
            }

            // Method 4: Verify using Signup table if applicable
            let signupRecord = null;
            if (purpose === 'signup_verification') {
                try {
                    signupRecord = await Signup.findOne({ email: email }).lean();
                } catch (err) {
                    console.warn("[OTP] Warning: Could not check signup record", err.message);
                }
            }

            // Method 5: Mark OTP as verified in database
            const updateResult = await OTP.findByIdAndUpdate(
                otpRecord._id,
                {
                    isVerified: true,
                    verifiedAt: new Date(),
                    verificationMethod: 'otp_code',
                    userExists: userExists,
                    signupExists: !!signupRecord
                },
                { new: true }
            );

            if (!updateResult) {
                return res.status(500).json({
                    success: false,
                    error: "Failed to mark OTP as verified",
                    method: "update_verification"
                });
            }

            console.log(`[OTP] Successfully verified OTP for ${email}`);

            return res.status(200).json({
                success: true,
                message: "OTP verified successfully with database confirmation",
                data: {
                    email: email,
                    verified: true,
                    method: "multi_verify",
                    verificationDetails: {
                        otpMatched: isOTPValid,
                        userExists: userExists,
                        signupExists: !!signupRecord,
                        verifiedAt: updateResult.verifiedAt,
                        purpose: purpose
                    }
                }
            });

        } catch (error) {
            console.error("[OTP] Error in multi-method verification:", error);
            return res.status(500).json({
                success: false,
                error: "Verification error",
                method: "error",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get OTP verification status from database
     */
    async getOTPVerificationStatus(req, res) {
        const { email, purpose = 'signup_verification' } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email is required"
            });
        }

        try {
            const otpRecord = await OTP.findOne({
                email: email,
                purpose: purpose,
                isVerified: true
            }).lean();

            if (!otpRecord) {
                return res.status(404).json({
                    success: false,
                    verified: false,
                    error: "No verified OTP found for this email"
                });
            }

            return res.status(200).json({
                success: true,
                verified: true,
                data: {
                    email: email,
                    purpose: purpose,
                    verifiedAt: otpRecord.verifiedAt,
                    verificationMethod: otpRecord.verificationMethod,
                    userExists: otpRecord.userExists,
                    signupExists: otpRecord.signupExists
                }
            });

        } catch (error) {
            console.error("[OTP] Error getting verification status:", error);
            return res.status(500).json({
                success: false,
                error: "Failed to get verification status"
            });
        }
    }
