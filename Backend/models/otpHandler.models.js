const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['signup_verification', 'password_reset', 'email_verification'],
        default: 'signup_verification'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5 // Maximum 5 attempts
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete after 10 minutes
    }
});

// Index for efficient queries
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to check if OTP is expired
otpSchema.methods.isExpired = function() {
    return Date.now() > this.expiresAt;
};

// Instance method to increment attempts
otpSchema.methods.incrementAttempts = function() {
    this.attempts += 1;
    return this.save();
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(email, otp, purpose = 'signup_verification') {
    return this.findOne({
        email,
        otp,
        purpose,
        isVerified: false,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 }
    });
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
