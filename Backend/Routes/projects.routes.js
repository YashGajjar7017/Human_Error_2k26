const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for project operations
const projectLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 project operations per windowMs
    message: {
        error: 'Too many project operations, please try again later.'
    }
});

// In-memory storage for projects (in production, use database)
let projects = [];
let projectId = 1;

// Input validation middleware
const validateProject = (req, res, next) => {
    const { name, description, language, visibility } = req.body;

    if (!name || !language) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['name', 'language']
        });
    }

    const validLanguages = [
        'javascript', 'python', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby',
        'go', 'rust', 'typescript', 'html', 'css', 'other'
    ];

    if (!validLanguages.includes(language.toLowerCase())) {
        return res.status(400).json({
            error: 'Invalid programming language',
            validLanguages: validLanguages
        });
    }

    const validVisibility = ['public', 'private', 'team'];
    if (visibility && !validVisibility.includes(visibility)) {
        return res.status(400).json({
            error: 'Invalid visibility setting',
            validOptions: validVisibility
        });
    }

    if (name.length > 50) {
        return res.status(400).json({
            error: 'Project name too long (max 50 characters)'
        });
    }

    next();
};

// Get all projects for authenticated user
router.get('/', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const { language, visibility, search } = req.query;

        let userProjects = projects.filter(p => p.ownerId === userId || p.members.includes(userId));

        // Filter by language
        if (language) {
            userProjects = userProjects.filter(p =>
                p.language.toLowerCase() === language.toLowerCase()
            );
        }

        // Filter by visibility
        if (visibility) {
            userProjects = userProjects.filter(p => p.visibility === visibility);
        }

        // Search in name and description
        if (search) {
            const searchTerm = search.toLowerCase();
            userProjects = userProjects.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }

        // Sort by last modified date (newest first)
        userProjects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        res.json({
            success: true,
            projects: userProjects,
            count: userProjects.length
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            error: 'Failed to fetch projects'
        });
    }
});

// Get public projects
router.get('/public', auth, (req, res) => {
    try {
        const { language, search } = req.query;

        let publicProjects = projects.filter(p => p.visibility === 'public');

        // Filter by language
        if (language) {
            publicProjects = publicProjects.filter(p =>
                p.language.toLowerCase() === language.toLowerCase()
            );
        }

        // Search in name and description
        if (search) {
            const searchTerm = search.toLowerCase();
            publicProjects = publicProjects.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm))
            );
        }

        // Sort by stars (most starred first)
        publicProjects.sort((a, b) => b.stars - a.stars);

        res.json({
            success: true,
            projects: publicProjects,
            count: publicProjects.length
        });
    } catch (error) {
        console.error('Error fetching public projects:', error);
        res.status(500).json({
            error: 'Failed to fetch public projects'
        });
    }
});

// Get a specific project
router.get('/:id', auth, (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const userId = req.user.id;

        const project = projects.find(p => p.id === projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        // Check if user has access to the project
        const hasAccess = project.ownerId === userId ||
                         project.members.includes(userId) ||
                         project.visibility === 'public';

        if (!hasAccess) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        res.json({
            success: true,
            project: project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            error: 'Failed to fetch project'
        });
    }
});

// Create a new project
router.post('/', auth, projectLimiter, validateProject, (req, res) => {
    try {
        const { name, description, language, visibility, tags } = req.body;
        const userId = req.user.id;

        const newProject = {
            id: projectId++,
            ownerId: userId,
            name: name.trim(),
            description: description ? description.trim() : '',
            language: language.toLowerCase(),
            visibility: visibility || 'private',
            tags: tags ? tags.map(tag => tag.trim().toLowerCase()) : [],
            members: [userId], // Owner is automatically a member
            files: [],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            stars: 0,
            forks: 0,
            collaborators: [],
            settings: {
                allowForks: true,
                allowIssues: true,
                allowPullRequests: true
            }
        };

        projects.push(newProject);

        res.status(201).json({
            success: true,
            project: newProject,
            message: 'Project created successfully'
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            error: 'Failed to create project'
        });
    }
});

// Update a project
router.put('/:id', auth, projectLimiter, validateProject, (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const userId = req.user.id;
        const { name, description, language, visibility, tags, settings } = req.body;

        const project = projects.find(p => p.id === projectId && p.ownerId === userId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found or access denied'
            });
        }

        // Update fields
        project.name = name.trim();
        project.description = description ? description.trim() : '';
        project.language = language.toLowerCase();
        project.visibility = visibility || project.visibility;
        project.tags = tags ? tags.map(tag => tag.trim().toLowerCase()) : project.tags;
        project.settings = { ...project.settings, ...settings };
        project.lastModified = new Date().toISOString();

        res.json({
            success: true,
            project: project,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({
            error: 'Failed to update project'
        });
    }
});

// Delete a project
router.delete('/:id', auth, (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const userId = req.user.id;

        const projectIndex = projects.findIndex(p => p.id === projectId && p.ownerId === userId);

        if (projectIndex === -1) {
            return res.status(404).json({
                error: 'Project not found or access denied'
            });
        }

        projects.splice(projectIndex, 1);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({
            error: 'Failed to delete project'
        });
    }
});

