const { auth } = require('../middleware/auth.middleware');

// In-memory storage for achievements (in production, use database)
let achievements = [];
let userAchievements = [];
let achievementId = 1;

// Predefined achievements
const predefinedAchievements = [
    {
        id: 1,
        title: 'First Compilation',
        description: 'Successfully compile your first code',
        icon: '🚀',
        category: 'compilation',
        criteria: { compilations: 1 },
        points: 10,
        rarity: 'common'
    },
    {
        id: 2,
        title: 'Code Master',
        description: 'Compile 100 successful programs',
        icon: '👑',
        category: 'compilation',
        criteria: { compilations: 100 },
        points: 100,
        rarity: 'rare'
    },
    {
        id: 3,
        title: 'Bug Hunter',
        description: 'Fix 50 compilation errors',
        icon: '🐛',
        category: 'debugging',
        criteria: { errorsFixed: 50 },
        points: 75,
        rarity: 'uncommon'
    },
    {
        id: 4,
        title: 'Collaborator',
        description: 'Join 10 collaboration sessions',
        icon: '🤝',
        category: 'collaboration',
        criteria: { collaborations: 10 },
        points: 50,
        rarity: 'uncommon'
    },
    {
        id: 5,
        title: 'Project Creator',
        description: 'Create 5 projects',
        icon: '📁',
        category: 'projects',
        criteria: { projects: 5 },
        points: 40,
        rarity: 'uncommon'
    },
    {
        id: 6,
        title: 'Streak Master',
        description: 'Maintain a 30-day coding streak',
        icon: '🔥',
        category: 'consistency',
        criteria: { streak: 30 },
        points: 150,
        rarity: 'epic'
    },
    {
        id: 7,
        title: 'Code Reviewer',
        description: 'Complete 25 code reviews',
        icon: '👁️',
        category: 'collaboration',
        criteria: { reviews: 25 },
        points: 80,
        rarity: 'rare'
    },
    {
        id: 8,
        title: 'Language Explorer',
        description: 'Compile code in 5 different languages',
        icon: '🌍',
        category: 'diversity',
        criteria: { languages: 5 },
        points: 60,
        rarity: 'uncommon'
    },
    {
        id: 9,
        title: 'Speed Demon',
        description: 'Complete 10 compilations in under 1 second each',
        icon: '⚡',
        category: 'performance',
        criteria: { fastCompilations: 10 },
        points: 90,
        rarity: 'rare'
    },
    {
        id: 10,
        title: 'Legend',
        description: 'Reach 1000 total points',
        icon: '⭐',
        category: 'milestone',
        criteria: { totalPoints: 1000 },
        points: 200,
        rarity: 'legendary'
    }
];

// Initialize achievements if not already done
if (achievements.length === 0) {
    achievements = [...predefinedAchievements];
}

// Get all achievements
const getAchievements = async (req, res) => {
    try {
        res.json({
            success: true,
            achievements: achievements
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            error: 'Failed to fetch achievements'
        });
    }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.user.id;

        const userAchievementRecords = userAchievements.filter(ua => ua.userId === userId);

        // Get full achievement details
        const userAchievementsWithDetails = userAchievementRecords.map(ua => {
            const achievement = achievements.find(a => a.id === ua.achievementId);
            return {
                ...achievement,
                unlockedAt: ua.unlockedAt,
                progress: ua.progress
            };
        });

        res.json({
            success: true,
            achievements: userAchievementsWithDetails
        });
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({
            error: 'Failed to fetch user achievements'
        });
    }
};

// Get user achievement progress
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Calculate progress for each achievement
        const progress = achievements.map(achievement => {
            const userAchievement = userAchievements.find(
                ua => ua.userId === userId && ua.achievementId === achievement.id
            );

            // Mock progress calculation (in real app, this would come from user activity data)
            const mockProgress = {
                compilations: Math.floor(Math.random() * achievement.criteria.compilations * 2),
                errorsFixed: Math.floor(Math.random() * achievement.criteria.errorsFixed * 2),
                collaborations: Math.floor(Math.random() * achievement.criteria.collaborations * 2),
                projects: Math.floor(Math.random() * achievement.criteria.projects * 2),
                streak: Math.floor(Math.random() * achievement.criteria.streak * 2),
                reviews: Math.floor(Math.random() * achievement.criteria.reviews * 2),
                languages: Math.floor(Math.random() * achievement.criteria.languages * 2),
                fastCompilations: Math.floor(Math.random() * achievement.criteria.fastCompilations * 2),
                totalPoints: Math.floor(Math.random() * achievement.criteria.totalPoints * 2)
            };

            const criteriaKey = Object.keys(achievement.criteria)[0];
            const currentProgress = mockProgress[criteriaKey] || 0;
            const targetProgress = achievement.criteria[criteriaKey];
            const percentage = Math.min((currentProgress / targetProgress) * 100, 100);

            return {
                achievementId: achievement.id,
                title: achievement.title,
                currentProgress,
                targetProgress,
                percentage: Math.round(percentage),
                isCompleted: userAchievement ? true : false,
                unlockedAt: userAchievement ? userAchievement.unlockedAt : null
            };
        });

        res.json({
            success: true,
            progress: progress
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            error: 'Failed to fetch user progress'
        });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const userAchievementRecords = userAchievements.filter(ua => ua.userId === userId);

        const stats = {
            totalAchievements: userAchievementRecords.length,
            totalPoints: userAchievementRecords.reduce((sum, ua) => {
                const achievement = achievements.find(a => a.id === ua.achievementId);
                return sum + (achievement ? achievement.points : 0);
            }, 0),
            achievementsByCategory: {},
            achievementsByRarity: {}
        };

        // Group by category and rarity
        userAchievementRecords.forEach(ua => {
            const achievement = achievements.find(a => a.id === ua.achievementId);
            if (achievement) {
                stats.achievementsByCategory[achievement.category] =
                    (stats.achievementsByCategory[achievement.category] || 0) + 1;
                stats.achievementsByRarity[achievement.rarity] =
                    (stats.achievementsByRarity[achievement.rarity] || 0) + 1;
            }
        });

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            error: 'Failed to fetch user stats'
        });
    }
};

