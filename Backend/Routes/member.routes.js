const express = require('express');
const memberController = require('../controller/member.controller');
const { validateMemberInput, validateMemberId } = require('../middleware/member.middleware');

const router = express.Router();

/**
 * Member API Routes
 * Handles all member-related operations (CRUD, profiles, activities, etc.)
 */

// ============================================
// GET Routes - Fetch Member Data
// ============================================

/**
 * GET /api/members
 * Fetch all members with optional filters
 * Query params: role, status, search, limit, page
 */
router.get('/members', memberController.getAllMembers);

/**
 * GET /api/members/stats
 * Fetch members statistics
 */
router.get('/members/stats', memberController.getMembersStats);

/**
 * GET /api/members/:memberId
 * Fetch member by ID
 */
router.get('/members/:memberId', validateMemberId, memberController.getMemberById);

/**
 * GET /api/members/:memberId/profile
 * Fetch detailed member profile
 */
router.get('/members/:memberId/profile', validateMemberId, memberController.getMemberProfile);

/**
 * GET /api/members/:memberId/activity
 * Fetch member activity logs
 */
router.get('/members/:memberId/activity', validateMemberId, memberController.getMemberActivity);

/**
 * GET /api/members/:memberId/projects
 * Fetch member's projects
 */
router.get('/members/:memberId/projects', validateMemberId, memberController.getMemberProjects);

/**
 * GET /api/members/:memberId/compilations
 * Fetch member's compilation history
 */
router.get('/members/:memberId/compilations', validateMemberId, memberController.getMemberCompilations);

/**
 * GET /api/members/search/:query
 * Search members by username, email, or name
 */
router.get('/members/search/:query', memberController.searchMembers);

// ============================================
// POST Routes - Create/Update Member Data
// ============================================

/**
 * POST /api/members
 * Create new member (admin only)
 */
router.post('/members', validateMemberInput, memberController.createMember);

/**
 * POST /api/members/:memberId/upgrade
 * Upgrade member plan
 */
router.post('/members/:memberId/upgrade', validateMemberId, memberController.upgradePlan);

/**
 * POST /api/members/:memberId/downgrade
 * Downgrade member plan
 */
router.post('/members/:memberId/downgrade', validateMemberId, memberController.downgradePlan);

/**
 * POST /api/members/:memberId/suspend
 * Suspend member account
 */
router.post('/members/:memberId/suspend', validateMemberId, memberController.suspendMember);

/**
 * POST /api/members/:memberId/activate
 * Activate member account
 */
router.post('/members/:memberId/activate', validateMemberId, memberController.activateMember);

// ============================================
// PATCH/PUT Routes - Update Member Data
// ============================================

/**
 * PATCH /api/members/:memberId
 * Update member profile (partial)
 */
router.patch('/members/:memberId', validateMemberId, memberController.updateMember);

/**
 * PUT /api/members/:memberId/profile
 * Update member profile details (full update)
 */
router.put('/members/:memberId/profile', validateMemberId, memberController.updateMemberProfile);

/**
 * PATCH /api/members/:memberId/settings
 * Update member settings
 */
router.patch('/members/:memberId/settings', validateMemberId, memberController.updateMemberSettings);

// ============================================
// DELETE Routes - Remove Member Data
// ============================================

/**
 * DELETE /api/members/:memberId
 * Delete member account (admin only)
 */
router.delete('/members/:memberId', validateMemberId, memberController.deleteMember);

/**
 * DELETE /api/members/:memberId/data
 * Delete all member data
 */
router.delete('/members/:memberId/data', validateMemberId, memberController.deleteAllMemberData);

module.exports = router;
