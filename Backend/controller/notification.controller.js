const { auth } = require('../middleware/auth.middleware');

// In-memory storage for notifications (in production, use database)
let notifications = [];
let notificationId = 1;

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const { title, message, type, recipientId, priority } = req.body;
        const senderId = req.user.id;

        if (!title || !message || !type) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'message', 'type']
            });
        }

        const validTypes = ['info', 'warning', 'error', 'success', 'system'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Invalid notification type',
                validTypes: validTypes
            });
        }

        const newNotification = {
            id: notificationId++,
            title: title.trim(),
            message: message.trim(),
            type: type,
            senderId: senderId,
            recipientId: recipientId || null, // null means broadcast to all
            priority: priority || 'normal',
            isRead: false,
            createdAt: new Date().toISOString(),
            expiresAt: null
        };

        notifications.push(newNotification);

        // If it's a broadcast notification, mark as read for sender
        if (!recipientId) {
            newNotification.isRead = true;
        }

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
};

// Get notifications for authenticated user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, isRead, limit = 50, offset = 0 } = req.query;

        let userNotifications = notifications.filter(n =>
            n.recipientId === userId || n.recipientId === null
        );

        // Filter by type
        if (type) {
            userNotifications = userNotifications.filter(n => n.type === type);
        }

        // Filter by read status
        if (isRead !== undefined) {
            const readStatus = isRead === 'true';
            userNotifications = userNotifications.filter(n => n.isRead === readStatus);
        }

        // Sort by creation date (newest first)
        userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply pagination
        const total = userNotifications.length;
        const paginatedNotifications = userNotifications.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        res.json({
            success: true,
            notifications: paginatedNotifications,
            pagination: {
                total: total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: total > parseInt(offset) + parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            error: 'Failed to fetch notifications'
        });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const userId = req.user.id;

        const notification = notifications.find(n =>
            n.id === notificationId &&
            (n.recipientId === userId || n.recipientId === null)
        );

        if (!notification) {
            return res.status(404).json({
                error: 'Notification not found'
            });
        }

        notification.isRead = true;

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
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const userNotifications = notifications.filter(n =>
            (n.recipientId === userId || n.recipientId === null) && !n.isRead
        );

        userNotifications.forEach(notification => {
            notification.isRead = true;
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
};

// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const userId = req.user.id;

        const notificationIndex = notifications.findIndex(n =>
            n.id === notificationId &&
            (n.recipientId === userId || n.recipientId === null)
        );

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
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const userNotifications = notifications.filter(n =>
            n.recipientId === userId || n.recipientId === null
        );

        const stats = {
            total: userNotifications.length,
            unread: userNotifications.filter(n => !n.isRead).length,
            byType: {},
            byPriority: {}
        };

        // Count by type
        userNotifications.forEach(notification => {
            stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        });

        // Count by priority
        userNotifications.forEach(notification => {
            stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
        });

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting notification stats:', error);
        res.status(500).json({
            error: 'Failed to get notification statistics'
        });
    }
};

// Broadcast notification to all users (admin only)
const broadcastNotification = async (req, res) => {
    try {
        const { title, message, type, priority } = req.body;
        const senderId = req.user.id;

        // Check if user is admin (you might want to implement proper admin check)
        // For now, we'll assume the auth middleware handles this

        if (!title || !message || !type) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'message', 'type']
            });
        }

        const broadcastNotification = {
            id: notificationId++,
            title: title.trim(),
            message: message.trim(),
            type: type,
            senderId: senderId,
            recipientId: null, // null means broadcast
            priority: priority || 'high',
            isRead: false,
            createdAt: new Date().toISOString(),
            expiresAt: null
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
};

// Clean up expired notifications (utility function)
const cleanupExpiredNotifications = () => {
    try {
        const now = new Date();
        const initialCount = notifications.length;

        notifications = notifications.filter(notification => {
            if (notification.expiresAt) {
                return new Date(notification.expiresAt) > now;
            }
            return true; // Keep notifications without expiry
        });

        const removedCount = initialCount - notifications.length;
        if (removedCount > 0) {
            console.log(`Cleaned up ${removedCount} expired notifications`);
        }
    } catch (error) {
        console.error('Error cleaning up expired notifications:', error);
    }
};

// Run cleanup every hour
setInterval(cleanupExpiredNotifications, 60 * 60 * 1000);

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationStats,
    broadcastNotification,
    cleanupExpiredNotifications
};
