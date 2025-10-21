const UserSignUp = require('../models/UserSignUp.models');
const UserLogin = require('../models/UserLogin.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get user profile
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
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;

        // Check if email or username already exists
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
            { username, email },
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

// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        const user = await UserLogin.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserSignUp.find().select('-password');
        
        res.status(200).json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserSignUp.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Also delete from UserLogin
        await UserLogin.findOneAndDelete({ email: user.email });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await UserSignUp.countDocuments();
        const newUsersToday = await UserSignUp.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                newUsersToday
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
