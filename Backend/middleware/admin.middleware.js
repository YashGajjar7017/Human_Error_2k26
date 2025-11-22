const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate admin users
 * Verifies JWT token and checks if user has admin role
 */
const authenticateAdmin = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user has admin role
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required.'
            });
        }

        // Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

module.exports = {
    authenticateAdmin
};
