const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// In-memory store for JWT tokens (for tracking/revocation)
const tokenBlacklist = new Set();
const tokenStore = new Map();

/**
 * Security Controller
 * Handles JWT token storage, security features, and token management
 */

// Store JWT token (for session management)
exports.storeJWT = async (req, res) => {
    try {
        const { token, deviceInfo, expiresIn } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        // Decode token to get user info
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const userId = decoded.id || decoded._id;
        const tokenId = crypto.randomBytes(16).toString('hex');

        // Store token info
        const tokenData = {
            tokenId,
            userId,
            deviceInfo: deviceInfo || req.get('User-Agent'),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + (expiresIn || 24 * 60 * 60 * 1000)), // Default 24 hours
            lastUsed: new Date()
        };

        // Add to store
        if (!tokenStore.has(userId)) {
            tokenStore.set(userId, new Map());
        }
        tokenStore.get(userId).set(tokenId, tokenData);

        // Update user's refresh token
        await User.findByIdAndUpdate(userId, { refreshToken: token });

        res.status(200).json({
            success: true,
            message: 'Token stored successfully',
            data: {
                tokenId,
                expiresAt: tokenData.expiresAt
            }
        });
    } catch (error) {
        console.error('Store JWT error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to store token'
        });
    }
};

// Revoke a specific token
exports.revokeToken = async (req, res) => {
    try {
        const { tokenId, userId } = req.body;
        const requestingUserId = req.user._id;

        // Only allow users to revoke their own tokens (unless admin)
        if (userId && userId !== requestingUserId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const targetUserId = userId || requestingUserId.toString();
        const userTokens = tokenStore.get(targetUserId);

        if (!userTokens) {
            return res.status(404).json({
                success: false,
                message: 'No tokens found for this user'
            });
        }

        if (tokenId) {
            // Revoke specific token
            const tokenData = userTokens.get(tokenId);
            if (tokenData) {
                tokenBlacklist.add(tokenData.token);
                userTokens.delete(tokenId);
            }
        } else {
            // Revoke all tokens for user
            for (const [id, data] of userTokens) {
                tokenBlacklist.add(data.token);
            }
            userTokens.clear();
        }

        // Clear refresh token in database
        await User.findByIdAndUpdate(targetUserId, { refreshToken: null });

        res.status(200).json({
            success: true,
            message: tokenId ? 'Token revoked successfully' : 'All tokens revoked successfully'
        });
    } catch (error) {
        console.error('Revoke token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke token'
        });
    }
};

// Get all active sessions for user
exports.getActiveSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const userTokens = tokenStore.get(userId.toString());

        if (!userTokens || userTokens.size === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const sessions = [];
        const now = new Date();

        for (const [tokenId, data] of userTokens) {
            if (data.expiresAt > now) {
                sessions.push({
                    tokenId: data.tokenId,
                    deviceInfo: data.deviceInfo,
                    createdAt: data.createdAt,
                    lastUsed: data.lastUsed,
                    expiresAt: data.expiresAt
                });
            } else {
                // Remove expired tokens
                userTokens.delete(tokenId);
            }
        }

        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active sessions'
        });
    }
};

// Check if token is valid/not revoked
exports.checkTokenStatus = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }

        if (tokenBlacklist.has(token)) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked',
                revoked: true
            });
        }

        // Verify token
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            res.status(200).json({
                success: true,
                message: 'Token is valid',
                revoked: false
            });
        } catch (err) {
            res.status(401).json({
                success: false,
                message: 'Token is invalid or expired',
                revoked: false
            });
        }
    } catch (error) {
        console.error('Check token status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check token status'
        });
    }
};

// Update token usage (for activity tracking)
exports.updateTokenUsage = async (req, res) => {
    try {
        const { token, tokenId } = req.body;
        const userId = req.user._id;

        const userTokens = tokenStore.get(userId.toString());
        
        if (!userTokens || !userTokens.has(tokenId)) {
            return res.status(404).json({
                success: false,
                message: 'Token not found'
            });
        }

        const tokenData = userTokens.get(tokenId);
        tokenData.lastUsed = new Date();
        
        res.status(200).json({
            success: true,
            message: 'Token usage updated'
        });
    } catch (error) {
        console.error('Update token usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update token usage'
        });
    }
};

// Security audit log
exports.securityAudit = async (req, res) => {
    try {
        const userId = req.user._id;
        const { action, details } = req.body;

        // Log security event (could be stored in database in production)
        const auditEntry = {
            userId: userId.toString(),
            action,
            details,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date()
        };

        console.log('[Security Audit]', JSON.stringify(auditEntry));

        res.status(200).json({
            success: true,
            message: 'Security event logged'
        });
    } catch (error) {
        console.error('Security audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to log security event'
        });
    }
};

// Validate password strength
exports.validatePassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        const result = {
            valid: true,
            checks: []
        };

        // Length check
        if (password.length < 8) {
            result.checks.push({ check: 'min_length', passed: false, message: 'Password must be at least 8 characters' });
            result.valid = false;
        } else {
            result.checks.push({ check: 'min_length', passed: true });
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            result.checks.push({ check: 'uppercase', passed: false, message: 'Password must contain at least one uppercase letter' });
            result.valid = false;
        } else {
            result.checks.push({ check: 'uppercase', passed: true });
        }

        // Lowercase check
        if (!/[a-z]/.test(password)) {
            result.checks.push({ check: 'lowercase', passed: false, message: 'Password must contain at least one lowercase letter' });
            result.valid = false;
        } else {
            result.checks.push({ check: 'lowercase', passed: true });
        }

        // Number check
        if (!/[0-9]/.test(password)) {
            result.checks.push({ check: 'number', passed: false, message: 'Password must contain at least one number' });
            result.valid = false;
        } else {
            result.checks.push({ check: 'number', passed: true });
        }

        // Special character check
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            result.checks.push({ check: 'special_char', passed: false, message: 'Password must contain at least one special character' });
            result.valid = false;
        } else {
            result.checks.push({ check: 'special_char', passed: true });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Validate password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate password'
        });
    }
};

// Export token store for monitoring
exports.getTokenStats = async (req, res) => {
    try {
        const totalUsers = tokenStore.size;
        let totalTokens = 0;
        
        for (const tokens of tokenStore.values()) {
            totalTokens += tokens.size;
        }

        res.status(200).json({
            success: true,
            data: {
                activeUsers: totalUsers,
                activeTokens: totalTokens,
                blacklistedTokens: tokenBlacklist.size
            }
        });
    } catch (error) {
        console.error('Get token stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get token statistics'
        });
    }
};

