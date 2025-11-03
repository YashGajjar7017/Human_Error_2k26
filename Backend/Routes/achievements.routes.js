const express = require('express');
const router = express.Router();
const achievementsController = require('../controller/achievements.controller');
const { auth } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for achievements endpoints
const achievementsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 achievement requests per windowMs
    message: {
        error: 'Too many achievement requests, please try again later.'
    }
});

// Get all achievements
router.get('/', achievementsController.getAchievements);

// Get achievement categories
router.get('/categories', achievementsController.getCategories);

// User achievement routes (require auth)
router.get('/user', auth, achievementsController.getUserAchievements);
router.get('/user/progress', auth, achievementsController.getUserProgress);
router.get('/user/stats', auth, achievementsController.getUserStats);

// Check and award achievements
router.post('/check', auth, achievementsLimiter, achievementsController.checkAndAwardAchievements);

// Leaderboard
router.get('/leaderboard', achievementsController.getLeaderboard);

module.exports = router;
