const crypto = require('crypto');
const Session = require('../models/Session.model');

// Enhanced Session management with collaborative features using MongoDB
class SessionManager {
    constructor() {
        this.chatMessages = new Map(); // sessionId -> messages[]
        this.cursors = new Map(); // sessionId -> {userId: {x, y}}
        this.webrtcSignals = new Map(); // sessionId -> signals[]
    }

    async createSession(creatorId, settings = {}) {
        try {
            const sessionId = crypto.randomBytes(16).toString('hex');
            const joinCode = crypto.randomBytes(16).toString('hex');

            const session = new Session({
                sessionId,
                joinCode,
                creatorId,
                title: settings.title || 'Collaborative Session',
                language: settings.language || 'javascript',
                theme: settings.theme || 'dark',
                readOnly: settings.readOnly || false,
                maxParticipants: settings.maxParticipants || 10,
                allowJoin: settings.allowJoin !== false,
                code: settings.initialCode || '',
                participants: [{
                    userId: creatorId,
                    username: settings.creatorUsername || 'Host',
                    role: 'host'
                }]
            });

            await session.save();

            // Initialize in-memory stores for real-time features
            this.chatMessages.set(sessionId, []);
            this.cursors.set(sessionId, {});
            this.webrtcSignals.set(sessionId, []);

            return session.toObject();
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    async getSession(sessionId) {
        try {
            const session = await Session.findOne({ sessionId, isActive: true });
            return session ? session.toObject() : null;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    async getSessionByJoinCode(joinCode) {
        try {
            const session = await Session.findOne({ joinCode, isActive: true });
            return session ? session.toObject() : null;
        } catch (error) {
            console.error('Error getting session by join code:', error);
            return null;
        }
    }

    async joinSession(sessionId, userId, username) {
        try {
            const session = await Session.findOne({ sessionId, isActive: true });
            if (!session) return null;

            if (session.participants.length >= session.maxParticipants) {
                return { error: 'Session is full' };
            }

            if (!session.allowJoin) {
                return { error: 'Session is not accepting new participants' };
            }

            const existingParticipant = session.participants.find(p => p.userId === userId);
            if (!existingParticipant) {
                session.participants.push({
                    userId,
                    username,
                    role: 'participant'
                });
                session.lastActivity = new Date();
                await session.save();
            }

            return session.toObject();
        } catch (error) {
            console.error('Error joining session:', error);
            return null;
        }
    }

    async leaveSession(sessionId, userId) {
        try {
            const session = await Session.findOne({ sessionId, isActive: true });
            if (!session) return false;

            session.participants = session.participants.filter(p => p.userId !== userId);
            session.lastActivity = new Date();

            if (session.participants.length === 0) {
                session.isActive = false;
                session.endedAt = new Date();
            }

            await session.save();
            return true;
        } catch (error) {
            console.error('Error leaving session:', error);
            return false;
        }
    }

    async updateSessionCode(sessionId, code, userId) {
        try {
            const session = await Session.findOne({ sessionId, isActive: true });
            if (!session) return false;

            const participant = session.participants.find(p => p.userId === userId);
            if (!participant || (session.readOnly && participant.role !== 'host')) {
                return false;
            }

            session.code = code;
            session.lastActivity = new Date();
            await session.save();
            return true;
        } catch (error) {
            console.error('Error updating session code:', error);
            return false;
        }
    }

    async getAllSessions() {
        try {
            const sessions = await Session.find({});
            return sessions.map(session => session.toObject());
        } catch (error) {
            console.error('Error getting all sessions:', error);
            return [];
        }
    }

    async getActiveSessions() {
        try {
            const sessions = await Session.find({ isActive: true });
            return sessions.map(session => session.toObject());
        } catch (error) {
            console.error('Error getting active sessions:', error);
            return [];
        }
    }

    async deleteSession(sessionId, userId) {
        try {
            const session = await Session.findOne({ sessionId, creatorId: userId });
            if (!session) return false;

            await Session.findOneAndDelete({ sessionId });

            // Clean up in-memory stores
            this.chatMessages.delete(sessionId);
            this.cursors.delete(sessionId);
            this.webrtcSignals.delete(sessionId);

            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    }

    // Chat functionality
    addChatMessage(sessionId, userId, username, message) {
        const messages = this.chatMessages.get(sessionId) || [];
        const chatMessage = {
            id: crypto.randomBytes(8).toString('hex'),
            userId,
            username,
            message,
            timestamp: new Date().toISOString()
        };
        messages.push(chatMessage);
        this.chatMessages.set(sessionId, messages);
        return chatMessage;
    }

    getChatMessages(sessionId) {
        return this.chatMessages.get(sessionId) || [];
    }

    // Cursor tracking
    updateCursor(sessionId, userId, cursorData) {
        const cursors = this.cursors.get(sessionId) || {};
        cursors[userId] = {
            ...cursorData,
            lastUpdate: new Date().toISOString()
        };
        this.cursors.set(sessionId, cursors);
        return cursors;
    }

    getCursors(sessionId) {
        return this.cursors.get(sessionId) || {};
    }

    // WebRTC signaling
    addWebRTCSignal(sessionId, signal) {
        const signals = this.webrtcSignals.get(sessionId) || [];
        signals.push({
            ...signal,
            timestamp: new Date().toISOString()
        });
        this.webrtcSignals.set(sessionId, signals);
        return signals;
    }

    getWebRTCSignals(sessionId) {
        return this.webrtcSignals.get(sessionId) || [];
    }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Export both class and instance
module.exports = {
    SessionManager,
    sessionManager
};
