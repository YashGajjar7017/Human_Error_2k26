const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { auth } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for file operations
const fileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 file operations per windowMs
    message: {
        error: 'Too many file operations, please try again later.'
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userId = req.user.id;
        const uploadDir = path.join(__dirname, '../../uploads', userId);

        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common programming files and documents
        const allowedTypes = [
            'text/plain',
            'application/json',
            'application/javascript',
            'application/x-python-code',
            'text/x-python',
            'text/x-c',
            'text/x-c++',
            'text/x-java-source',
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        const allowedExtensions = [
            '.txt', '.json', '.js', '.py', '.c', '.cpp', '.java', '.pdf',
            '.jpg', '.jpeg', '.png', '.gif', '.md', '.html', '.css'
        ];

        const fileExt = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// In-memory storage for file metadata (in production, use database)
let fileMetadata = [];
let fileId = 1;

// Input validation middleware
const validateFileOperation = (req, res, next) => {
    const { filename, content } = req.body;

    if (filename && filename.includes('..')) {
        return res.status(400).json({
            error: 'Invalid filename'
        });
    }

    if (content && typeof content !== 'string') {
        return res.status(400).json({
            error: 'Content must be a string'
        });
    }

    next();
};

// Get user's files
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userFiles = fileMetadata.filter(f => f.userId === userId);

        // Sort by upload date (newest first)
        userFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        res.json({
            success: true,
            files: userFiles,
            count: userFiles.length
        });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({
            error: 'Failed to fetch files'
        });
    }
});

// Upload file
router.post('/upload', auth, fileLimiter, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file provided'
            });
        }

        const userId = req.user.id;
        const { originalname, filename, size, mimetype } = req.file;

        const fileInfo = {
            id: fileId++,
            userId: userId,
            originalName: originalname,
            filename: filename,
            size: size,
            mimetype: mimetype,
            uploadDate: new Date().toISOString(),
            path: req.file.path,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
        };

        fileMetadata.push(fileInfo);

        res.status(201).json({
            success: true,
            file: fileInfo,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            error: 'Failed to upload file'
        });
    }
});

// Download file
router.get('/download/:fileId', auth, async (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const userId = req.user.id;

        const file = fileMetadata.find(f => f.id === fileId && f.userId === userId);

        if (!file) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        // Check if file exists on disk
        try {
            await fs.access(file.path);
        } catch (accessError) {
            return res.status(404).json({
                error: 'File not found on disk'
            });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            error: 'Failed to download file'
        });
    }
});

// Create text file
router.post('/create', auth, fileLimiter, validateFileOperation, async (req, res) => {
    try {
        const { filename, content, tags } = req.body;
        const userId = req.user.id;

        if (!filename) {
            return res.status(400).json({
                error: 'Filename is required'
            });
        }

        const userDir = path.join(__dirname, '../../uploads', userId.toString());
        await fs.mkdir(userDir, { recursive: true });

        const filePath = path.join(userDir, filename);
        await fs.writeFile(filePath, content || '');

        const stats = await fs.stat(filePath);

        const fileInfo = {
            id: fileId++,
            userId: userId,
            originalName: filename,
            filename: filename,
            size: stats.size,
            mimetype: 'text/plain',
            uploadDate: new Date().toISOString(),
            path: filePath,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        };

        fileMetadata.push(fileInfo);

        res.status(201).json({
            success: true,
            file: fileInfo,
            message: 'File created successfully'
        });
    } catch (error) {
        console.error('Error creating file:', error);
        res.status(500).json({
            error: 'Failed to create file'
        });
    }
});

