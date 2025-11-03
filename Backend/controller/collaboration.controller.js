const { auth } = require('../middleware/auth.middleware');

// In-memory storage for collaboration features (in production, use database)
let collaborations = [];
let collaborationId = 1;
let comments = [];
let commentId = 1;
let reviews = [];
let reviewId = 1;

// Collaboration sessions
const createCollaborationSession = async (req, res) => {
    try {
        const { title, description, projectId, collaborators, language, code } = req.body;
        const creatorId = req.user.id;

        if (!title || !projectId) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'projectId']
            });
        }

        const newSession = {
            id: collaborationId++,
            title: title.trim(),
            description: description?.trim() || '',
            projectId,
            creatorId,
            collaborators: collaborators || [],
            language: language || 'javascript',
            code: code || '',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activeUsers: [creatorId],
            cursorPositions: {},
            selections: {}
        };

        collaborations.push(newSession);

        res.status(201).json({
            success: true,
            session: newSession,
            message: 'Collaboration session created successfully'
        });
    } catch (error) {
        console.error('Error creating collaboration session:', error);
        res.status(500).json({
            error: 'Failed to create collaboration session'
        });
    }
};

const getCollaborationSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, projectId } = req.query;

        let userSessions = collaborations.filter(session =>
            session.creatorId === userId ||
            session.collaborators.includes(userId)
        );

        if (status) {
            userSessions = userSessions.filter(session => session.status === status);
        }

        if (projectId) {
            userSessions = userSessions.filter(session => session.projectId === projectId);
        }

        // Sort by updated date (newest first)
        userSessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.json({
            success: true,
            sessions: userSessions
        });
    } catch (error) {
        console.error('Error fetching collaboration sessions:', error);
        res.status(500).json({
            error: 'Failed to fetch collaboration sessions'
        });
    }
};

const getCollaborationSession = async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        const userId = req.user.id;

        const session = collaborations.find(s =>
            s.id === sessionId &&
            (s.creatorId === userId || s.collaborators.includes(userId))
        );

        if (!session) {
            return res.status(404).json({
                error: 'Collaboration session not found'
            });
        }

        res.json({
            success: true,
            session: session
        });
    } catch (error) {
        console.error('Error fetching collaboration session:', error);
        res.status(500).json({
            error: 'Failed to fetch collaboration session'
        });
    }
};

const updateCollaborationSession = async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        const userId = req.user.id;
        const updates = req.body;

        const sessionIndex = collaborations.findIndex(s =>
            s.id === sessionId &&
            (s.creatorId === userId || s.collaborators.includes(userId))
        );

        if (sessionIndex === -1) {
            return res.status(404).json({
                error: 'Collaboration session not found'
            });
        }

        // Update session
        collaborations[sessionIndex] = {
            ...collaborations[sessionIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            session: collaborations[sessionIndex],
            message: 'Collaboration session updated successfully'
        });
    } catch (error) {
        console.error('Error updating collaboration session:', error);
        res.status(500).json({
            error: 'Failed to update collaboration session'
        });
    }
};

const joinCollaborationSession = async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        const userId = req.user.id;

        const session = collaborations.find(s => s.id === sessionId);

        if (!session) {
            return res.status(404).json({
                error: 'Collaboration session not found'
            });
        }

        if (session.status !== 'active') {
            return res.status(400).json({
                error: 'Session is not active'
            });
        }

        if (!session.collaborators.includes(userId) && session.creatorId !== userId) {
            return res.status(403).json({
                error: 'Not authorized to join this session'
            });
        }

        if (!session.activeUsers.includes(userId)) {
            session.activeUsers.push(userId);
        }

        res.json({
            success: true,
            session: session,
            message: 'Joined collaboration session successfully'
        });
    } catch (error) {
        console.error('Error joining collaboration session:', error);
        res.status(500).json({
            error: 'Failed to join collaboration session'
        });
    }
};

const leaveCollaborationSession = async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        const userId = req.user.id;

        const session = collaborations.find(s => s.id === sessionId);

        if (!session) {
            return res.status(404).json({
                error: 'Collaboration session not found'
            });
        }

        session.activeUsers = session.activeUsers.filter(id => id !== userId);

        res.json({
            success: true,
            message: 'Left collaboration session successfully'
        });
    } catch (error) {
        console.error('Error leaving collaboration session:', error);
        res.status(500).json({
            error: 'Failed to leave collaboration session'
        });
    }
};