// Add member to project
router.post('/:id/members', auth, projectLimiter, (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const userId = req.user.id;
        const { memberId, role } = req.body;

        if (!memberId) {
            return res.status(400).json({
                error: 'Member ID is required'
            });
        }

        const project = projects.find(p => p.id === projectId && p.ownerId === userId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found or access denied'
            });
        }

        if (project.members.includes(memberId)) {
            return res.status(400).json({
                error: 'User is already a member of this project'
            });
        }

        project.members.push(memberId);
        project.collaborators.push({
            userId: memberId,
            role: role || 'member',
            joinedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            project: project,
            message: 'Member added successfully'
        });
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({
            error: 'Failed to add member'
        });
    }
});

// Remove member from project
router.delete('/:id/members/:memberId', auth, (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const memberId = parseInt(req.params.memberId);
        const userId = req.user.id;

        const project = projects.find(p => p.id === projectId && p.ownerId === userId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found or access denied'
            });
        }

        if (memberId === userId) {
            return res.status(400).json({
                error: 'Cannot remove yourself from the project'
            });
        }

        const memberIndex = project.members.indexOf(memberId);
        if (memberIndex === -1) {
            return res.status(404).json({
                error: 'Member not found in project'
            });
        }

        project.members.splice(memberIndex, 1);
        project.collaborators = project.collaborators.filter(c => c.userId !== memberId);

        res.json({
            success: true,
            project: project,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({
            error: 'Failed to remove member'
        });
    }
});

// Fork a project
router.post('/:id/fork', auth, projectLimiter, (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const userId = req.user.id;

        const originalProject = projects.find(p => p.id === projectId);

        if (!originalProject) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        // Check if user can access the project
        const hasAccess = originalProject.ownerId === userId ||
                         originalProject.members.includes(userId) ||
                         originalProject.visibility === 'public';

        if (!hasAccess) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        const forkedProject = {
            id: projectId++,
            ownerId: userId,
            name: `Fork of ${originalProject.name}`,
            description: originalProject.description,
            language: originalProject.language,
            visibility: 'private', // Forks are private by default
            tags: [...(originalProject.tags || [])],
            members: [userId],
            files: JSON.parse(JSON.stringify(originalProject.files)), // Deep copy
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            stars: 0,
            forks: 0,
            collaborators: [],
            forkedFrom: originalProject.id,
            settings: { ...originalProject.settings }
        };

        projects.push(forkedProject);
        originalProject.forks += 1;

        res.status(201).json({
            success: true,
            project: forkedProject,
            message: 'Project forked successfully'
        });
    } catch (error) {
        console.error('Error forking project:', error);
        res.status(500).json({
            error: 'Failed to fork project'
        });
    }
});

// Star a project
router.post('/:id/star', auth, projectLimiter, (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const userId = req.user.id;

        const project = projects.find(p => p.id === projectId);

        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        // Check if user can access the project
        const hasAccess = project.ownerId === userId ||
                         project.members.includes(userId) ||
                         project.visibility === 'public';

        if (!hasAccess) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        project.stars += 1;

        res.json({
            success: true,
            stars: project.stars,
            message: 'Project starred successfully'
        });
    } catch (error) {
        console.error('Error starring project:', error);
        res.status(500).json({
            error: 'Failed to star project'
        });
    }
});

// Get project statistics
router.get('/stats/overview', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const userProjects = projects.filter(p => p.ownerId === userId);

        const stats = {
            totalProjects: userProjects.length,
            publicProjects: userProjects.filter(p => p.visibility === 'public').length,
            privateProjects: userProjects.filter(p => p.visibility === 'private').length,
            teamProjects: userProjects.filter(p => p.visibility === 'team').length,
            totalStars: userProjects.reduce((sum, p) => sum + p.stars, 0),
            totalForks: userProjects.reduce((sum, p) => sum + p.forks, 0),
            languageBreakdown: {},
            topTags: {}
        };

        // Language breakdown
        userProjects.forEach(project => {
            stats.languageBreakdown[project.language] = (stats.languageBreakdown[project.language] || 0) + 1;
        });

        // Top tags
        userProjects.forEach(project => {
            if (project.tags) {
                project.tags.forEach(tag => {
                    stats.topTags[tag] = (stats.topTags[tag] || 0) + 1;
                });
            }
        });

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting project stats:', error);
        res.status(500).json({
            error: 'Failed to get project statistics'
        });
    }
});

// Get supported languages
router.get('/languages', (req, res) => {
    const languages = [
        { code: 'javascript', name: 'JavaScript' },
        { code: 'python', name: 'Python' },
        { code: 'java', name: 'Java' },
        { code: 'c', name: 'C' },
        { code: 'cpp', name: 'C++' },
        { code: 'csharp', name: 'C#' },
        { code: 'php', name: 'PHP' },
        { code: 'ruby', name: 'Ruby' },
        { code: 'go', name: 'Go' },
        { code: 'rust', name: 'Rust' },
        { code: 'typescript', name: 'TypeScript' },
        { code: 'html', name: 'HTML' },
        { code: 'css', name: 'CSS' },
        { code: 'other', name: 'Other' }
    ];

    res.json({
        success: true,
        languages: languages
    });
});

module.exports = router;