// Update file content
router.put('/:fileId', auth, fileLimiter, validateFileOperation, async (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const userId = req.user.id;
        const { content, tags } = req.body;

        const file = fileMetadata.find(f => f.id === fileId && f.userId === userId);

        if (!file) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        if (content !== undefined) {
            await fs.writeFile(file.path, content);
            const stats = await fs.stat(file.path);
            file.size = stats.size;
        }

        if (tags !== undefined) {
            file.tags = tags.split(',').map(tag => tag.trim());
        }

        file.lastModified = new Date().toISOString();

        res.json({
            success: true,
            file: file,
            message: 'File updated successfully'
        });
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({
            error: 'Failed to update file'
        });
    }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const userId = req.user.id;

        const fileIndex = fileMetadata.findIndex(f => f.id === fileId && f.userId === userId);

        if (fileIndex === -1) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        const file = fileMetadata[fileIndex];

        // Delete file from disk
        try {
            await fs.unlink(file.path);
        } catch (unlinkError) {
            console.warn('Could not delete file from disk:', unlinkError);
        }

        // Remove from metadata
        fileMetadata.splice(fileIndex, 1);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            error: 'Failed to delete file'
        });
    }
});

// Get file content
router.get('/:fileId/content', auth, async (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const userId = req.user.id;

        const file = fileMetadata.find(f => f.id === fileId && f.userId === userId);

        if (!file) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        const content = await fs.readFile(file.path, 'utf8');

        res.json({
            success: true,
            content: content,
            file: {
                id: file.id,
                name: file.originalName,
                size: file.size,
                mimetype: file.mimetype,
                lastModified: file.lastModified || file.uploadDate
            }
        });
    } catch (error) {
        console.error('Error reading file content:', error);
        res.status(500).json({
            error: 'Failed to read file content'
        });
    }
});

// Search files
router.get('/search', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const { query, tag } = req.query;

        let userFiles = fileMetadata.filter(f => f.userId === userId);

        if (query) {
            userFiles = userFiles.filter(f =>
                f.originalName.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (tag) {
            userFiles = userFiles.filter(f =>
                f.tags && f.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
            );
        }

        res.json({
            success: true,
            files: userFiles,
            count: userFiles.length
        });
    } catch (error) {
        console.error('Error searching files:', error);
        res.status(500).json({
            error: 'Failed to search files'
        });
    }
});

// Get file statistics
router.get('/stats', auth, (req, res) => {
    try {
        const userId = req.user.id;
        const userFiles = fileMetadata.filter(f => f.userId === userId);

        const stats = {
            totalFiles: userFiles.length,
            totalSize: userFiles.reduce((sum, f) => sum + f.size, 0),
            fileTypes: {},
            recentUploads: userFiles.filter(f => {
                const uploadDate = new Date(f.uploadDate);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return uploadDate > weekAgo;
            }).length
        };

        // Count file types
        userFiles.forEach(file => {
            const ext = path.extname(file.originalName).toLowerCase() || 'no-extension';
            stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
        });

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting file stats:', error);
        res.status(500).json({
            error: 'Failed to get file statistics'
        });
    }
});

// Duplicate file
router.post('/:fileId/duplicate', auth, fileLimiter, async (req, res) => {
    try {
        const fileId = parseInt(req.params.fileId);
        const userId = req.user.id;
        const { newName } = req.body;

        const originalFile = fileMetadata.find(f => f.id === fileId && f.userId === userId);

        if (!originalFile) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        const content = await fs.readFile(originalFile.path, 'utf8');

        const duplicateName = newName || `Copy of ${originalFile.originalName}`;
        const userDir = path.join(__dirname, '../../uploads', userId.toString());
        const duplicatePath = path.join(userDir, duplicateName);

        await fs.writeFile(duplicatePath, content);
        const stats = await fs.stat(duplicatePath);

        const duplicateFile = {
            id: fileId++,
            userId: userId,
            originalName: duplicateName,
            filename: duplicateName,
            size: stats.size,
            mimetype: originalFile.mimetype,
            uploadDate: new Date().toISOString(),
            path: duplicatePath,
            tags: [...(originalFile.tags || [])]
        };

        fileMetadata.push(duplicateFile);

        res.status(201).json({
            success: true,
            file: duplicateFile,
            message: 'File duplicated successfully'
        });
    } catch (error) {
        console.error('Error duplicating file:', error);
        res.status(500).json({
            error: 'Failed to duplicate file'
        });
    }
});

module.exports = router;
