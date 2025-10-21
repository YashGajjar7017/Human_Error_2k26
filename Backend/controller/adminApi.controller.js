const jwt = require('jsonwebtoken');
const UserLogin = require('../models/UserLogin.models.js');
const UserSignUp = require('../models/UserSignUp.models.js');
const bcrypt = require('bcryptjs');

// Admin Dashboard
exports.homePage = async (req, res) => {
  try {
    const totalUsers = await UserSignUp.countDocuments();
    const activeUsers = await UserLogin.countDocuments();
    const newUsersToday = await UserSignUp.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      message: "Welcome to Admin Dashboard",
      stats: {
        totalUsers,
        activeUsers,
        newUsersToday
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserSignUp.find().select('-password');
    
    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await UserSignUp.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user as admin
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    const updatedUser = await UserSignUp.findByIdAndUpdate(
      id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user as admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserSignUp.findByIdAndDelete(id);
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

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await UserSignUp.countDocuments();
    const activeUsers = await UserLogin.countDocuments();
    const newUsersToday = await UserSignUp.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const newUsersThisWeek = await UserSignUp.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const newUsersThisMonth = await UserSignUp.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
