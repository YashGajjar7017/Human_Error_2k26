const User = require('../models/User.model');
const Session = require('../models/Session.model');
const Classroom = require('../models/Classroom.model');

const analyticsController = {
  // User analytics
  getUserAnalytics: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user statistics
      const user = await User.findById(userId);
      const totalSessions = await Session.countDocuments({ userId });
      const totalClassrooms = await Classroom.countDocuments({ 
        $or: [{ creator: userId }, { members: userId }] 
      });
      
      // Get recent activity
      const recentSessions = await Session.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);
      
      res.json({
        success: true,
        data: {
          user: {
            name: user.name,
            email: user.email,
            joinDate: user.createdAt
          },
          statistics: {
            totalSessions,
            totalClassrooms,
            accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
          },
          recentSessions
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getUserActivityAnalytics: async (req, res) => {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const activityData = await Session.aggregate([
        { $match: { userId: userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            sessions: { $sum: 1 },
            totalDuration: { $sum: "$duration" },
            avgDuration: { $avg: "$duration" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]);
      
      res.json({ success: true, data: activityData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getUserPerformanceAnalytics: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const performanceData = await Session.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            successfulSessions: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            },
            failedSessions: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
            },
            totalErrors: { $sum: { $size: "$errors" } },
            avgDuration: { $avg: "$duration" }
          }
        }
      ]);
      
      const successRate = performanceData[0] ? 
        (performanceData[0].successfulSessions / performanceData[0].totalSessions) * 100 : 0;
      
      res.json({
        success: true,
        data: {
          ...performanceData[0],
          successRate: Math.round(successRate * 100) / 100
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getUserTrends: async (req, res) => {
    try {
      const userId = req.user.id;
      const { period = 'monthly' } = req.query;
      
      let groupBy;
      switch (period) {
        case 'daily':
          groupBy = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
          break;
        case 'weekly':
          groupBy = { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } };
          break;
        case 'monthly':
        default:
          groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
      }
      
      const trends = await Session.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: groupBy,
            sessions: { $sum: 1 },
            avgDuration: { $avg: "$duration" },
            errors: { $sum: { $size: "$errors" } }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]);
      
      res.json({ success: true, data: trends });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // System analytics
  getSystemAnalytics: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalSessions = await Session.countDocuments();
      const totalClassrooms = await Classroom.countDocuments();
      
      const activeUsers = await Session.distinct('userId', {
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      
      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalSessions,
            totalClassrooms,
            activeUsers: activeUsers.length
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getSystemUsageAnalytics: async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const usageData = await Session.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            sessions: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            totalDuration: { $sum: "$duration" }
          }
        },
        {
          $addFields: {
            uniqueUserCount: { $size: "$uniqueUsers" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]);
      
      res.json({ success: true, data: usageData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getSystemPerformanceAnalytics: async (req, res) => {
    try {
      const performanceData = await Session.aggregate([
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            avgDuration: { $avg: "$duration" },
            totalErrors: { $sum: { $size: "$errors" } },
            successRate: {
              $avg: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
              }
            }
          }
        }
      ]);
      
      res.json({ success: true, data: performanceData[0] || {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getRealTimeAnalytics: async (req, res) => {
    try {
      const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
      
      const realTimeData = await Session.find({
        createdAt: { $gte: last5Minutes }
      }).populate('userId', 'name email');
      
      const activeUsers = [...new Set(realTimeData.map(s => s.userId))];
      
      res.json({
        success: true,
        data: {
          activeSessions: realTimeData.length,
          activeUsers: activeUsers.length,
          recentActivity: realTimeData.slice(-10)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Code analytics
  getCodeAnalytics: async (req, res) => {
    try {
      const codeData = await Session.aggregate([
        { $unwind: "$codeFiles" },
        {
          $group: {
            _id: "$codeFiles.language",
            totalFiles: { $sum: 1 },
            totalLines: { $sum: "$codeFiles.lines" },
            avgLines: { $avg: "$codeFiles.lines" }
          }
        }
      ]);
      
      res.json({ success: true, data: codeData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getLanguageStats: async (req, res) => {
    try {
      const languageStats = await Session.aggregate([
        { $unwind: "$codeFiles" },
        {
          $group: {
            _id: "$codeFiles.language",
            count: { $sum: 1 },
            percentage: {
              $avg: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      res.json({ success: true, data: languageStats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getErrorPatterns: async (req, res) => {
    try {
      const errorPatterns = await Session.aggregate([
        { $unwind: "$errors" },
        {
          $group: {
            _id: "$errors.type",
            count: { $sum: 1 },
            examples: { $push: "$errors.message" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      res.json({ success: true, data: errorPatterns });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCodeSuccessRate: async (req, res) => {
    try {
      const successRate = await Session.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successful: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            successRate: {
              $multiply: [{ $divide: ["$successful", "$total"] }, 100]
            },
            failureRate: {
              $multiply: [{ $divide: ["$failed", "$total"] }, 100]
            }
          }
        }
      ]);
      
      res.json({ success: true, data: successRate[0] || {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Compilation analytics
  getCompilationAnalytics: async (req, res) => {
    try {
      const compilationData = await Session.aggregate([
        {
          $group: {
            _id: null,
            totalCompilations: { $sum: 1 },
            successfulCompilations: {
              $sum: { $cond: [{ $eq: ["$compilationStatus", "success"] }, 1, 0] }
            },
            failedCompilations: {
              $sum: { $cond: [{ $eq: ["$compilationStatus", "failed"] }, 1, 0] }
            },
            avgCompilationTime: { $avg: "$compilationTime" }
          }
        }
      ]);
      
      res.json({ success: true, data: compilationData[0] || {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCompilationHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 50 } = req.query;
      
      const history = await Session.find({ userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('createdAt status compilationTime compilationStatus errors');
      
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCompilationEfficiency: async (req, res) => {
    try {
      const efficiencyData = await Session.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            totalCompilations: { $sum: 1 },
            successfulCompilations: {
              $sum: { $cond: [{ $eq: ["$compilationStatus", "success"] }, 1, 0] }
            },
            avgCompilationTime: { $avg: "$compilationTime" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]);
      
      res.json({ success: true, data: efficiencyData });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Export analytics
  exportUserAnalytics: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const userData = await User.findById(userId);
      const userSessions = await Session.find({ userId });
      
      const exportData = {
        user: userData,
        sessions: userSessions,
        exportDate: new Date()
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=user-analytics-${userId}.json`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  exportSystemAnalytics: async (req, res) => {
    try {
      const systemData = {
        users: await User.find(),
        sessions: await Session.find(),
        classrooms: await Classroom.find(),
        exportDate: new Date()
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=system-analytics-${Date.now()}.json`);
      res.json(systemData);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Custom analytics
  runCustomQuery: async (req, res) => {
    try {
      const { query, collection } = req.body;
      
      if (!query || !collection) {
        return res.status(400).json({ 
          success: false, 
          error: 'Query and collection are required' 
        });
      }
      
      // Validate collection name
      const allowedCollections = ['users', 'sessions', 'classrooms'];
      if (!allowedCollections.includes(collection)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid collection' 
        });
      }
      
      let result;
      switch (collection) {
        case 'users':
          result = await User.aggregate(query);
          break;
        case 'sessions':
          result = await Session.aggregate(query);
          break;
        case 'classrooms':
          result = await Classroom.aggregate(query);
          break;
      }
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCustomReports: async (req, res) => {
    try {
      // For now, return a list of available custom reports
      const reports = [
        {
          id: 'user-activity-summary',
          name: 'User Activity Summary',
          description: 'Summary of user activity over time'
        },
        {
          id: 'system-performance',
          name: 'System Performance',
          description: 'Overall system performance metrics'
        },
        {
          id: 'code-quality',
          name: 'Code Quality',
          description: 'Code quality and error analysis'
        }
      ];
      
      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = analyticsController;
