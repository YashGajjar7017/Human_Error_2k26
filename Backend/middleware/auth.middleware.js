const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Session = require('../models/Session.model');

// Verify JWT token
exports.auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Check if user is active
        if (user.status === 'banned' || user.status === 'inactive') {
            return res.status(401).json({
                success: false,
                message: 'Account is disabled. Please contact support.'
            });
        }

        // Check if user is verified (if email verification is required)
        if (user.emailVerified === false) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address first.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format.'
            });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(401).json({
                success: false,
                message: 'Authentication failed.'
            });
        }
    }
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token && process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            // Only attach user if they exist and are active
            if (user && user.status === 'active' && user.emailVerified !== false) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Middleware to check if user owns resource or is admin
exports.ownsResourceOrAdmin = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const resourceUserId = req.params.userId || req.body[resourceUserIdField] || req.query[resourceUserIdField];
        
        if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        }
    };
};

// Enhanced session-based authentication
exports.sessionAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const sessionToken = req.header('X-Session-Token');
        const sessionId = req.params.sessionId || req.body.sessionId || req.query.sessionId;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user || user.status !== 'active' || user.emailVerified === false) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or unauthorized user'
            });
        }

        // If session authentication is also required
        if (sessionToken && sessionId) {
            const sessionDecoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
            const session = await Session.findOne({ 
                sessionId: sessionId,
                isActive: true 
            });

            if (!session || sessionDecoded.userId !== user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid session access'
                });
            }

            const participant = session.participants.find(p => p.userId === user._id.toString());
            if (!participant) {
                return res.status(403).json({
                    success: false,
                    message: 'User not authorized for this session'
                });
            }

            participant.lastActivity = new Date();
            session.lastActivity = new Date();
            await session.save();

            req.session = session;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Session auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Check if user is session participant
exports.isSessionParticipant = async (req, res, next) => {
    try {
        const sessionId = req.params.sessionId || req.body.sessionId;
        const userId = req.user?._id?.toString();

        if (!sessionId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID and user authentication required'
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
                message: 'User is not a participant in this session'
            });
        }

        req.session = session;
        next();
    } catch (error) {
        console.error('Session participant check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Session validation failed'
        });
    }
};
