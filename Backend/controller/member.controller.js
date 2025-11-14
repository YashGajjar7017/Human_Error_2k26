/**
 * Member Controller
 * Handles all member-related operations
 */

const User = require('../models/User.model');

// ============================================
// GET Methods
// ============================================

/**
 * Get all members with optional filters
 */
exports.getAllMembers = async (req, res) => {
    try {
        const { role, status, search, limit = 20, page = 1 } = req.query;
        
        // Build filter object
        let filter = {};
        
        if (role) {
            filter.role = role;
        }
        
        if (status) {
            filter.status = status;
        }
        
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Fetch members
        const members = await User.find(filter)
            .select('-password -token')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });
        
        // Get total count
        const total = await User.countDocuments(filter);
        
        res.json({
            success: true,
            data: members,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching members',
            error: error.message
        });
    }
};

/**
 * Get members statistics
 */
exports.getMembersStats = async (req, res) => {
    try {
        const totalMembers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const userCount = await User.countDocuments({ role: 'user' });
        const activeCount = await User.countDocuments({ status: 'active' });
        const suspendedCount = await User.countDocuments({ status: 'suspended' });
        
        // Plan statistics
        const freePlanCount = await User.countDocuments({ 'subscription.plan': 'free' });
        const proPlanCount = await User.countDocuments({ 'subscription.plan': 'pro' });
        const enterprisePlanCount = await User.countDocuments({ 'subscription.plan': 'enterprise' });
        
        res.json({
            success: true,
            data: {
                totalMembers,
                byRole: {
                    admin: adminCount,
                    user: userCount
                },
                byStatus: {
                    active: activeCount,
                    suspended: suspendedCount
                },
                byPlan: {
                    free: freePlanCount,
                    pro: proPlanCount,
                    enterprise: enterprisePlanCount
                }
            }
        });
    } catch (error) {
        console.error('Error fetching member statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

/**
 * Get member by ID
 */
exports.getMemberById = async (req, res) => {
    try {
        const { memberId } = req.params;
        
        const member = await User.findById(memberId)
            .select('-password -token');
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching member',
            error: error.message
        });
    }
};

/**
 * Get member profile with detailed info
 */
exports.getMemberProfile = async (req, res) => {
    try {
        const { memberId } = req.params;
        
        const member = await User.findById(memberId)
            .select('-password -token');
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: member._id,
                username: member.username,
                email: member.email,
                fullName: member.fullName || '',
                avatar: member.avatar || null,
                bio: member.bio || '',
                role: member.role,
                status: member.status || 'active',
                subscription: member.subscription || { plan: 'free' },
                joinDate: member.createdAt,
                lastLogin: member.lastLogin || null,
                socialLinks: member.socialLinks || {},
                preferences: member.preferences || {}
            }
        });
    } catch (error) {
        console.error('Error fetching member profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

/**
 * Get member activity logs
 */
exports.getMemberActivity = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { limit = 20, page = 1 } = req.query;
        
        const member = await User.findById(memberId)
            .select('activityLog');
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        // Mock activity data - replace with actual activity log implementation
        const activities = [
            { action: 'login', timestamp: new Date(), details: 'User logged in' },
            { action: 'compilation', timestamp: new Date(Date.now() - 3600000), details: 'Code compiled successfully' },
            { action: 'project_created', timestamp: new Date(Date.now() - 7200000), details: 'Created new project' }
        ];
        
        res.json({
            success: true,
            data: activities,
            pagination: { page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        console.error('Error fetching member activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity',
            error: error.message
        });
    }
};

/**
 * Get member projects
 */
exports.getMemberProjects = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { limit = 10, page = 1 } = req.query;
        
        // Mock projects data - replace with actual projects collection
        const projects = [
            { id: 1, name: 'Web App', language: 'JavaScript', createdAt: new Date() },
            { id: 2, name: 'API Server', language: 'Node.js', createdAt: new Date(Date.now() - 86400000) }
        ];
        
        res.json({
            success: true,
            data: projects,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: projects.length }
        });
    } catch (error) {
        console.error('Error fetching member projects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message
        });
    }
};

/**
 * Get member compilations
 */
exports.getMemberCompilations = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { limit = 10, page = 1 } = req.query;
        
        // Mock compilations data
        const compilations = [
            { id: 1, language: 'JavaScript', status: 'success', timestamp: new Date() },
            { id: 2, language: 'Python', status: 'error', timestamp: new Date(Date.now() - 3600000) }
        ];
        
        res.json({
            success: true,
            data: compilations,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: compilations.length }
        });
    } catch (error) {
        console.error('Error fetching compilations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching compilations',
            error: error.message
        });
    }
};

