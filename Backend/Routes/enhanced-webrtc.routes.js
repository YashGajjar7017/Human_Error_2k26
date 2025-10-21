// Enhanced WebRTC signaling routes for real-time communication
const express = require('express');
const router = express.Router();
const { sessionManager } = require('../controller/session.controller');

// WebRTC signaling endpoints
router.post('/webrtc/signal/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const { from, to, signal } = req.body;

    if (!sessionId || !from || !signal) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const signals = sessionManager.addWebRTCSignal(sessionId, {
        from,
        to,
        signal,
        timestamp: new Date().toISOString()
    });

    res.json({ success: true, signals });
});

router.get('/webrtc/signals/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const signals = sessionManager.getWebRTCSignals(sessionId);
    res.json({ success: true, signals });
});

// Enhanced WebRTC endpoints
router.get('/webrtc/quality/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const signals = sessionManager.getWebRTCSignals(sessionId);
    
    // Calculate quality metrics
    const quality = {
        participantCount: signals.length,
        averageLatency: 0,
        packetLoss: 0,
        bitrate: 0
    };
    
    res.json({ success: true, quality });
});

router.post('/webrtc/record/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const { action, userId } = req.body;
    
    if (!sessionId || !action || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Handle recording actions
    const recordingStatus = {
        action,
        userId,
        sessionId,
        timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, recordingStatus });
});

// Connection quality monitoring
router.get('/webrtc/stats/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const signals = sessionManager.getWebRTCSignals(sessionId);
    
    res.json({ 
        success: true, 
        stats: {
            participantCount: signals.length,
            activeConnections: signals.filter(s => s.signal.type === 'offer' || s.signal.type === 'answer').length,
            totalSignals: signals.length
        }
    });
});

module.exports = router;
