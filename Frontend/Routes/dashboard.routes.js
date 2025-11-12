const express = require('express');
const path = require('path');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.authenticated) {
        return res.redirect('/Account/Admin/login/');
    }
    next();
};

// Common Dashboard route - routes to admin or user dashboard based on role
router.get('/', requireAuth, (req, res) => {
    try {
        const userRole = req.session.user?.role || 'user';
        console.log(`Dashboard request for user: ${req.session.user?.username}, Role: ${userRole}`);
        
        if (userRole === 'admin') {
            console.log('Serving admin dashboard');
            res.sendFile(path.join(__dirname, '../views/Dashboard_admin.html'));
        } else {
            console.log('Serving user dashboard');
            res.sendFile(path.join(__dirname, '../views/Dashboard_User.html'));
        }
    } catch (error) {
        console.error('Dashboard route error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// Analytics dashboard
router.get('/analytics', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/analytics.html'));
});

// Achievements page
router.get('/achievements', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/achievements.html'));
});

// Collaboration page
router.get('/collaboration', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/collaboration.html'));
});

// API documentation page
router.get('/api-docs', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/api-docs.html'));
});

// API proxy routes for dashboard features
router.get('/api/analytics/*', requireAuth, (req, res) => {
    res.redirect('/api/analytics' + req.path.replace('/api/analytics', ''));
});

router.get('/api/achievements/*', requireAuth, (req, res) => {
    res.redirect('/api/achievements' + req.path.replace('/api/achievements', ''));
});

router.get('/api/collaboration/*', requireAuth, (req, res) => {
    res.redirect('/api/collaboration' + req.path.replace('/api/collaboration', ''));
});

router.get('/api/docs/*', requireAuth, (req, res) => {
    res.redirect('/api/docs' + req.path.replace('/api/docs', ''));
});

module.exports = router;
