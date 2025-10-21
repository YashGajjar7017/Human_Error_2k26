const jwt = require('jsonwebtoken');
const Session = require('../models/Session.model');
const User = require('../models/User.model');

// Session-based authentication middleware
exports.sessionAuth = async (req, res, next) => {
    try {
        // Check for session token in headers
        const sessionToken = req.header('X-Session-Token');
        const sessionId = req.header('X-Session-ID');
        
        if (!sessionToken || !sessionId) {
            return res.status(401).json({
                success: false,
                message: 'Session authentication required'
            });
        }

        // Verify session token
        const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
        
        // Find session
        const session = await Session.findOne({ 
            sessionId: sessionId,
            isActive: true 
        });
        
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session'
            });
        }

        // Check if user is in session
        const participant = session.participants.find(p => p.userId === decoded.userId);
        if (!participant) {
            return res.status(403).json({
                success: false,
                message: 'User not authorized for this session'
            });
        }

        // Update last activity
        participant.lastActivity = new Date();
        session.lastActivity = new Date();
        await session.save();

        req.session = session;
        req.user = await User.findById(decoded.userId);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session token has expired'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid session token'
            });
        } else {
            console.error('Session auth error:', error);
            return res.status(500).json({
                success: false,
                message: 'Session authentication failed'
            });
        }
    }
};

// Generate session token
exports.generateSessionToken = (userId, sessionId) => {
    return jwt.sign(
        { userId, sessionId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Validate session access
exports.validateSessionAccess = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId || req.body.sessionId;
        const userId = req.user?._id?.toString();

        if (!sessionId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID and user ID required'
            });
        }

        const session = await Session.findOne({ 
            sessionId,
            isActive: true 
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or inactive'
            });
        }

        const participant = session.participants.find(p => p.userId === userId);
        if (!participant) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this session'
            });
        }

        req.session = session;
        next();
    } catch (error) {
        console.error('Session access validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Session access validation failed'
        });
    }
};

// Check if user is session host
exports.isSessionHost = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId || req.body.sessionId;
        const userId = req.user?._id?.toString();

        const session = await Session.findOne({ 
            sessionId,
            isActive: true 
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const participant = session.participants.find(p => p.userId === userId);
        if (!participant || participant.role !== 'host') {
            return res.status(403).json({
                success: false,
                message: 'Host access required'
            });
        }

        req.session = session;
        next();
    } catch (error) {
        console.error('Host validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Host validation failed'
        });
    }
};

// Clean up inactive sessions
exports.cleanupInactiveSessions = async () => {
    try {
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        const result = await Session.updateMany(
            { 
                lastActivity: { $lt: cutoffTime },
                isActive: true 
            },
            { 
                isActive: false,
                endedAt: new Date()
            }
        );
        return result.modifiedCount;
    } catch (error) {
        console.error('Session cleanup error:', error);
        return 0;
    }
};
