const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['host', 'participant'],
        default: 'participant'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    joinCode: {
        type: String,
        required: true,
        unique: true
    },
    creatorId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Collaborative Session'
    },
    language: {
        type: String,
        default: 'javascript'
    },
    theme: {
        type: String,
        default: 'dark'
    },
    readOnly: {
        type: Boolean,
        default: false
    },
    maxParticipants: {
        type: Number,
        default: 10
    },
    allowJoin: {
        type: Boolean,
        default: true
    },
    code: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    participants: [participantSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Session', sessionSchema);
