const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for notification endpoints
const notificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 notification requests per windowMs
    message: {
        error: 'Too many notification requests, please try again later.'
    }
});

// In-memory storage for notifications (in production, use database)
let notifications = [];
let notificationId = 1;

// Input validation middleware
const validateNotification = (req, res, next) => {
    const { title, message, type, recipientId } = req.body;

    if (!title || !message || !type || !recipientId) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['title', 'message', 'type', 'recipientId']
        });
    }

    const validTypes = ['info', 'success', 'warning', 'error', 'system'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({
            error: 'Invalid notification type',
            validTypes: validTypes
        });
    }

    next();
};

// Get all notifications for authenticated user
router.get('/', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const userNotifications = notifications.filter(n => n.recipientId === userId);

        // Sort by creation date (newest first)
        userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            notifications: userNotifications,
            count: userNotifications.length
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            error: 'Failed to fetch notifications'
        });
    }
});

// Get unread notifications count
router.get('/unread-count', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const unreadCount = notifications.filter(n => n.recipientId === userId && !n.read).length;

        res.json({
            success: true,
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            error: 'Failed to fetch unread count'
        });
    }
});

// Create a new notification
router.post('/', auth, notificationLimiter, validateNotification, (req, res) => {
    try {
        const { title, message, type, recipientId, data } = req.body;

        const newNotification = {
            id: notificationId++,
            title,
            message,
            type,
            recipientId,
            senderId: req.user.id,
            read: false,
            createdAt: new Date().toISOString(),
            data: data || {}
        };

        notifications.push(newNotification);

        res.status(201).json({
            success: true,
            notification: newNotification,
            message: 'Notification created successfully'
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            error: 'Failed to create notification'
        });
    }
});

// Mark notification as read
router.put('/:id/read', auth, (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const userId = req.user.id;

        const notification = notifications.find(n => n.id === notificationId && n.recipientId === userId);

        if (!notification) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }

        notification.read = true;
        notification.readAt = new Date().toISOString();

        res.json({
            success: true,
            notification: notification,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            error: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.put('/read-all', auth, (req, res) => {
    try {
        const userId = req.user.id;

        const userNotifications = notifications.filter(n => n.recipientId === userId && !n.read);
        userNotifications.forEach(n => {
            n.read = true;
            n.readAt = new Date().toISOString();
        });

        res.json({
            success: true,
            markedCount: userNotifications.length,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            error: 'Failed to mark all notifications as read'
        });
    }
});

// Delete a notification
router.delete('/:id', auth, (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const userId = req.user.id;

        const notificationIndex = notifications.findIndex(n => n.id === notificationId && n.recipientId === userId);

        if (notificationIndex === -1) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }

        notifications.splice(notificationIndex, 1);

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            error: 'Failed to delete notification'
        });
    }
});

// Delete all read notifications
router.delete('/read/delete', auth, (req, res) => {
    try {
        const userId = req.user.id;

        const initialCount = notifications.length;
        notifications = notifications.filter(n => !(n.recipientId === userId && n.read));

        const deletedCount = initialCount - notifications.length;

        res.json({
            success: true,
            deletedCount: deletedCount,
            message: `${deletedCount} read notifications deleted`
        });
    } catch (error) {
        console.error('Error deleting read notifications:', error);
        res.status(500).json({
            error: 'Failed to delete read notifications'
        });
    }
});

// Get notification types
router.get('/types', (req, res) => {
    const types = {
        info: 'General information',
        success: 'Success notification',
        warning: 'Warning or caution',
        error: 'Error or failure',
        system: 'System notification'
    };

    res.json({
        success: true,
        types: types
    });
});

// Broadcast notification to all users (admin only)
router.post('/broadcast', auth, notificationLimiter, (req, res) => {
    try {
        // Check if user is admin (you might want to implement proper role checking)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Admin access required'
            });
        }

        const { title, message, type, data } = req.body;

        if (!title || !message || !type) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'message', 'type']
            });
        }

        // In a real application, you'd get all user IDs from database
        // For now, we'll create a broadcast notification that can be queried by type
        const broadcastNotification = {
            id: notificationId++,
            title,
            message,
            type,
            recipientId: 'all', // Special identifier for broadcast
            senderId: req.user.id,
            read: false,
            createdAt: new Date().toISOString(),
            data: data || {},
            broadcast: true
        };

        notifications.push(broadcastNotification);

        res.status(201).json({
            success: true,
            notification: broadcastNotification,
            message: 'Broadcast notification sent successfully'
        });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        res.status(500).json({
            error: 'Failed to broadcast notification'
        });
    }
});

module.exports = router;
