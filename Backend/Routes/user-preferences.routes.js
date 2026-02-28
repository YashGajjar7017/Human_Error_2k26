// User Preferences Routes
// Handles theme preferences and user settings

const express = require('express');
const router = express.Router();

// In-memory storage for demo (use DB in production)
const userPreferences = new Map();

// Get user preferences
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = userPreferences.get(userId) || {
            theme: 'light',
            language: 'en',
            notifications: {
                push: true,
                email: true,
                achievements: true,
                challenges: true,
                collaboration: true
            },
            compiler: {
                defaultLanguage: 'javascript',
                fontSize: 14,
                tabSize: 2,
                wordWrap: true
            },
            privacy: {
                showOnLeaderboard: true,
                showProgress: true
            }
        };
        res.json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user preferences
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        
        const current = userPreferences.get(userId) || {};
        const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
        userPreferences.set(userId, updated);
        
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update theme preference
router.patch('/:userId/theme', async (req, res) => {
    try {
        const { userId } = req.params;
        const { theme } = req.body; // 'light' or 'dark'
        
        if (!['light', 'dark'].includes(theme)) {
            return res.status(400).json({ success: false, error: 'Invalid theme' });
        }
        
        const current = userPreferences.get(userId) || {};
        current.theme = theme;
        current.updatedAt = new Date().toISOString();
        userPreferences.set(userId, current);
        
        res.json({ success: true, data: { theme } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update notification settings
router.patch('/:userId/notifications', async (req, res) => {
    try {
        const { userId } = req.params;
        const { notifications } = req.body;
        
        const current = userPreferences.get(userId) || {};
        current.notifications = { ...current.notifications, ...notifications };
        current.updatedAt = new Date().toISOString();
        userPreferences.set(userId, current);
        
        res.json({ success: true, data: current.notifications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reset preferences to default
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        userPreferences.delete(userId);
        res.json({ success: true, message: 'Preferences reset to default' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

