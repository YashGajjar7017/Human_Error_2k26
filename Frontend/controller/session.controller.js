const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const rootDir = require('../util/path');

// Session management
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.sessionFile = path.join(rootDir, 'sessions.json');
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
        const session = {
            id: sessionId,
            creatorId,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            participants: [creatorId],
            settings: {
                language: settings.language || 'javascript',
                theme: settings.theme || 'dark',
                readOnly: settings.readOnly || false,
                ...settings
            },
            code: settings.initialCode || '',
            isActive: true
        };
        
        this.sessions.set(sessionId, session);
        this.saveSessions();
        return session;
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }

    joinSession(sessionId, userId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isActive) {
            return null;
        }
        
        if (!session.participants.includes(userId)) {
            session.participants.push(userId);
            session.lastActivity = new Date().toISOString();
            this.saveSessions();
        }
        
        return session;
    }

    getShareableLink(sessionId) {
        return `/session/${sessionId}`;
    }

    getActiveSessions() {
        return Array.from(this.sessions.values()).filter(session => session.isActive);
    }

    leaveSession(sessionId, userId) {
        const session = this.sessions.get(sessionId);
        if (!session) return false;

        session.participants = session.participants.filter(p => p !== userId);
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

        const participant = session.participants.find(p => p === userId);
        if (!participant || session.settings.readOnly) {
            return false;
        }

        session.code = code;
        session.lastActivity = new Date().toISOString();
        this.saveSessions();
        return true;
    }

    cleanupInactiveSessions(maxAgeHours = 24) {
        const maxAge = maxAgeHours * 60 * 60 * 1000;
        const now = new Date();
        
        for (const [sessionId, session] of this.sessions) {
            const lastActivity = new Date(session.lastActivity);
            if (now - lastActivity > maxAge) {
                session.isActive = false;
            }
        }
        
        this.saveSessions();
    }
}

const sessionManager = new SessionManager();

// Controller functions
exports.createSession = (req, res) => {
    const { creatorId, settings } = req.body;
    
    if (!creatorId) {
        return res.status(400).json({
            success: false,
            error: 'Creator ID is required'
        });
    }
    
    const session = sessionManager.createSession(creatorId, settings);
    
    res.json({
        success: true,
        data: {
            sessionId: session.id,
            shareableLink: sessionManager.getShareableLink(session.id),
            session
        }
    });
};

exports.getSession = (req, res) => {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }
    
    res.json({
        success: true,
        data: session
    });
};

exports.getShareableLink = (req, res) => {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }
    
    res.json({
        success: true,
        data: {
            shareableLink: sessionManager.getShareableLink(sessionId),
            session
        }
    });
};

exports.joinSession = (req, res) => {
    const { sessionId, userId } = req.body;
    const session = sessionManager.joinSession(sessionId, userId);
    
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Session not found or inactive'
        });
    }
    
    res.json({
        success: true,
        data: session
    });
};

exports.leaveSession = (req, res) => {
    const { sessionId, userId } = req.body;
    const success = sessionManager.leaveSession(sessionId, userId);
    
    if (!success) {
        return res.status(404).json({
            success: false,
            error: 'Session not found or user not in session'
        });
    }
    
    res.json({
        success: true,
        message: 'Successfully left the session'
    });
};

exports.updateSessionCode = (req, res) => {
    const { sessionId, code, userId } = req.body;
    const success = sessionManager.updateSessionCode(sessionId, code, userId);
    
    if (!success) {
        return res.status(403).json({
            success: false,
            error: 'Failed to update session code'
        });
    }
    
    res.json({
        success: true,
        message: 'Session code updated successfully'
    });
};

exports.getActiveSessions = (req, res) => {
    const sessions = sessionManager.getActiveSessions();
    res.json({
        success: true,
        data: sessions
    });
};