// Code comments
const addComment = async (req, res) => {
    try {
        const { sessionId, lineNumber, content, type } = req.body;
        const userId = req.user.id;

        if (!sessionId || !content) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['sessionId', 'content']
            });
        }

        const session = collaborations.find(s => s.id === sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Collaboration session not found'
            });
        }

        const newComment = {
            id: commentId++,
            sessionId,
            userId,
            lineNumber: lineNumber || null,
            content: content.trim(),
            type: type || 'comment',
            createdAt: new Date().toISOString(),
            resolved: false
        };

        comments.push(newComment);

        res.status(201).json({
            success: true,
            comment: newComment,
            message: 'Comment added successfully'
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            error: 'Failed to add comment'
        });
    }
};

const getComments = async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const userId = req.user.id;

        const session = collaborations.find(s =>
            s.id === sessionId &&
            (s.creatorId === userId || s.collaborators.includes(userId))
        );

        if (!session) {
            return res.status(404).json({
                error: 'Collaboration session not found'
            });
        }

        const sessionComments = comments.filter(c => c.sessionId === sessionId);

        res.json({
            success: true,
            comments: sessionComments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            error: 'Failed to fetch comments'
        });
    }
};

const resolveComment = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const userId = req.user.id;

        const comment = comments.find(c => c.id === commentId);

        if (!comment) {
            return res.status(404).json({
                error: 'Comment not found'
            });
        }

        // Check if user can resolve this comment
        const session = collaborations.find(s => s.id === comment.sessionId);
        if (!session || (session.creatorId !== userId && !session.collaborators.includes(userId))) {
            return res.status(403).json({
                error: 'Not authorized to resolve this comment'
            });
        }

        comment.resolved = true;
        comment.resolvedAt = new Date().toISOString();
        comment.resolvedBy = userId;

        res.json({
            success: true,
            comment: comment,
            message: 'Comment resolved successfully'
        });
    } catch (error) {
        console.error('Error resolving comment:', error);
        res.status(500).json({
            error: 'Failed to resolve comment'
        });
    }
};

// Code reviews
const createCodeReview = async (req, res) => {
    try {
        const { sessionId, title, description, reviewerIds } = req.body;
        const creatorId = req.user.id;

        if (!sessionId || !title || !reviewerIds || reviewerIds.length === 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['sessionId', 'title', 'reviewerIds']
            });
        }

        const session = collaborations.find(s => s.id === sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Collaboration session not found'
            });
        }

        const newReview = {
            id: reviewId++,
            sessionId,
            creatorId,
            title: title.trim(),
            description: description?.trim() || '',
            reviewerIds,
            status: 'pending',
            createdAt: new Date().toISOString(),
            comments: [],
            overallFeedback: null
        };

        reviews.push(newReview);

        res.status(201).json({
            success: true,
            review: newReview,
            message: 'Code review created successfully'
        });
    } catch (error) {
        console.error('Error creating code review:', error);
        res.status(500).json({
            error: 'Failed to create code review'
        });
    }
};

const getCodeReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId, status } = req.query;

        let userReviews = reviews.filter(review =>
            review.creatorId === userId ||
            review.reviewerIds.includes(userId)
        );

        if (sessionId) {
            userReviews = userReviews.filter(review => review.sessionId === parseInt(sessionId));
        }

        if (status) {
            userReviews = userReviews.filter(review => review.status === status);
        }

        res.json({
            success: true,
            reviews: userReviews
        });
    } catch (error) {
        console.error('Error fetching code reviews:', error);
        res.status(500).json({
            error: 'Failed to fetch code reviews'
        });
    }
};

const submitReviewFeedback = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const { feedback, rating } = req.body;
        const userId = req.user.id;

        const review = reviews.find(r => r.id === reviewId);

        if (!review) {
            return res.status(404).json({
                error: 'Code review not found'
            });
        }

        if (!review.reviewerIds.includes(userId)) {
            return res.status(403).json({
                error: 'Not authorized to submit feedback for this review'
            });
        }

        const reviewerFeedback = {
            reviewerId: userId,
            feedback: feedback?.trim() || '',
            rating: rating || null,
            submittedAt: new Date().toISOString()
        };

        if (!review.feedback) {
            review.feedback = [];
        }
        review.feedback.push(reviewerFeedback);

        // Check if all reviewers have submitted feedback
        if (review.feedback.length === review.reviewerIds.length) {
            review.status = 'completed';
        }

        res.json({
            success: true,
            review: review,
            message: 'Review feedback submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting review feedback:', error);
        res.status(500).json({
            error: 'Failed to submit review feedback'
        });
    }
};

module.exports = {
    createCollaborationSession,
    getCollaborationSessions,
    getCollaborationSession,
    updateCollaborationSession,
    joinCollaborationSession,
    leaveCollaborationSession,
    addComment,
    getComments,
    resolveComment,
    createCodeReview,
    getCodeReviews,
    submitReviewFeedback
};
