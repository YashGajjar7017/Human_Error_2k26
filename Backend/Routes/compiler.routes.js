const express = require('express');
const router = express.Router();
const GDBCompiler = require('../../Engine_Execution/gdb-setup');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

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

// Route to compile Python code
router.post('/compile/python', async (req, res) => {
    try {
        const { content, outputName } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Write content to temporary file
        const tempFile = path.join('../../Compling/TemporaryCache/', `temp_${Date.now()}.py`);
        await fs.writeFile(tempFile, content);

        // Execute Python code
        const { stdout, stderr } = await execAsync(`python "${tempFile}"`, { timeout: 10000 });

        // Clean up temp file
        await fs.unlink(tempFile);

        res.json({
            success: true,
            message: 'Python execution successful',
            output: stdout,
            errors: stderr
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Python execution failed',
            details: error.stderr || error.message
        });
    }
});

// Route to compile Java code
router.post('/compile/java', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const fileName = path.parse(file.originalname).name;
        const classPath = path.dirname(file.path);

        // Compile Java file
        const compileCommand = `javac "${file.path}"`;
        await execAsync(compileCommand);

        // Run compiled class
        const runCommand = `java -cp "${classPath}" ${fileName}`;
        const { stdout, stderr } = await execAsync(runCommand, { timeout: 10000 });

        res.json({
            success: true,
            message: 'Java compilation and execution successful',
            output: stdout,
            errors: stderr
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Java compilation/execution failed',
            details: error.stderr || error.message
        });
    }
});

// Route to compile JavaScript/Node.js code
router.post('/compile/javascript', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Write content to temporary file
        const tempFile = path.join('../../Compling/TemporaryCache/', `temp_${Date.now()}.js`);
        await fs.writeFile(tempFile, content);

        // Execute JavaScript code
        const { stdout, stderr } = await execAsync(`node "${tempFile}"`, { timeout: 10000 });

        // Clean up temp file
        await fs.unlink(tempFile);

        res.json({
            success: true,
            message: 'JavaScript execution successful',
            output: stdout,
            errors: stderr
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'JavaScript execution failed',
            details: error.stderr || error.message
        });
    }
});

// Route to detect programming language
router.post('/detect-language', async (req, res) => {
    try {
        const { content, filename } = req.body;

        if (!content && !filename) {
            return res.status(400).json({ error: 'Content or filename is required' });
        }

        let detectedLanguage = 'unknown';

        // Detect by file extension
        if (filename) {
            const ext = path.extname(filename).toLowerCase();
            const extensionMap = {
                '.c': 'c',
                '.cpp': 'cpp',
                '.cc': 'cpp',
                '.cxx': 'cpp',
                '.py': 'python',
                '.java': 'java',
                '.js': 'javascript',
                '.ts': 'typescript'
            };
            detectedLanguage = extensionMap[ext] || 'unknown';
        }

        // Detect by content analysis
        if (content && detectedLanguage === 'unknown') {
            if (content.includes('#include') || content.includes('int main(')) {
                detectedLanguage = content.includes('cout') || content.includes('cin') ? 'cpp' : 'c';
            } else if (content.includes('def ') || content.includes('import ')) {
                detectedLanguage = 'python';
            } else if (content.includes('public class') || content.includes('System.out')) {
                detectedLanguage = 'java';
            } else if (content.includes('console.log') || content.includes('function ') || content.includes('const ') || content.includes('let ')) {
                detectedLanguage = 'javascript';
            }
        }

        res.json({
            success: true,
            detectedLanguage: detectedLanguage,
            confidence: detectedLanguage !== 'unknown' ? 'high' : 'low'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Language detection failed',
            details: error.message
        });
    }
});

