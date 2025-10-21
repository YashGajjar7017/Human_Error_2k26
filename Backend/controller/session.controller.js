const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const rootDir = require('../util/path');

// Enhanced Session management with collaborative features
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.sessionFile = path.join(rootDir, 'sessions.json');
        this.chatMessages = new Map(); // sessionId -> messages[]
        this.cursors = new Map(); // sessionId -> {userId: {x, y}}
        this.webrtcSignals = new Map(); // sessionId -> signals[]
        this.loadSessions();
    }

    loadSessions() {
        try {
            if (fs.existsSync(this.sessionFile)) {
                const data = fs.readFileSync(this.sessionFile, 'utf8');
                const sessions = JSON.parse(data);
                this.sessions = new Map(Object.entries(sessions));
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
            this.sessions = new Map();
        }
    }

    saveSessions() {
        try {
            const sessions = Object.fromEntries(this.sessions);
            fs.writeFileSync(this.sessionFile, JSON.stringify(sessions, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving sessions:', error);
            return false;
        }
    }

    createSession(creatorId, settings = {}) {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const joinCode = crypto.randomBytes(16).toString('hex');
        const session = {
            id: sessionId,
            joinCode,
            creatorId,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            participants: [{
                userId: creatorId,
                joinedAt: new Date().toISOString(),
                role: 'host'
            }],
            settings: {
                language: settings.language || 'javascript',
                theme: settings.theme || 'dark',
                readOnly: settings.readOnly || false,
                maxParticipants: settings.maxParticipants || 10,
                allowJoin: settings.allowJoin !== false,
                ...settings
            },
            code: settings.initialCode || '',
            isActive: true,
            version: 1
        };
        
        this.sessions.set(sessionId, session);
        this.chatMessages.set(sessionId, []);
        this.cursors.set(sessionId, {});
        this.saveSessions();
        return session;
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }

    getSessionByJoinCode(joinCode) {
        for (const [sessionId, session] of this.sessions) {
            if (session.joinCode === joinCode) {
                return session;
            }
        }
        return null;
    }

    joinSession(sessionId, userId, username) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        if (session.participants.length >= session.settings.maxParticipants) {
            return { error: 'Session is full' };
        }

        if (!session.settings.allowJoin) {
            return { error: 'Session is not accepting new participants' };
        }

        const existingParticipant = session.participants.find(p => p.userId === userId);
        if (!existingParticipant) {
            session.participants.push({
                userId,
                username,
                joinedAt: new Date().toISOString(),
                role: 'participant'
            });
            session.lastActivity = new Date().toISOString();
            this.saveSessions();
        }

        return session;
    }

    leaveSession(sessionId, userId) {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        session.participants = session.participants.filter(p => p.userId !== userId);
        session.lastActivity = new Date().toISOString();
        
        if (session.participants.length === 0) {
            session.isActive = false;
        }
        
        this.saveSessions();
        return true;
    }

    updateSessionCode(sessionId, code, userId) {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        const participant = session.participants.find(p => p.userId === userId);
        if (!participant || (session.settings.readOnly && participant.role !== 'host')) {
            return false;
        }

        session.code = code;
        session.lastActivity = new Date().toISOString();
        session.version += 1;
        this.saveSessions();
        return true;
    }

    getAllSessions() {
        return Array.from(this.sessions.values());
    }

    getActiveSessions() {
        return Array.from(this.sessions.values()).filter(session => session.isActive);
    }

    deleteSession(sessionId, userId) {
        const session = this.sessions.get(sessionId);
        if (!session || session.creatorId !== userId) return false;

        this.sessions.delete(sessionId);
        this.chatMessages.delete(sessionId);
        this.cursors.delete(sessionId);
        this.saveSessions();
        return true;
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
