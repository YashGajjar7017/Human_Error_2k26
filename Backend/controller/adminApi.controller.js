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

// System Settings Management
const SETTINGS_FILE = path.join(__dirname, '../settings.json');

// Get system settings
exports.getSettings = async (req, res) => {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      // Return default settings
      const defaultSettings = {
        systemName: 'Node Compiler',
        maxUsers: 1000,
        sessionTimeout: 60,
        debugMode: false,
        maintenanceMode: false,
        logLevel: 'info'
      };
      return res.status(200).json({
        success: true,
        settings: defaultSettings
      });
    }

    const settingsData = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(settingsData);

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Save system settings
exports.saveSettings = async (req, res) => {
  try {
    const settings = req.body;

    // Basic validation
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Analytics endpoint for admin panel
exports.getAnalytics = async (req, res) => {
  try {
    const analyticsController = require('./analytics.controller');

    // Get system analytics data
    const systemAnalytics = await analyticsController.getSystemAnalytics({}, { json: (data) => data });
    const usageAnalytics = await analyticsController.getSystemUsageAnalytics({ query: { days: 7 } }, { json: (data) => data });
    const performanceAnalytics = await analyticsController.getSystemPerformanceAnalytics({}, { json: (data) => data });

    // Aggregate data for admin panel
    const analytics = {
      newUsersToday: systemAnalytics.data?.overview?.totalUsers || 0,
      activeSessions: systemAnalytics.data?.overview?.activeUsers || 0,
      apiCalls: usageAnalytics.data?.reduce((sum, day) => sum + day.sessions, 0) || 0,
      newUsersWeek: usageAnalytics.data?.reduce((sum, day) => sum + day.uniqueUserCount, 0) || 0,
      compilationsWeek: usageAnalytics.data?.reduce((sum, day) => sum + day.sessions, 0) || 0,
      errorRate: performanceAnalytics.data?.successRate ? (100 - performanceAnalytics.data.successRate).toFixed(1) + '%' : '0%',
      userGrowth: '+5%', // Placeholder - would need historical data
      performance: 'Good', // Placeholder - based on metrics
      issues: 0 // Placeholder
    };

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// System logs endpoint
exports.getLogs = async (req, res) => {
  try {
    // For now, return mock logs. In a real implementation, you'd read from log files
    const logs = [
      '[2024-01-15 10:30:15] INFO: Server started successfully',
      '[2024-01-15 10:30:16] INFO: Database connected',
      '[2024-01-15 10:35:22] INFO: Admin login: admin@example.com',
      '[2024-01-15 10:45:33] WARN: High memory usage detected',
      '[2024-01-15 11:00:00] INFO: Maintenance mode enabled',
      '[2024-01-15 11:30:00] INFO: Maintenance mode disabled',
      '[2024-01-15 12:15:45] ERROR: Failed login attempt',
      '[2024-01-15 13:20:10] INFO: New user registered: user@example.com',
      '[2024-01-15 14:05:22] INFO: Compilation completed successfully',
      '[2024-01-15 15:30:45] WARN: Rate limit exceeded for IP 192.168.1.100'
    ];

    res.status(200).json({
      success: true,
      logs: logs.join('\n')
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
