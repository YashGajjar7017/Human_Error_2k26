const express = require('express');
const authController = require('../controller/auth.controller');
const { activeTokens } = require('../controller/loginApi.controller');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')
        ? req.header('Authorization').replace('Bearer ', '')
        : null;

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Check if the token is still active
        if (!activeTokens[token]) {
            return res.status(401).json({ message: 'Token not active' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

// Login endpoint
router.post('/login', authController.login);

// Logout endpoint
router.post('/logout', verifyToken, authController.logout);

// Session endpoint to get current user session
router.get('/session', verifyToken, authController.getCurrentUser);

// Register endpoint (if needed, or use existing signup)
router.post('/register', authController.register);

// Additional auth routes
router.post('/auth-token', authController.authToken);
router.post('/usr-login', authController.usrLogin);
router.post('/reg-user', authController.regUser);
router.get('/user-accept', authController.userAccept);
router.post('/reg-user-qr', authController.regUserQR);
router.get('/user-protected', authController.UserProtected);
router.post('/verify-otp', authController.verifyOTP);
router.post('/verify-email', authController.verifyEmail);
router.post('/send-otp-email', authController.SendOTPEmail);
router.get('/health-check', authController.healthCheck);

module.exports = router;
