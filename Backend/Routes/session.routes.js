const express = require('express');
const { sessionManager } = require('../controller/session.controller');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')
        ? req.header('Authorization').replace('Bearer ', '')
        : null;

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

// Session management routes
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { settings } = req.body;
        const creatorId = req.user.id;
        const session = await sessionManager.createSession(creatorId, {
            ...settings,
            creatorUsername: req.user.username
        });
        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create session'
        });
    }
});

router.get('/:sessionId', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Error getting session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get session'
        });
    }
});

router.post('/:sessionId/join', verifyToken, async (req, res) => {
    try {
        const session = await sessionManager.joinSession(req.params.sessionId, req.user.id, req.user.username);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        if (session.error) {
            return res.status(400).json({
                success: false,
                message: session.error
            });
        }
        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Error joining session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join session'
        });
    }
});

router.put('/:sessionId/update', verifyToken, async (req, res) => {
    try {
        const { code } = req.body;
        const success = await sessionManager.updateSessionCode(req.params.sessionId, code, req.user.id);
        if (!success) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized or session not found'
            });
        }
        res.json({
            success: true,
            message: 'Session updated successfully'
        });
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update session'
        });
    }
});

router.get('/:sessionId/share', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        res.json({
            success: true,
            data: { joinCode: session.joinCode }
        });
    } catch (error) {
        console.error('Error getting share code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get share code'
        });
    }
});

router.get('/active', async (req, res) => {
    try {
        const sessions = await sessionManager.getActiveSessions();
        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        console.error('Error getting active sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active sessions'
        });
    }
});

// Enhanced collaborative coding routes
router.post('/:sessionId/code/save', verifyToken, async (req, res) => {
    try {
        const { code } = req.body;
        const success = await sessionManager.updateSessionCode(req.params.sessionId, code, req.user.id);
        if (!success) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized or session not found'
            });
        }
        res.json({
            success: true,
            message: 'Code saved successfully'
        });
    } catch (error) {
        console.error('Error saving code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save code'
        });
    }
});

router.get('/:sessionId/code/get', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        res.json({
            success: true,
            data: { code: session.code }
        });
    } catch (error) {
        console.error('Error getting code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get code'
        });
    }
});

router.post('/:sessionId/cursor/update', verifyToken, (req, res) => {
    try {
        const { cursorData } = req.body;
        const cursors = sessionManager.updateCursor(req.params.sessionId, req.user.id, cursorData);
        res.json({
            success: true,
            data: cursors
        });
    } catch (error) {
        console.error('Error updating cursor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cursor'
        });
    }
});

router.get('/:sessionId/participants', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        res.json({
            success: true,
            data: session.participants
        });
    } catch (error) {
        console.error('Error getting participants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get participants'
        });
    }
});

router.post('/:sessionId/chat/message', verifyToken, (req, res) => {
    try {
        const { message } = req.body;
        const chatMessage = sessionManager.addChatMessage(req.params.sessionId, req.user.id, req.user.username, message);
        res.json({
            success: true,
            data: chatMessage
        });
    } catch (error) {
        console.error('Error adding chat message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add chat message'
        });
    }
});

router.get('/:sessionId/chat/messages', (req, res) => {
    try {
        const messages = sessionManager.getChatMessages(req.params.sessionId);
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error getting chat messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat messages'
        });
    }
});

// WebRTC signaling routes
router.post('/:sessionId/webrtc/offer', verifyToken, (req, res) => {
    try {
        const { offer } = req.body;
        const signals = sessionManager.addWebRTCSignal(req.params.sessionId, {
            type: 'offer',
            userId: req.user.id,
            offer
        });
        res.json({
            success: true,
            data: signals
        });
    } catch (error) {
        console.error('Error adding WebRTC offer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add WebRTC offer'
        });
    }
});

router.post('/:sessionId/webrtc/answer', verifyToken, (req, res) => {
    try {
        const { answer } = req.body;
        const signals = sessionManager.addWebRTCSignal(req.params.sessionId, {
            type: 'answer',
            userId: req.user.id,
            answer
        });
        res.json({
            success: true,
            data: signals
        });
    } catch (error) {
        console.error('Error adding WebRTC answer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add WebRTC answer'
        });
    }
});

router.post('/:sessionId/webrtc/ice-candidate', verifyToken, (req, res) => {
    try {
        const { candidate } = req.body;
        const signals = sessionManager.addWebRTCSignal(req.params.sessionId, {
            type: 'ice-candidate',
            userId: req.user.id,
            candidate
        });
        res.json({
            success: true,
            data: signals
        });
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add ICE candidate'
        });
    }
});

// Session management
router.delete('/:sessionId/end', verifyToken, async (req, res) => {
    try {
        const success = await sessionManager.deleteSession(req.params.sessionId, req.user.id);
        if (!success) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized or session not found'
            });
        }
        res.json({
            success: true,
            message: 'Session ended successfully'
        });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to end session'
        });
    }
});

router.post('/:sessionId/leave', verifyToken, async (req, res) => {
    try {
        const success = await sessionManager.leaveSession(req.params.sessionId, req.user.id);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        res.json({
            success: true,
            message: 'Successfully left the session'
        });
    } catch (error) {
        console.error('Error leaving session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave session'
        });
    }
});

module.exports = router;
