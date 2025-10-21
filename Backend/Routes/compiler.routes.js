const express = require('express');
const router = express.Router();
const GDBCompiler = require('../../Execution-Engine/gdb-setup');
const multer = require('multer');
const path = require('path');

const compiler = new GDBCompiler();
const upload = multer({ dest: '../../Compling/TemporaryCache/' });

// Route to compile C/C++ files
router.post('/compile', upload.single('file'), async (req, res) => {
    try {
        const { language } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const result = language === 'cpp' 
            ? await compiler.compileCppFile(file.path, 'compiled_output')
            : await compiler.compileCFile(file.path, 'compiled_output');

        res.json({
            success: true,
            message: 'Compilation successful',
            output: result.stdout,
            errors: result.stderr,
            executablePath: result.outputPath
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.error || 'Compilation failed',
            details: error.stderr 
        });
    }
});

// Route to compile from code content
router.post('/compile-content', async (req, res) => {
    try {
        const { content, language, outputName } = req.body;

        if (!content || !language) {
            return res.status(400).json({ error: 'Content and language are required' });
        }

        const result = await compiler.compileFromContent(content, language, outputName || 'output');
        
        res.json({
            success: true,
            message: 'Compilation successful',
            output: result.stdout,
            errors: result.stderr,
            executablePath: result.outputPath
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.error || 'Compilation failed',
            details: error.stderr 
        });
    }
});

// Route to debug files
router.post('/debug', upload.single('file'), async (req, res) => {
    try {
        const { breakpoints } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const result = await compiler.debugFile(file.path, breakpoints || []);
        
        res.json({
            success: true,
            message: 'Debug session started',
            output: result.stdout,
            errors: result.stderr
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.error || 'Debug failed',
            details: error.stderr 
        });
    }
});

// Route to get compiler information
router.get('/info', (req, res) => {
    const info = compiler.getCompilerInfo();
    res.json({
        success: true,
        compilers: info
    });
});

// Route to get compiler version
router.get('/version', async (req, res) => {
    try {
        const version = await compiler.getVersion();
        res.json({
            success: true,
            version: version
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get version' 
        });
    }
});

module.exports = router;
