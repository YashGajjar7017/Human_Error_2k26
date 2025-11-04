const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sessionId: {
        type: String,
        default: null
    },
    purpose: {
        type: String,
        enum: ['login_session', 'auth_token', 'temp_session'],
        default: 'temp_session'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
});

// Index for automatic expiration
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to update last used
tokenSchema.methods.updateLastUsed = function() {
    this.lastUsed = new Date();
    return this.save();
};

// Static method to find active token
tokenSchema.statics.findActiveToken = function(token) {
    return this.findOne({ token, isActive: true, expiresAt: { $gt: new Date() } });
};

// Static method to deactivate token
tokenSchema.statics.deactivateToken = function(token) {
    return this.findOneAndUpdate(
        { token },
        { isActive: false },
        { new: true }
    );
};

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
