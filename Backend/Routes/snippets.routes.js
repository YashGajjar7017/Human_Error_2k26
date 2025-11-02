const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for snippet operations
const snippetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 snippet operations per windowMs
    message: {
        error: 'Too many snippet operations, please try again later.'
    }
});

// In-memory storage for code snippets (in production, use database)
let snippets = [];
let snippetId = 1;

// Input validation middleware
const validateSnippet = (req, res, next) => {
    const { title, content, language, tags, description } = req.body;

    if (!title || !content || !language) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['title', 'content', 'language']
        });
    }

    const validLanguages = [
        'javascript', 'python', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby',
        'go', 'rust', 'typescript', 'html', 'css', 'sql', 'bash', 'other'
    ];

    if (!validLanguages.includes(language.toLowerCase())) {
        return res.status(400).json({
            error: 'Invalid programming language',
            validLanguages: validLanguages
        });
    }

    if (title.length > 100) {
        return res.status(400).json({
            error: 'Title too long (max 100 characters)'
        });
    }

    if (content.length > 50000) {
        return res.status(400).json({
            error: 'Content too long (max 50,000 characters)'
        });
    }

    next();
};

// Get all snippets for authenticated user
router.get('/', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const { language, tag, search } = req.query;

        let userSnippets = snippets.filter(s => s.userId === userId);

        // Filter by language
        if (language) {
            userSnippets = userSnippets.filter(s =>
                s.language.toLowerCase() === language.toLowerCase()
            );
        }

        // Filter by tag
        if (tag) {
            userSnippets = userSnippets.filter(s =>
                s.tags && s.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
            );
        }

        // Search in title and description
        if (search) {
            const searchTerm = search.toLowerCase();
            userSnippets = userSnippets.filter(s =>
                s.title.toLowerCase().includes(searchTerm) ||
                (s.description && s.description.toLowerCase().includes(searchTerm))
            );
        }

        // Sort by creation date (newest first)
        userSnippets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            snippets: userSnippets,
            count: userSnippets.length
        });
    } catch (error) {
        console.error('Error fetching snippets:', error);
        res.status(500).json({
            error: 'Failed to fetch snippets'
        });
    }
});

// Get public snippets (shared by other users)
router.get('/public', auth, (req, res) => {
    try {
        const { language, tag, search } = req.query;

        let publicSnippets = snippets.filter(s => s.isPublic === true);

        // Filter by language
        if (language) {
            publicSnippets = publicSnippets.filter(s =>
                s.language.toLowerCase() === language.toLowerCase()
            );
        }

        // Filter by tag
        if (tag) {
            publicSnippets = publicSnippets.filter(s =>
                s.tags && s.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
            );
        }

        // Search in title and description
        if (search) {
            const searchTerm = search.toLowerCase();
            publicSnippets = publicSnippets.filter(s =>
                s.title.toLowerCase().includes(searchTerm) ||
                (s.description && s.description.toLowerCase().includes(searchTerm))
            );
        }

        // Sort by creation date (newest first)
        publicSnippets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            snippets: publicSnippets,
            count: publicSnippets.length
        });
    } catch (error) {
        console.error('Error fetching public snippets:', error);
        res.status(500).json({
            error: 'Failed to fetch public snippets'
        });
    }
});

// Get a specific snippet
router.get('/:id', auth, (req, res) => {
    try {
        const snippetId = parseInt(req.params.id);
        const userId = req.user.id;

        const snippet = snippets.find(s => s.id === snippetId);

        if (!snippet) {
            return res.status(404).json({
                error: 'Snippet not found'
            });
        }

        // Check if user owns the snippet or if it's public
        if (snippet.userId !== userId && !snippet.isPublic) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        res.json({
            success: true,
            snippet: snippet
        });
    } catch (error) {
        console.error('Error fetching snippet:', error);
        res.status(500).json({
            error: 'Failed to fetch snippet'
        });
    }
});

// Create a new snippet
router.post('/', auth, snippetLimiter, validateSnippet, (req, res) => {
    try {
        const { title, content, language, tags, description, isPublic } = req.body;
        const userId = req.user.id;

        const newSnippet = {
            id: snippetId++,
            userId: userId,
            title: title.trim(),
            content: content,
            language: language.toLowerCase(),
            tags: tags ? tags.map(tag => tag.trim().toLowerCase()) : [],
            description: description ? description.trim() : '',
            isPublic: isPublic || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            views: 0,
            forkedFrom: null
        };

        snippets.push(newSnippet);

        res.status(201).json({
            success: true,
            snippet: newSnippet,
            message: 'Snippet created successfully'
        });
    } catch (error) {
        console.error('Error creating snippet:', error);
        res.status(500).json({
            error: 'Failed to create snippet'
        });
    }
});

// Update a snippet
router.put('/:id', auth, snippetLimiter, validateSnippet, (req, res) => {
    try {
        const snippetId = parseInt(req.params.id);
        const userId = req.user.id;
        const { title, content, language, tags, description, isPublic } = req.body;

        const snippet = snippets.find(s => s.id === snippetId && s.userId === userId);

        if (!snippet) {
            return res.status(404).json({
                error: 'Snippet not found'
            });
        }

        // Update fields
        snippet.title = title.trim();
        snippet.content = content;
        snippet.language = language.toLowerCase();
        snippet.tags = tags ? tags.map(tag => tag.trim().toLowerCase()) : [];
        snippet.description = description ? description.trim() : '';
        snippet.isPublic = isPublic !== undefined ? isPublic : snippet.isPublic;
        snippet.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            snippet: snippet,
            message: 'Snippet updated successfully'
        });
    } catch (error) {
        console.error('Error updating snippet:', error);
        res.status(500).json({
            error: 'Failed to update snippet'
        });
    }
});

