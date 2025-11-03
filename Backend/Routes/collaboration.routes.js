const express = require('express');
const router = express.Router();
const collaborationController = require('../controller/collaboration.controller');
const { auth } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for collaboration endpoints
const collaborationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 collaboration requests per windowMs
    message: {
        error: 'Too many collaboration requests, please try again later.'
    }
});

// Input validation middleware
const validateCollaborationSession = (req, res, next) => {
    const { title, projectId } = req.body;

    if (!title || !projectId) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['title', 'projectId']
        });
    }

    if (title.trim().length < 3) {
        return res.status(400).json({
            error: 'Title must be at least 3 characters long'
        });
    }

    next();
};

const validateComment = (req, res, next) => {
    const { sessionId, content } = req.body;

    if (!sessionId || !content) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['sessionId', 'content']
        });
    }

    if (content.trim().length < 1) {
        return res.status(400).json({
            error: 'Comment content cannot be empty'
        });
    }

    next();
};

const validateCodeReview = (req, res, next) => {
    const { sessionId, title, reviewerIds } = req.body;

    if (!sessionId || !title || !reviewerIds || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['sessionId', 'title', 'reviewerIds']
        });
    }

    if (title.trim().length < 3) {
        return res.status(400).json({
            error: 'Title must be at least 3 characters long'
        });
    }

    next();
};

// Collaboration session routes
router.post('/sessions', auth, collaborationLimiter, validateCollaborationSession, collaborationController.createCollaborationSession);
router.get('/sessions', auth, collaborationController.getCollaborationSessions);
router.get('/sessions/:id', auth, collaborationController.getCollaborationSession);
router.put('/sessions/:id', auth, collaborationController.updateCollaborationSession);
router.post('/sessions/:id/join', auth, collaborationController.joinCollaborationSession);
router.post('/sessions/:id/leave', auth, collaborationController.leaveCollaborationSession);

// Comment routes
router.post('/comments', auth, collaborationLimiter, validateComment, collaborationController.addComment);
router.get('/sessions/:sessionId/comments', auth, collaborationController.getComments);
router.put('/comments/:id/resolve', auth, collaborationController.resolveComment);

// Code review routes
router.post('/reviews', auth, collaborationLimiter, validateCodeReview, collaborationController.createCodeReview);
router.get('/reviews', auth, collaborationController.getCodeReviews);
router.post('/reviews/:id/feedback', auth, collaborationController.submitReviewFeedback);

module.exports = router;