// Route to format code
router.post('/format', async (req, res) => {
    try {
        const { content, language } = req.body;

        if (!content || !language) {
            return res.status(400).json({ error: 'Content and language are required' });
        }

        let formattedCode = content;

        // Basic formatting based on language
        switch (language.toLowerCase()) {
            case 'python':
                // Use autopep8 or black if available
                try {
                    const tempFile = path.join('../../Compling/TemporaryCache/', `format_${Date.now()}.py`);
                    await fs.writeFile(tempFile, content);
                    const { stdout } = await execAsync(`python -m autopep8 "${tempFile}"`, { timeout: 5000 });
                    formattedCode = stdout;
                    await fs.unlink(tempFile);
                } catch (formatError) {
                    // Fallback to basic formatting
                    formattedCode = content.split('\n').map(line => line.trim()).join('\n');
                }
                break;

            case 'javascript':
                // Use prettier if available
                try {
                    const tempFile = path.join('../../Compling/TemporaryCache/', `format_${Date.now()}.js`);
                    await fs.writeFile(tempFile, content);
                    const { stdout } = await execAsync(`npx prettier "${tempFile}"`, { timeout: 5000 });
                    formattedCode = stdout;
                    await fs.unlink(tempFile);
                } catch (formatError) {
                    // Fallback to basic formatting
                    formattedCode = content;
                }
                break;

            default:
                // Basic formatting for other languages
                formattedCode = content.split('\n').map(line => line.trim()).join('\n');
        }

        res.json({
            success: true,
            formattedCode: formattedCode,
            message: 'Code formatted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Code formatting failed',
            details: error.message
        });
    }
});

// Route to lint code
router.post('/lint', async (req, res) => {
    try {
        const { content, language } = req.body;

        if (!content || !language) {
            return res.status(400).json({ error: 'Content and language are required' });
        }

        let lintResults = [];

        switch (language.toLowerCase()) {
            case 'python':
                try {
                    const tempFile = path.join('../../Compling/TemporaryCache/', `lint_${Date.now()}.py`);
                    await fs.writeFile(tempFile, content);
                    const { stdout, stderr } = await execAsync(`python -m pylint "${tempFile}" --output-format=json`, { timeout: 10000 });
                    lintResults = JSON.parse(stdout);
                    await fs.unlink(tempFile);
                } catch (lintError) {
                    lintResults = [{ type: 'error', message: 'Linting failed', details: lintError.message }];
                }
                break;

            case 'javascript':
                try {
                    const tempFile = path.join('../../Compling/TemporaryCache/', `lint_${Date.now()}.js`);
                    await fs.writeFile(tempFile, content);
                    const { stdout, stderr } = await execAsync(`npx eslint "${tempFile}" --format=json`, { timeout: 10000 });
                    lintResults = JSON.parse(stdout);
                    await fs.unlink(tempFile);
                } catch (lintError) {
                    lintResults = [{ type: 'error', message: 'Linting failed', details: lintError.message }];
                }
                break;

            default:
                lintResults = [{ type: 'info', message: 'Linting not available for this language' }];
        }

        res.json({
            success: true,
            lintResults: lintResults,
            message: 'Code linting completed'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Code linting failed',
            details: error.message
        });
    }
});

// Route to get supported languages
router.get('/languages', (req, res) => {
    const supportedLanguages = {
        c: {
            name: 'C',
            extensions: ['.c'],
            compilers: ['gcc'],
            features: ['compilation', 'debugging']
        },
        cpp: {
            name: 'C++',
            extensions: ['.cpp', '.cc', '.cxx'],
            compilers: ['g++'],
            features: ['compilation', 'debugging']
        },
        python: {
            name: 'Python',
            extensions: ['.py'],
            interpreters: ['python', 'python3'],
            features: ['execution', 'linting', 'formatting']
        },
        java: {
            name: 'Java',
            extensions: ['.java'],
            compilers: ['javac'],
            features: ['compilation', 'execution']
        },
        javascript: {
            name: 'JavaScript',
            extensions: ['.js'],
            interpreters: ['node'],
            features: ['execution', 'linting', 'formatting']
        }
    };

    res.json({
        success: true,
        languages: supportedLanguages
    });
});

module.exports = router;