// Delete a snippet
router.delete('/:id', auth, (req, res) => {
    try {
        const snippetId = parseInt(req.params.id);
        const userId = req.user.id;

        const snippetIndex = snippets.findIndex(s => s.id === snippetId && s.userId === userId);

        if (snippetIndex === -1) {
            return res.status(404).json({
                error: 'Snippet not found'
            });
        }

        snippets.splice(snippetIndex, 1);

        res.json({
            success: true,
            message: 'Snippet deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting snippet:', error);
        res.status(500).json({
            error: 'Failed to delete snippet'
        });
    }
});

// Fork a snippet
router.post('/:id/fork', auth, snippetLimiter, (req, res) => {
    try {
        const snippetId = parseInt(req.params.id);
        const userId = req.user.id;

        const originalSnippet = snippets.find(s => s.id === snippetId);

        if (!originalSnippet) {
            return res.status(404).json({
                error: 'Snippet not found'
            });
        }

        // Check if user can access the snippet
        if (originalSnippet.userId !== userId && !originalSnippet.isPublic) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        const forkedSnippet = {
            id: snippetId++,
            userId: userId,
            title: `Fork of ${originalSnippet.title}`,
            content: originalSnippet.content,
            language: originalSnippet.language,
            tags: [...(originalSnippet.tags || [])],
            description: originalSnippet.description,
            isPublic: false, // Forks are private by default
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            views: 0,
            forkedFrom: originalSnippet.id
        };

        snippets.push(forkedSnippet);

        res.status(201).json({
            success: true,
            snippet: forkedSnippet,
            message: 'Snippet forked successfully'
        });
    } catch (error) {
        console.error('Error forking snippet:', error);
        res.status(500).json({
            error: 'Failed to fork snippet'
        });
    }
});

// Like a snippet
router.post('/:id/like', auth, snippetLimiter, (req, res) => {
    try {
        const snippetId = parseInt(req.params.id);
        const userId = req.user.id;

        const snippet = snippets.find(s => s.id === snippetId);

        if (!snippet) {
            return res.status(404).json({
                error: 'Snippet not found'
            });
        }

        // Check if user can access the snippet
        if (snippet.userId !== userId && !snippet.isPublic) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }

        snippet.likes += 1;

        res.json({
            success: true,
            likes: snippet.likes,
            message: 'Snippet liked successfully'
        });
    } catch (error) {
        console.error('Error liking snippet:', error);
        res.status(500).json({
            error: 'Failed to like snippet'
        });
    }
});

// Get snippet statistics
router.get('/stats/overview', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const userSnippets = snippets.filter(s => s.userId === userId);

        const stats = {
            totalSnippets: userSnippets.length,
            publicSnippets: userSnippets.filter(s => s.isPublic).length,
            privateSnippets: userSnippets.filter(s => !s.isPublic).length,
            totalLikes: userSnippets.reduce((sum, s) => sum + s.likes, 0),
            totalViews: userSnippets.reduce((sum, s) => sum + s.views, 0),
            languageBreakdown: {},
            topTags: {}
        };

        // Language breakdown
        userSnippets.forEach(snippet => {
            stats.languageBreakdown[snippet.language] = (stats.languageBreakdown[snippet.language] || 0) + 1;
        });

        // Top tags
        userSnippets.forEach(snippet => {
            if (snippet.tags) {
                snippet.tags.forEach(tag => {
                    stats.topTags[tag] = (stats.topTags[tag] || 0) + 1;
                });
            }
        });

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting snippet stats:', error);
        res.status(500).json({
            error: 'Failed to get snippet statistics'
        });
    }
});

// Get popular tags
router.get('/tags/popular', auth, (req, res) => {
    try {
        const allTags = {};

        snippets.forEach(snippet => {
            if (snippet.tags) {
                snippet.tags.forEach(tag => {
                    allTags[tag] = (allTags[tag] || 0) + 1;
                });
            }
        });

        // Sort tags by frequency
        const popularTags = Object.entries(allTags)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .map(([tag, count]) => ({ tag, count }));

        res.json({
            success: true,
            tags: popularTags
        });
    } catch (error) {
        console.error('Error getting popular tags:', error);
        res.status(500).json({
            error: 'Failed to get popular tags'
        });
    }
});

// Get supported languages
router.get('/languages', (req, res) => {
    const languages = [
        { code: 'javascript', name: 'JavaScript', extensions: ['.js'] },
        { code: 'python', name: 'Python', extensions: ['.py'] },
        { code: 'java', name: 'Java', extensions: ['.java'] },
        { code: 'c', name: 'C', extensions: ['.c'] },
        { code: 'cpp', name: 'C++', extensions: ['.cpp', '.cc', '.cxx'] },
        { code: 'csharp', name: 'C#', extensions: ['.cs'] },
        { code: 'php', name: 'PHP', extensions: ['.php'] },
        { code: 'ruby', name: 'Ruby', extensions: ['.rb'] },
        { code: 'go', name: 'Go', extensions: ['.go'] },
        { code: 'rust', name: 'Rust', extensions: ['.rs'] },
        { code: 'typescript', name: 'TypeScript', extensions: ['.ts'] },
        { code: 'html', name: 'HTML', extensions: ['.html'] },
        { code: 'css', name: 'CSS', extensions: ['.css'] },
        { code: 'sql', name: 'SQL', extensions: ['.sql'] },
        { code: 'bash', name: 'Bash', extensions: ['.sh'] },
        { code: 'other', name: 'Other', extensions: [] }
    ];

    res.json({
        success: true,
        languages: languages
    });
});

module.exports = router;
