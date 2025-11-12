const mongoose = require('mongoose');

// Login Attempt Schema
const loginSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    success: {
        type: Boolean,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    failureReason: {
        type: String,
        enum: ['invalid_credentials', 'account_locked', 'otp_required', 'email_not_verified', 'other'],
        default: null
    },
    location: {
        country: String,
        city: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
loginSchema.index({ userId: 1, timestamp: -1 });
loginSchema.index({ ipAddress: 1, timestamp: -1 });

const Login = mongoose.model('Login', loginSchema);
module.exports = Login;
