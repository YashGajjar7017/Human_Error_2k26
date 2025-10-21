const UserSignUp = require('../models/UserSignUp.models');
const UserLogin = require('../models/UserLogin.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get user profile with additional data
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await UserSignUp.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture || null,
                bio: user.bio || '',
                location: user.location || '',
                website: user.website || '',
                socialLinks: user.socialLinks || {},
                preferences: user.preferences || {},
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLogin: user.lastLogin || null,
                isVerified: user.isVerified || false,
                accountType: user.accountType || 'basic'
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user profile with validation
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, bio, location, website, socialLinks, profilePicture } = req.body;

        // Check for existing username/email
        const existingUser = await UserSignUp.findOne({
            $or: [{ email }, { username }],
            _id: { $ne: userId }
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: existingUser.email === email ? 'Email already in use' : 'Username already taken' 
            });
        }

        const updatedUser = await UserSignUp.findByIdAndUpdate(
            userId,
            { 
                username, 
                email, 
                bio, 
                location, 
                website, 
                socialLinks, 
                profilePicture,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = req.body;

        const user = await UserSignUp.findByIdAndUpdate(
            userId,
            { preferences },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete user account
exports.deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        const user = await UserLogin.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Delete user from both collections
        await UserSignUp.findByIdAndDelete(userId);
        await UserLogin.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user activity (placeholder implementation)
exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, type } = req.query;

        // Placeholder - return empty array until activity tracking is implemented
        res.status(200).json({
            success: true,
            activities: [],
            pagination: {
                currentPage: parseInt(page),
                totalPages: 0,
                totalItems: 0,
                hasNext: false,
                hasPrev: false
            }
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Log user activity
exports.logUserActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, description, metadata } = req.body;

        // Mock implementation - replace with actual database save
        console.log(`Activity logged for user ${userId}:`, { type, description, metadata });

        res.status(201).json({
            success: true,
            message: 'Activity logged successfully'
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get activity statistics
exports.getActivityStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Mock statistics - replace with actual database queries
        const stats = {
            totalLogins: 42,
            totalCompilations: 156,
            totalCodeRuns: 234,
            averageSessionTime: 45.5,
            mostActiveHour: 14,
            mostActiveDay: 'Wednesday',
            streakDays: 7,
            lastActivity: new Date()
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user settings
exports.getUserSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await UserSignUp.findById(userId).select('settings');
        
        const defaultSettings = {
            theme: 'light',
            language: 'en',
            notifications: {
                email: true,
                push: false,
                desktop: true
            },
            privacy: {
                profileVisible: true,
                showEmail: false,
                showActivity: true
            },
            editor: {
                fontSize: 14,
                tabSize: 4,
                autoSave: true,
                wordWrap: true
            }
        };

        res.status(200).json({
            success: true,
            settings: user.settings || defaultSettings
        });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user settings
exports.updateUserSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = req.body;

        const user = await UserSignUp.findByIdAndUpdate(
            userId,
            { settings },
            { new: true }
        ).select('settings');

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            settings: user.settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset user settings to defaults
exports.resetUserSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const defaultSettings = {
            theme: 'light',
            language: 'en',
            notifications: { email: true, push: false, desktop: true },
            privacy: { profileVisible: true, showEmail: false, showActivity: true },
            editor: { fontSize: 14, tabSize: 4, autoSave: true, wordWrap: true }
        };

        await UserSignUp.findByIdAndUpdate(userId, { settings: defaultSettings });

        res.status(200).json({
            success: true,
            message: 'Settings reset to defaults'
        });
    } catch (error) {
        console.error('Error resetting settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Mock dashboard data - replace with actual queries
        const dashboardData = {
            user: {
                name: 'John Doe',
                avatar: '/images/avatar.jpg',
                level: 5,
                points: 1250,
                streak: 7
            },
            stats: {
                totalProjects: 12,
                totalCompilations: 156,
                totalCodeRuns: 234,
                successRate: 87.5
            },
            recentActivity: [
                { type: 'compile', message: 'Compiled C++ project', time: '2 hours ago' },
                { type: 'run', message: 'Executed Python script', time: '4 hours ago' },
                { type: 'debug', message: 'Debugged Java application', time: '1 day ago' }
            ],
            upcomingTasks: [
                { title: 'Complete algorithm challenge', due: 'Tomorrow' },
                { title: 'Review code documentation', due: 'In 2 days' }
            ]
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Mock statistics - replace with actual queries
        const stats = {
            weekly: {
                compilations: 23,
                runs: 45,
                errors: 5,
                warnings: 12
            },
            monthly: {
                compilations: 89,
                runs: 156,
                errors: 23,
                warnings: 45
            },
            yearly: {
                compilations: 1200,
                runs: 2400,
                errors: 156,
                warnings: 345
            }
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        // Mock recent activity - replace with actual queries
        const recentActivity = [
            { type: 'login', message: 'Logged in successfully', timestamp: new Date(Date.now() - 3600000) },
            { type: 'compile', message: 'Compiled C++ code', timestamp: new Date(Date.now() - 7200000) },
            { type: 'run', message: 'Executed Python script', timestamp: new Date(Date.now() - 86400000) },
            { type: 'debug', message: 'Debugged Java application', timestamp: new Date(Date.now() - 172800000) }
        ];

        res.status(200).json({
            success: true,
            activities: recentActivity.slice(0, limit)
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Search users
exports.searchUsers = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;

        // Mock search - replace with actual database queries
        const mockUsers = [
            { id: 1, username: 'johndoe', email: 'john@example.com', avatar: '/avatars/1.jpg' },
            { id: 2, username: 'janedoe', email: 'jane@example.com', avatar: '/avatars/2.jpg' },
            { id: 3, username: 'bobsmith', email: 'bob@example.com', avatar: '/avatars/3.jpg' }
        ];

        const filteredUsers = mockUsers.filter(user => 
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );

        res.status(200).json({
            success: true,
            users: filteredUsers.slice((page - 1) * limit, page * limit),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(filteredUsers.length / limit),
                totalItems: filteredUsers.length
            }
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Export user profile
exports.exportUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await UserSignUp.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const exportData = {
            profile: user,
            exportDate: new Date().toISOString(),
            format: 'json'
        };

        res.setHeader('Content-Disposition', 'attachment; filename="user-profile.json"');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(exportData);
    } catch (error) {
        console.error('Error exporting profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Export user data (GDPR compliance)
exports.exportUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch actual user data
        const userProfile = await UserSignUp.findById(userId).select('-password');
        const userLogin = await UserLogin.findById(userId).select('-password');
        
        if (!userProfile || !userLogin) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = {
            profile: {
                id: userProfile._id,
                username: userProfile.username,
                email: userProfile.email,
                profilePicture: userProfile.profilePicture,
                bio: userProfile.bio,
                location: userProfile.location,
                website: userProfile.website,
                socialLinks: userProfile.socialLinks,
                preferences: userProfile.preferences,
                settings: userProfile.settings,
                createdAt: userProfile.createdAt,
                updatedAt: userProfile.updatedAt,
                lastLogin: userProfile.lastLogin,
                isVerified: userProfile.isVerified,
                accountType: userProfile.accountType
            },
            loginData: {
                email: userLogin.email,
                createdAt: userLogin.createdAt,
                updatedAt: userLogin.updatedAt
            },
            exportDate: new Date().toISOString(),
            format: 'json'
        };

        res.setHeader('Content-Disposition', 'attachment; filename="user-data-export.json"');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error exporting user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Placeholder functions for social features
exports.getFriendsList = async (req, res) => {
    res.status(200).json({ success: true, friends: [] });
};

exports.addFriend = async (req, res) => {
    res.status(200).json({ success: true, message: 'Friend request sent' });
};

exports.removeFriend = async (req, res) => {
    res.status(200).json({ success: true, message: 'Friend removed' });
};

exports.getFriendRequests = async (req, res) => {
    res.status(200).json({ success: true, requests: [] });
};

exports.getUserSuggestions = async (req, res) => {
    res.status(200).json({ success: true, suggestions: [] });
};

exports.getUserContent = async (req, res) => {
    res.status(200).json({ success: true, content: [] });
};

exports.saveUserContent = async (req, res) => {
    res.status(201).json({ success: true, message: 'Content saved' });
};

exports.deleteUserContent = async (req, res) => {
    res.status(200).json({ success: true, message: 'Content deleted' });
};

exports.getUserAchievements = async (req, res) => {
    res.status(200).json({ success: true, achievements: [] });
};

exports.claimAchievement = async (req, res) => {
    res.status(200).json({ success: true, message: 'Achievement claimed' });
};

exports.getSubscriptionStatus = async (req, res) => {
    res.status(200).json({ success: true, subscription: { type: 'free', status: 'active' } });
};

exports.upgradeSubscription = async (req, res) => {
    res.status(200).json({ success: true, message: 'Subscription upgraded' });
};

exports.cancelSubscription = async (req, res) => {
    res.status(200).json({ success: true, message: 'Subscription cancelled' });
};

