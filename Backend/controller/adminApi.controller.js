const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const maintenanceController = require('./maintenance.controller');

// Admin Dashboard
exports.homePage = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $ne: null } });
    const newUsersToday = await User.countDocuments({
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
    const users = await User.find().select('-password');
    
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
    
    const user = await User.findById(id).select('-password');
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

    const updatedUser = await User.findByIdAndUpdate(
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

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // User is now unified, no need to delete from separate collection

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
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $ne: null } });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const newUsersThisMonth = await User.countDocuments({
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

// Get maintenance status for frontend admin panel
exports.getMaintenanceStatusForAdmin = async (req, res) => {
  try {
    const maintenanceController = require('./maintenance.controller');
    // Access the maintenance manager directly
    const status = maintenanceController.maintenanceManager.getMaintenanceInfo();

    res.status(200).json({
      success: true,
      maintenance: status
    });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin XML Configuration Management
const ADMIN_CONFIG_PATH = path.join(__dirname, '../admin.xml');

// Get admin configuration
exports.getAdminConfig = async (req, res) => {
  try {
    if (!fs.existsSync(ADMIN_CONFIG_PATH)) {
      return res.status(404).json({ error: 'Admin configuration not found' });
    }

    const configData = fs.readFileSync(ADMIN_CONFIG_PATH, 'utf8');
    res.set('Content-Type', 'application/xml');
    res.send(configData);
  } catch (error) {
    console.error('Error reading admin config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update admin configuration
exports.updateAdminConfig = async (req, res) => {
  try {
    const xmlData = req.body;

    // Basic validation - ensure it's XML-like
    if (!xmlData || typeof xmlData !== 'string' || !xmlData.includes('<admin-config>')) {
      return res.status(400).json({ error: 'Invalid XML configuration' });
    }

    fs.writeFileSync(ADMIN_CONFIG_PATH, xmlData, 'utf8');

    res.status(200).json({
      success: true,
      message: 'Admin configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Maintenance Control Functions (Direct calls to maintenance controller)

// Get maintenance status
exports.getMaintenanceStatus = maintenanceController.getMaintenanceStatus;

// Enable maintenance
exports.enableMaintenance = maintenanceController.enableMaintenance;

// Disable maintenance
exports.disableMaintenance = maintenanceController.disableMaintenance;

// Update maintenance message
exports.updateMaintenanceMessage = maintenanceController.updateMaintenanceMessage;

// Add allowed IP
exports.addAllowedIP = maintenanceController.addAllowedIP;

// Remove allowed IP
exports.removeAllowedIP = maintenanceController.removeAllowedIP;
