const express = require('express');
const enhancedUserController = require('../controller/enhancedUser.controller.js');
// const authMiddleware = require('../middleware/auth.middleware.js');
const { auth: authMiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

// User profile management
router.get('/profile', authMiddleware, enhancedUserController.getUserProfile);
router.put('/profile', authMiddleware, enhancedUserController.updateUserProfile);
router.patch('/profile/preferences', authMiddleware, enhancedUserController.updateUserPreferences);
router.delete('/profile', authMiddleware, enhancedUserController.deleteUserAccount);

// User activity tracking
router.get('/activity', authMiddleware, enhancedUserController.getUserActivity);
router.post('/activity', authMiddleware, enhancedUserController.logUserActivity);
router.get('/activity/stats', authMiddleware, enhancedUserController.getActivityStats);

// User settings
router.get('/settings', authMiddleware, enhancedUserController.getUserSettings);
router.put('/settings', authMiddleware, enhancedUserController.updateUserSettings);
router.post('/settings/reset', authMiddleware, enhancedUserController.resetUserSettings);

// User dashboard data
router.get('/dashboard', authMiddleware, enhancedUserController.getDashboardData);
router.get('/dashboard/stats', authMiddleware, enhancedUserController.getDashboardStats);
router.get('/dashboard/recent-activity', authMiddleware, enhancedUserController.getRecentActivity);

// Social features
router.get('/friends', authMiddleware, enhancedUserController.getFriendsList);
router.post('/friends/add', authMiddleware, enhancedUserController.addFriend);
router.delete('/friends/remove', authMiddleware, enhancedUserController.removeFriend);
router.get('/friends/requests', authMiddleware, enhancedUserController.getFriendRequests);

// User search and discovery
router.get('/search', authMiddleware, enhancedUserController.searchUsers);
router.get('/suggestions', authMiddleware, enhancedUserController.getUserSuggestions);

// User content management
router.get('/content', authMiddleware, enhancedUserController.getUserContent);
router.post('/content/save', authMiddleware, enhancedUserController.saveUserContent);
router.delete('/content/:contentId', authMiddleware, enhancedUserController.deleteUserContent);

// User achievements and badges
router.get('/achievements', authMiddleware, enhancedUserController.getUserAchievements);
router.post('/achievements/claim', authMiddleware, enhancedUserController.claimAchievement);

// User subscription management
router.get('/subscription', authMiddleware, enhancedUserController.getSubscriptionStatus);
router.post('/subscription/upgrade', authMiddleware, enhancedUserController.upgradeSubscription);
router.post('/subscription/cancel', authMiddleware, enhancedUserController.cancelSubscription);

// User export functionality
router.get('/export/profile', authMiddleware, enhancedUserController.exportUserProfile);
router.get('/export/data', authMiddleware, enhancedUserController.exportUserData);

module.exports = router;