/**
 * Search members
 */
exports.searchMembers = async (req, res) => {
    try {
        const { query } = req.params;
        const { limit = 10 } = req.query;
        
        const members = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        })
        .select('-password -token')
        .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: members,
            count: members.length
        });
    } catch (error) {
        console.error('Error searching members:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching members',
            error: error.message
        });
    }
};

// ============================================
// POST Methods
// ============================================

/**
 * Create new member
 */
exports.createMember = async (req, res) => {
    try {
        const { username, email, password, fullName, role = 'user' } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }
        
        // Create new user
        const newUser = new User({
            username,
            email,
            password, // Should be hashed in the User model
            fullName,
            role,
            status: 'active',
            subscription: { plan: 'free' },
            createdAt: new Date()
        });
        
        await newUser.save();
        
        res.status(201).json({
            success: true,
            message: 'Member created successfully',
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating member',
            error: error.message
        });
    }
};

/**
 * Upgrade member plan
 */
exports.upgradePlan = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { plan } = req.body;
        
        const validPlans = ['free', 'pro', 'enterprise'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan'
            });
        }
        
        const member = await User.findByIdAndUpdate(
            memberId,
            { 'subscription.plan': plan, 'subscription.upgradeDate': new Date() },
            { new: true }
        );
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: `Plan upgraded to ${plan}`,
            data: member.subscription
        });
    } catch (error) {
        console.error('Error upgrading plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error upgrading plan',
            error: error.message
        });
    }
};

/**
 * Downgrade member plan
 */
exports.downgradePlan = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { plan = 'free' } = req.body;
        
        const member = await User.findByIdAndUpdate(
            memberId,
            { 'subscription.plan': plan, 'subscription.downgradeDate': new Date() },
            { new: true }
        );
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: `Plan downgraded to ${plan}`,
            data: member.subscription
        });
    } catch (error) {
        console.error('Error downgrading plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error downgrading plan',
            error: error.message
        });
    }
};

/**
 * Suspend member account
 */
exports.suspendMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { reason } = req.body;
        
        const member = await User.findByIdAndUpdate(
            memberId,
            { 
                status: 'suspended',
                suspensionReason: reason || 'No reason provided',
                suspendedAt: new Date()
            },
            { new: true }
        );
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Member account suspended',
            data: member
        });
    } catch (error) {
        console.error('Error suspending member:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspending member',
            error: error.message
        });
    }
};

/**
 * Activate member account
 */
exports.activateMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        
        const member = await User.findByIdAndUpdate(
            memberId,
            { 
                status: 'active',
                suspensionReason: null,
                suspendedAt: null
            },
            { new: true }
        );
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Member account activated',
            data: member
        });
    } catch (error) {
        console.error('Error activating member:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating member',
            error: error.message
        });
    }
};

// ============================================
// PATCH/PUT Methods
// ============================================

/**
 * Update member (partial)
 */
exports.updateMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const updateData = req.body;
        
        // Prevent password updates through this endpoint
        delete updateData.password;
        delete updateData.token;
        
        const member = await User.findByIdAndUpdate(
            memberId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -token');
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Member updated successfully',
            data: member
        });
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating member',
            error: error.message
        });
    }
};

/**
 * Update member profile (full update)
 */
exports.updateMemberProfile = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { fullName, bio, avatar, socialLinks } = req.body;
        
        const member = await User.findByIdAndUpdate(
            memberId,
            {
                fullName,
                bio,
                avatar,
                socialLinks,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password -token');
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: member
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

/**
 * Update member settings
 */
exports.updateMemberSettings = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { notifications, privacy, theme } = req.body;
        
        const member = await User.findByIdAndUpdate(
            memberId,
            {
                'preferences.notifications': notifications,
                'preferences.privacy': privacy,
                'preferences.theme': theme,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password -token');
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: member.preferences
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
};

// ============================================
// DELETE Methods
// ============================================

/**
 * Delete member account
 */
exports.deleteMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        
        const member = await User.findByIdAndDelete(memberId);
        
        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting member',
            error: error.message
        });
    }
};

/**
 * Delete all member data
 */
exports.deleteAllMemberData = async (req, res) => {
    try {
        const { memberId } = req.params;
        
        // Delete user and related data
        await User.findByIdAndDelete(memberId);
        
        // TODO: Delete associated projects, compilations, activity logs, etc.
        
        res.json({
            success: true,
            message: 'All member data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting member data:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting member data',
            error: error.message
        });
    }
};
