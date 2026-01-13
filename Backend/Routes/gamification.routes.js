// Gamification Routes
// Points, levels, achievements, and leaderboard

const express = require('express');
const router = express.Router();

// In-memory storage
const userGamification = new Map();
const leaderboard = [];

// Achievement definitions
const achievements = [
    { id: 'first_steps', name: 'First Steps', description: 'Complete your first challenge', icon: '🌟', points: 50 },
    { id: 'on_fire', name: 'On Fire', description: 'Complete 10 challenges in a row', icon: '🔥', points: 200 },
    { id: 'bug_hunter', name: 'Bug Hunter', description: 'Find and report 5 bugs', icon: '🐛', points: 150 },
    { id: 'code_master', name: 'Code Master', description: 'Write 1000 lines of code', icon: '💻', points: 300 },
    { id: 'sharpshooter', name: 'Sharpshooter', description: 'Solve a challenge without hints', icon: '🎯', points: 100 },
    { id: 'team_player', name: 'Team Player', description: 'Collaborate on 5 projects', icon: '🤝', points: 250 },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a challenge in under 5 minutes', icon: '⚡', points: 150 },
    { id: 'champion', name: 'Champion', description: 'Win a coding competition', icon: '🏆', points: 500 },
    { id: 'bookworm', name: 'Bookworm', description: 'Complete 5 learning modules', icon: '📚', points: 200 },
    { id: 'artist', name: 'Artist', description: 'Create a beautiful UI component', icon: '🎨', points: 150 },
    { id: 'early_bird', name: 'Early Bird', description: 'Log in 7 days in a row', icon: '🚀', points: 100 },
    { id: 'diamond', name: 'Diamond', description: 'Reach level 50', icon: '💎', points: 1000 }
];

// Get user gamification data
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let data = userGamification.get(userId);
        
        if (!data) {
            data = {
                userId,
                points: 0,
                level: 1,
                streak: 0,
                achievements: [],
                rank: null,
                challengesCompleted: 0,
                linesOfCode: 0,
                createdAt: new Date().toISOString()
            };
            userGamification.set(userId, data);
        }
        
        // Calculate level based on points
        data.level = Math.floor(data.points / 100) + 1;
        
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add points to user
router.post('/user/:userId/points', async (req, res) => {
    try {
        const { userId } = req.params;
        const { points, reason } = req.body;
        
        let data = userGamification.get(userId);
        if (!data) {
            data = {
                userId,
                points: 0,
                level: 1,
                streak: 0,
                achievements: [],
                challengesCompleted: 0,
                linesOfCode: 0,
                createdAt: new Date().toISOString()
            };
        }
        
        data.points += points;
        data.level = Math.floor(data.points / 100) + 1;
        data.updatedAt = new Date().toISOString();
        
        if (reason) {
            data.lastActivity = { points, reason, date: new Date().toISOString() };
        }
        
        userGamification.set(userId, data);
        
        res.json({ 
            success: true, 
            data: {
                pointsEarned: points,
                totalPoints: data.points,
                level: data.level
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all achievements
router.get('/achievements', async (req, res) => {
    try {
        res.json({ success: true, data: achievements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unlock achievement
router.post('/user/:userId/achievement/:achievementId', async (req, res) => {
    try {
        const { userId, achievementId } = req.params;
        
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) {
            return res.status(404).json({ success: false, error: 'Achievement not found' });
        }
        
        let data = userGamification.get(userId);
        if (!data) {
            data = {
                userId,
                points: 0,
                level: 1,
                streak: 0,
                achievements: [],
                challengesCompleted: 0,
                linesOfCode: 0,
                createdAt: new Date().toISOString()
            };
        }
        
        // Check if already unlocked
        if (data.achievements.find(a => a.id === achievementId)) {
            return res.json({ success: false, error: 'Achievement already unlocked' });
        }
        
        // Add achievement
        data.achievements.push({
            ...achievement,
            unlockedAt: new Date().toISOString()
        });
        data.points += achievement.points;
        data.level = Math.floor(data.points / 100) + 1;
        data.updatedAt = new Date().toISOString();
        
        userGamification.set(userId, data);
        
        res.json({ 
            success: true, 
            data: {
                achievement,
                totalPoints: data.points,
                level: data.level
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 100, type = 'points' } = req.query;
        
        // Get all user data
        const allUsers = Array.from(userGamification.values());
        
        // Sort by points
        const sorted = allUsers.sort((a, b) => b.points - a.points);
        
        // Add ranks
        const ranked = sorted.map((user, index) => ({
            ...user,
            rank: index + 1
        }));
        
        res.json({ 
            success: true, 
            data: ranked.slice(0, parseInt(limit)),
            total: ranked.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update streak
router.post('/user/:userId/streak', async (req, res) => {
    try {
        const { userId } = req.params;
        const { increment = true } = req.body;
        
        let data = userGamification.get(userId);
        if (!data) {
            data = {
                userId,
                points: 0,
                level: 1,
                streak: 0,
                achievements: [],
                challengesCompleted: 0,
                linesOfCode: 0,
                createdAt: new Date().toISOString()
            };
        }
        
        if (increment) {
            data.streak += 1;
        } else {
            data.streak = 0;
        }
        
        data.updatedAt = new Date().toISOString();
        userGamification.set(userId, data);
        
        res.json({ success: true, data: { streak: data.streak } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Record challenge completion
router.post('/user/:userId/challenge', async (req, res) => {
    try {
        const { userId } = req.params;
        const { challengeId, score, timeSpent } = req.body;
        
        let data = userGamification.get(userId);
        if (!data) {
            data = {
                userId,
                points: 0,
                level: 1,
                streak: 0,
                achievements: [],
                challengesCompleted: 0,
                linesOfCode: 0,
                createdAt: new Date().toISOString()
            };
        }
        
        data.challengesCompleted += 1;
        data.points += score;
        data.level = Math.floor(data.points / 100) + 1;
        data.updatedAt = new Date().toISOString();
        
        // Add to recent completions
        if (!data.recentCompletions) {
            data.recentCompletions = [];
        }
        data.recentCompletions.unshift({
            challengeId,
            score,
            timeSpent,
            completedAt: new Date().toISOString()
        });
        data.recentCompletions = data.recentCompletions.slice(0, 10); // Keep last 10
        
        userGamification.set(userId, data);
        
        res.json({ 
            success: true, 
            data: {
                challengesCompleted: data.challengesCompleted,
                totalPoints: data.points,
                level: data.level
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user rank
router.get('/user/:userId/rank', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const allUsers = Array.from(userGamification.values());
        const sorted = allUsers.sort((a, b) => b.points - a.points);
        
        const userRank = sorted.findIndex(u => u.userId === userId) + 1;
        
        if (userRank === 0) {
            return res.json({ success: true, data: { rank: null, percentile: null } });
        }
        
        const percentile = ((sorted.length - userRank) / sorted.length * 100).toFixed(1);
        
        res.json({ 
            success: true, 
            data: { 
                rank: userRank,
                percentile,
                totalUsers: sorted.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