// Award achievement (internal function)
const awardAchievement = async (userId, achievementId) => {
    try {
        // Check if user already has this achievement
        const existing = userAchievements.find(
            ua => ua.userId === userId && ua.achievementId === achievementId
        );

        if (existing) {
            return false; // Already awarded
        }

        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) {
            return false; // Achievement doesn't exist
        }

        const newUserAchievement = {
            userId,
            achievementId,
            unlockedAt: new Date().toISOString(),
            progress: achievement.criteria
        };

        userAchievements.push(newUserAchievement);
        return true;
    } catch (error) {
        console.error('Error awarding achievement:', error);
        return false;
    }
};

// Check and award achievements based on user activity
const checkAndAwardAchievements = async (req, res) => {
    try {
        const userId = req.user.id;
        const { activityType, count } = req.body;

        if (!activityType || !count) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['activityType', 'count']
            });
        }

        const awardedAchievements = [];

        // Check relevant achievements based on activity type
        const relevantAchievements = achievements.filter(achievement => {
            return Object.keys(achievement.criteria).some(key => {
                if (activityType === 'compilation' && key === 'compilations') return true;
                if (activityType === 'errorFix' && key === 'errorsFixed') return true;
                if (activityType === 'collaboration' && key === 'collaborations') return true;
                if (activityType === 'project' && key === 'projects') return true;
                if (activityType === 'review' && key === 'reviews') return true;
                if (activityType === 'language' && key === 'languages') return true;
                if (activityType === 'fastCompilation' && key === 'fastCompilations') return true;
                return false;
            });
        });

        for (const achievement of relevantAchievements) {
            const criteriaKey = Object.keys(achievement.criteria)[0];
            if (count >= achievement.criteria[criteriaKey]) {
                const awarded = await awardAchievement(userId, achievement.id);
                if (awarded) {
                    awardedAchievements.push(achievement);
                }
            }
        }

        res.json({
            success: true,
            awardedAchievements: awardedAchievements,
            message: awardedAchievements.length > 0 ?
                `Congratulations! You unlocked ${awardedAchievements.length} new achievement(s)!` :
                'No new achievements unlocked'
        });
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({
            error: 'Failed to check achievements'
        });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, category } = req.query;

        // Calculate points for each user
        const userPoints = {};

        userAchievements.forEach(ua => {
            const achievement = achievements.find(a => a.id === ua.achievementId);
            if (achievement) {
                if (category && achievement.category !== category) return;

                if (!userPoints[ua.userId]) {
                    userPoints[ua.userId] = {
                        userId: ua.userId,
                        totalPoints: 0,
                        achievements: 0
                    };
                }
                userPoints[ua.userId].totalPoints += achievement.points;
                userPoints[ua.userId].achievements += 1;
            }
        });

        // Convert to array and sort
        const leaderboard = Object.values(userPoints)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            leaderboard: leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            error: 'Failed to fetch leaderboard'
        });
    }
};

// Get achievement categories
const getCategories = async (req, res) => {
    try {
        const categories = [
            { id: 'compilation', name: 'Compilation', icon: '⚙️' },
            { id: 'debugging', name: 'Debugging', icon: '🐛' },
            { id: 'collaboration', name: 'Collaboration', icon: '🤝' },
            { id: 'projects', name: 'Projects', icon: '📁' },
            { id: 'consistency', name: 'Consistency', icon: '🔥' },
            { id: 'diversity', name: 'Diversity', icon: '🌍' },
            { id: 'performance', name: 'Performance', icon: '⚡' },
            { id: 'milestone', name: 'Milestones', icon: '⭐' }
        ];

        res.json({
            success: true,
            categories: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            error: 'Failed to fetch categories'
        });
    }
};

module.exports = {
    getAchievements,
    getUserAchievements,
    getUserProgress,
    getUserStats,
    checkAndAwardAchievements,
    getLeaderboard,
    getCategories,
    awardAchievement
};
