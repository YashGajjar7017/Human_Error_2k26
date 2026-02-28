const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const { auth } = require('../middleware/auth.middleware');

/**
 * Notification Controller
 * Full CRUD operations for notification management
 */

// Helper to create notification
const createNotification = async (userId, type, title, message, data = {}) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            data
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

// Get all notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const filter = { userId };
        if (req.query.type) filter.type = req.query.type;
        if (req.query.read !== undefined) filter.read = req.query.read === 'true';

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ userId, read: false });

        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user._id,
            read: false
        });

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: req.user._id },
            { read: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true, readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
};

// Delete all read notifications
exports.deleteReadNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({
            userId: req.user._id,
            read: true
        });

        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} notifications`
        });
    } catch (error) {
        console.error('Delete read notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete read notifications'
        });
    }
};

// Create notification (internal use or admin)
exports.createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, data } = req.body;

        if (!userId || !type || !title) {
            return res.status(400).json({
                success: false,
                message: 'userId, type, and title are required'
            });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const notification = await createNotification(userId, type, title, message, data);

        res.status(201).json({
            success: true,
            message: 'Notification created',
            data: notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification'
        });
    }
};

// Broadcast notification to multiple users (admin)
exports.broadcastNotification = async (req, res) => {
    try {
        const { userIds, type, title, message, data } = req.body;

        if (!userIds || !Array.isArray(userIds) || !type || !title) {
            return res.status(400).json({
                success: false,
                message: 'userIds array, type, and title are required'
            });
        }

        const notifications = [];
        for (const userId of userIds) {
            const notification = await createNotification(userId, type, title, message, data);
            if (notification) {
                notifications.push(notification);
            }
        }

        res.status(201).json({
            success: true,
            message: `Created ${notifications.length} notifications`,
            data: { count: notifications.length }
        });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to broadcast notifications'
        });
    }
};

// Get notification types
exports.getNotificationTypes = async (req, res) => {
    try {
        const types = [
            { value: 'info', label: 'Information' },
            { value: 'success', label: 'Success' },
            { value: 'warning', label: 'Warning' },
            { value: 'error', label: 'Error' },
            { value: 'system', label: 'System' },
            { value: 'achievement', label: 'Achievement' },
            { value: 'project', label: 'Project' },
            { value: 'collaboration', label: 'Collaboration' },
            { value: 'comment', label: 'Comment' },
            { value: 'mention', label: 'Mention' },
            { value: 'friend_request', label: 'Friend Request' },
            { value: 'like', label: 'Like' },
            { value: 'share', label: 'Share' }
        ];

        res.status(200).json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('Get notification types error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification types'
        });
    }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
    try {
        const { email, push, types } = req.body;
        
        const updateData = {};
        if (email !== undefined) updateData['preferences.email'] = email;
        if (push !== undefined) updateData['preferences.push'] = push;
        if (types !== undefined) updateData['preferences.types'] = types;

        await User.findByIdAndUpdate(req.user._id, { $set: updateData });

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated'
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('preferences');
        
        res.status(200).json({
            success: true,
            data: user.preferences || {
                email: true,
                push: true,
                types: ['info', 'success', 'warning', 'error', 'system', 'achievement']
            }
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get preferences'
        });
    }
};

// Export for use in other controllers
module.exports.createNotification = createNotification;

