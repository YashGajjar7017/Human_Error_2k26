const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'system', 'achievement', 'project', 'collaboration', 'comment', 'mention', 'friend_request', 'like', 'share'],
        default: 'info'
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        maxlength: 1000
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    actionUrl: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}) {
    const notification = new this({
        userId,
        type,
        title,
        message,
        data
    });
    return notification.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
    return this.countDocuments({ userId, read: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
    return this.updateMany(
        { userId, read: false },
        { read: true, readAt: new Date() }
    );
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
    this.read = true;
    this.readAt = new Date();
    return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;