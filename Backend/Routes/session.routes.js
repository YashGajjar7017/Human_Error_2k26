const express = require('express');
const { sessionManager } = require('../controller/session.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Session management routes
router.post('/create', (req, res) => {
    const { creatorId, settings } = req.body;
    const session = sessionManager.createSession(creatorId, settings);
    res.json(session);
});

router.get('/:sessionId', (req, res) => {
    const session = sessionManager.getSession(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
});

router.post('/:sessionId/join', (req, res) => {
    const { userId, username } = req.body;
    const session = sessionManager.joinSession(req.params.sessionId, userId, username);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    if (session.error) {
        return res.status(400).json(session);
    }
    res.json(session);
});

router.put('/:sessionId/update', (req, res) => {
    const { code, userId } = req.body;
    const success = sessionManager.updateSessionCode(req.params.sessionId, code, userId);
    if (!success) {
        return res.status(403).json({ error: 'Unauthorized or session not found' });
    }
    res.json({ success: true });
});

router.get('/:sessionId/share', (req, res) => {
    const session = sessionManager.getSession(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ joinCode: session.joinCode });
});

router.get('/active', (req, res) => {
    const sessions = sessionManager.getActiveSessions();
    res.json(sessions);
});

// Enhanced collaborative coding routes
router.post('/:sessionId/code/save', (req, res) => {
    const { code, userId } = req.body;
    const success = sessionManager.updateSessionCode(req.params.sessionId, code, userId);
    if (!success) {
        return res.status(403).json({ error: 'Unauthorized or session not found' });
    }
    res.json({ success: true });
});

router.get('/:sessionId/code/get', (req, res) => {
    const session = sessionManager.getSession(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ code: session.code });
});

router.post('/:sessionId/cursor/update', (req, res) => {
    const { userId, cursorData } = req.body;
    const cursors = sessionManager.updateCursor(req.params.sessionId, userId, cursorData);
    res.json(cursors);
});

router.get('/:sessionId/participants', (req, res) => {
    const session = sessionManager.getSession(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session.participants);
});

router.post('/:sessionId/chat/message', (req, res) => {
    const { userId, username, message } = req.body;
    const chatMessage = sessionManager.addChatMessage(req.params.sessionId, userId, username, message);
    res.json(chatMessage);
});

router.get('/:sessionId/chat/messages', (req, res) => {
    const messages = sessionManager.getChatMessages(req.params.sessionId);
    res.json(messages);
});

// WebRTC signaling routes
router.post('/:sessionId/webrtc/offer', (req, res) => {
    const { userId, offer } = req.body;
    const signals = sessionManager.addWebRTCSignal(req.params.sessionId, {
        type: 'offer',
        userId,
        offer
    });
    res.json(signals);
});

router.post('/:sessionId/webrtc/answer', (req, res) => {
    const { userId, answer } = req.body;
    const signals = sessionManager.addWebRTCSignal(req.params.sessionId, {
        type: 'answer',
        userId,
        answer
    });
    res.json(signals);
});

router.post('/:sessionId/webrtc/ice-candidate', (req, res) => {
    const { userId, candidate } = req.body;
    const signals = sessionManager.addWebRTCSignal(req.params.sessionId, {
        type: 'ice-candidate',
        userId,
        candidate
    });
    res.json(signals);
});

// Session management
router.delete('/:sessionId/end', (req, res) => {
    const { userId } = req.body;
    const success = sessionManager.deleteSession(req.params.sessionId, userId);
    if (!success) {
        return res.status(403).json({ error: 'Unauthorized or session not found' });
    }
    res.json({ success: true });
});

router.post('/:sessionId/leave', (req, res) => {
    const { userId } = req.body;
    const success = sessionManager.leaveSession(req.params.sessionId, userId);
    if (!success) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ success: true });
});

module.exports = router;
