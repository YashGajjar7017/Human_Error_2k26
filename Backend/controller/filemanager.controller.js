const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userId = req.user.id;
        const uploadPath = path.join(__dirname, '../../uploads', userId.toString());

        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, basename + '-' + uniqueSuffix + extension);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        // Programming files
        'text/plain',
        'application/json',
        'application/javascript',
        'application/x-javascript',
        'text/javascript',
        'text/x-python',
        'text/x-java-source',
        'text/x-c',
        'text/x-c++',
        'text/x-csharp',
        'text/html',
        'text/css',
        'application/xml',
        'text/xml',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/markdown',
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        // Archives
        'application/zip',
        'application/x-rar-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per upload
    }
});

// Upload single file
const uploadFile = async (req, res) => {
    try {
        const uploadSingle = upload.single('file');

        uploadSingle(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            error: 'File too large. Maximum size is 10MB.'
                        });
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return res.status(400).json({
                            error: 'Too many files. Maximum 5 files per upload.'
                        });
                    }
                }
                return res.status(400).json({
                    error: err.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    error: 'No file uploaded'
                });
            }

            const userId = req.user.id;
            const fileInfo = {
                id: Date.now().toString(),
                userId: userId,
                originalName: req.file.originalname,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                url: `/api/files/download/${req.file.filename}`,
                uploadedAt: new Date().toISOString()
            };

            // Save file metadata (in production, save to database)
            // For now, we'll store in memory
            if (!global.fileMetadata) {
                global.fileMetadata = [];
            }
            global.fileMetadata.push(fileInfo);

            res.status(201).json({
                success: true,
                file: fileInfo,
                message: 'File uploaded successfully'
            });
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            error: 'Failed to upload file'
        });
    }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res) => {
    try {
        const uploadMultiple = upload.array('files', 5);

        uploadMultiple(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            error: 'One or more files are too large. Maximum size is 10MB per file.'
                        });
                    }
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return res.status(400).json({
                            error: 'Too many files. Maximum 5 files per upload.'
                        });
                    }
                }
                return res.status(400).json({
                    error: err.message
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    error: 'No files uploaded'
                });
            }

            const userId = req.user.id;
            const uploadedFiles = [];

            for (const file of req.files) {
                const fileInfo = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    userId: userId,
                    originalName: file.originalname,
                    filename: file.filename,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path,
                    url: `/api/files/download/${file.filename}`,
                    uploadedAt: new Date().toISOString()
                };

                if (!global.fileMetadata) {
                    global.fileMetadata = [];
                }
                global.fileMetadata.push(fileInfo);
                uploadedFiles.push(fileInfo);
            }

            res.status(201).json({
                success: true,
                files: uploadedFiles,
                count: uploadedFiles.length,
                message: `${uploadedFiles.length} files uploaded successfully`
            });
        });
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        res.status(500).json({
            error: 'Failed to upload files'
        });
    }
};

// Get user's files
const getUserFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, search, limit = 50, offset = 0 } = req.query;

        if (!global.fileMetadata) {
            global.fileMetadata = [];
        }

        let userFiles = global.fileMetadata.filter(f => f.userId === userId);

        // Filter by file type
        if (type) {
            userFiles = userFiles.filter(f => {
                if (type === 'code') {
                    return ['text/plain', 'application/json', 'application/javascript', 'text/javascript',
                           'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++', 'text/x-csharp',
                           'text/html', 'text/css'].includes(f.mimetype);
                }
                if (type === 'document') {
                    return ['application/pdf', 'application/msword',
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'application/vnd.ms-excel',
                           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                           'text/markdown'].includes(f.mimetype);
                }
                if (type === 'image') {
                    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(f.mimetype);
                }
                return f.mimetype.includes(type);
            });
        }

        // Search by filename
        if (search) {
            const searchTerm = search.toLowerCase();
            userFiles = userFiles.filter(f =>
                f.originalName.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by upload date (newest first)
        userFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        // Apply pagination
        const total = userFiles.length;
        const paginatedFiles = userFiles.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        res.json({
            success: true,
            files: paginatedFiles,
            pagination: {
                total: total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: total > parseInt(offset) + parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.status(500).json({
            error: 'Failed to fetch files'
        });
    }
};

// Download file
const downloadFile = async (req, res) => {
    try {
        const filename = req.params.filename;
        const userId = req.user.id;

        if (!global.fileMetadata) {
            global.fileMetadata = [];
        }

        const file = global.fileMetadata.find(f =>
            f.filename === filename && f.userId === userId
        );

        if (!file) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        // Check if file exists on disk
        try {
            await fs.access(file.path);
        } catch (error) {
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
};

// Delete file
const deleteFile = async (req, res) => {
    try {
        const filename = req.params.filename;
        const userId = req.user.id;

        if (!global.fileMetadata) {
            global.fileMetadata = [];
        }

        const fileIndex = global.fileMetadata.findIndex(f =>
            f.filename === filename && f.userId === userId
        );

        if (fileIndex === -1) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        const file = global.fileMetadata[fileIndex];

        // Delete file from disk
        try {
            await fs.unlink(file.path);
        } catch (error) {
            console.warn('Failed to delete file from disk:', error);
        }

        // Remove from metadata
        global.fileMetadata.splice(fileIndex, 1);

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
};

// Get file statistics
const getFileStats = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!global.fileMetadata) {
            global.fileMetadata = [];
        }

        const userFiles = global.fileMetadata.filter(f => f.userId === userId);

        const stats = {
            totalFiles: userFiles.length,
            totalSize: userFiles.reduce((sum, f) => sum + f.size, 0),
            byType: {},
            recentUploads: userFiles
                .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
                .slice(0, 5)
        };

        // Count by file type
        userFiles.forEach(file => {
            const type = file.mimetype.split('/')[0];
            stats.byType[type] = (stats.byType[type] || 0) + 1;
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
};

// Duplicate file
const duplicateFile = async (req, res) => {
    try {
        const filename = req.params.filename;
        const userId = req.user.id;

        if (!global.fileMetadata) {
            global.fileMetadata = [];
        }

        const originalFile = global.fileMetadata.find(f =>
            f.filename === filename && f.userId === userId
        );

        if (!originalFile) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        // Generate new filename
        const extension = path.extname(originalFile.originalName);
        const basename = path.basename(originalFile.originalName, extension);
        const newFilename = `${basename}-copy-${Date.now()}${extension}`;

        // Copy file on disk
        const newPath = path.join(path.dirname(originalFile.path), newFilename);
        await fs.copyFile(originalFile.path, newPath);

        // Create new file metadata
        const duplicatedFile = {
            id: Date.now().toString(),
            userId: userId,
            originalName: newFilename,
            filename: newFilename,
            mimetype: originalFile.mimetype,
            size: originalFile.size,
            path: newPath,
            url: `/api/files/download/${newFilename}`,
            uploadedAt: new Date().toISOString()
        };

        global.fileMetadata.push(duplicatedFile);

        res.status(201).json({
            success: true,
            file: duplicatedFile,
            message: 'File duplicated successfully'
        });
    } catch (error) {
        console.error('Error duplicating file:', error);
        res.status(500).json({
            error: 'Failed to duplicate file'
        });
    }
};

module.exports = {
    uploadFile,
    uploadMultipleFiles,
    getUserFiles,
    downloadFile,
    deleteFile,
    getFileStats,
    duplicateFile
};
