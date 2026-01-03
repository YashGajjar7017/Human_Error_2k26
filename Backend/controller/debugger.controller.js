const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const os = require('os');
const User = require('../models/User.model');

const exec = promisify(require('child_process').exec);

class DebuggerController {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp/debugger');
        this.gdbPath = path.join(__dirname, '../../Engine_Execution/GDB Complier');
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    /**
     * Compile user code with debugging symbols
     */
    async compileWithDebug(req, res) {
        const { code, language = 'c', filename = 'program', userId } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, error: 'Code is required' });
        }

        try {
            const sessionId = `${userId}_${Date.now()}`;
            const workDir = path.join(this.tempDir, sessionId);
            fs.mkdirSync(workDir, { recursive: true });

            const sourceFile = path.join(workDir, `${filename}.${this.getFileExtension(language)}`);
            const outputFile = path.join(workDir, filename);
            const debugFile = path.join(workDir, `${filename}.o`);

            // Write source code
            fs.writeFileSync(sourceFile, code);

            // Compile with debugging symbols
            const compileCmd = this.buildCompileCommand(language, sourceFile, outputFile, debugFile);
            console.log(`[DEBUGGER] Compiling with: ${compileCmd}`);
            
            try {
                execSync(compileCmd, { cwd: workDir, stdio: 'pipe' });
            } catch (compileError) {
                return res.status(400).json({
                    success: false,
                    error: 'Compilation error',
                    details: compileError.stderr?.toString() || compileError.message,
                    code: code,
                    line: this.extractErrorLine(compileError.message)
                });
            }

            // Log activity
            if (userId) {
                await this.logActivity(userId, 'compile', { language, filename });
            }

            return res.json({
                success: true,
                message: 'Code compiled successfully with debugging symbols',
                sessionId: sessionId,
                executable: outputFile,
                debugFile: debugFile,
                sourceFile: sourceFile
            });

        } catch (error) {
            console.error('[DEBUGGER] Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Compilation failed',
                message: error.message
            });
        }
    }

    /**
     * Run debugger with GDB
     */
    async runDebugger(req, res) {
        const { sessionId, breakpoints = [], command = 'run', userId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, error: 'Session ID is required' });
        }

        try {
            const workDir = path.join(this.tempDir, sessionId);
            const executablePath = path.join(workDir, 'program');

            if (!fs.existsSync(executablePath)) {
                return res.status(400).json({
                    success: false,
                    error: 'Executable not found. Please compile first.'
                });
            }

            // Build GDB commands
            const gdbCommands = this.buildGdbCommands(executablePath, breakpoints, command);
            
            console.log(`[DEBUGGER] Running GDB with commands:`, gdbCommands);

            const { stdout, stderr } = await exec(`gdb -batch ${gdbCommands}`, {
                cwd: workDir,
                maxBuffer: 10 * 1024 * 1024
            });

            if (userId) {
                await this.logActivity(userId, 'debug', { sessionId, command });
            }

            return res.json({
                success: true,
                message: 'Debugger execution completed',
                output: stdout,
                errors: stderr,
                sessionId: sessionId
            });

        } catch (error) {
            console.error('[DEBUGGER] Error running debugger:', error);
            return res.status(500).json({
                success: false,
                error: 'Debugger execution failed',
                message: error.message
            });
        }
    }

    /**
     * Get debugging information
     */
    async getDebugInfo(req, res) {
        const { sessionId } = req.params;

        try {
            const workDir = path.join(this.tempDir, sessionId);

            if (!fs.existsSync(workDir)) {
                return res.status(404).json({
                    success: false,
                    error: 'Debug session not found'
                });
            }

            const sourceFile = fs.readdirSync(workDir).find(f => ['.c', '.cpp', '.h'].includes(path.extname(f)));
            const debugFile = fs.readdirSync(workDir).find(f => f.endsWith('.o'));

            const debugInfo = {
                sessionId,
                sourceFile: sourceFile ? fs.readFileSync(path.join(workDir, sourceFile), 'utf-8') : null,
                hasDebugSymbols: !!debugFile,
                files: fs.readdirSync(workDir)
            };

            return res.json({
                success: true,
                data: debugInfo
            });

        } catch (error) {
            console.error('[DEBUGGER] Error getting debug info:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get debug information'
            });
        }
    }

    /**
     * Compile and run with output
     */
    async compileAndRun(req, res) {
        const { code, language = 'c', input = '', userId } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, error: 'Code is required' });
        }

        try {
            const sessionId = `${userId || 'guest'}_${Date.now()}`;
            const workDir = path.join(this.tempDir, sessionId);
            fs.mkdirSync(workDir, { recursive: true });

            const ext = this.getFileExtension(language);
            const sourceFile = path.join(workDir, `program.${ext}`);
            const outputFile = path.join(workDir, 'program');

            fs.writeFileSync(sourceFile, code);

            // Compile
            const compileCmd = this.buildCompileCommand(language, sourceFile, outputFile);
            
            try {
                execSync(compileCmd, { cwd: workDir, stdio: 'pipe' });
            } catch (compileError) {
                return res.status(400).json({
                    success: false,
                    phase: 'compilation',
                    error: compileError.stderr?.toString() || compileError.message
                });
            }

            // Run
            try {
                const runCmd = language === 'java' ? `java -cp . Main` : outputFile;
                const { stdout } = await exec(runCmd, {
                    cwd: workDir,
                    maxBuffer: 10 * 1024 * 1024,
                    timeout: 5000,
                    input: input
                });

                if (userId) {
                    await this.logActivity(userId, 'run', { language });
                }

                return res.json({
                    success: true,
                    output: stdout,
                    sessionId
                });
            } catch (runError) {
                return res.status(400).json({
                    success: false,
                    phase: 'execution',
                    error: runError.stderr?.toString() || runError.message,
                    partialOutput: runError.stdout?.toString() || ''
                });
            }

        } catch (error) {
            console.error('[DEBUGGER] Error:', error);
            return res.status(500).json({
                success: false,
                error: 'Operation failed',
                message: error.message
            });
        }
    }

    /**
     * Get all supported languages for debugging
     */
    getSupportedLanguages(req, res) {
        const languages = {
            c: { name: 'C', compiler: 'gcc', extension: 'c', debuggable: true },
            cpp: { name: 'C++', compiler: 'g++', extension: 'cpp', debuggable: true },
            java: { name: 'Java', compiler: 'javac', extension: 'java', debuggable: true },
            python: { name: 'Python', compiler: 'python3', extension: 'py', debuggable: true }
        };

        res.json({
            success: true,
            languages: languages
        });
    }

    /**
     * Clean up old debug sessions
     */
    async cleanupSessions(req, res) {
        try {
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            const now = Date.now();

            const sessions = fs.readdirSync(this.tempDir);
            let cleaned = 0;

            sessions.forEach(sessionId => {
                const sessionPath = path.join(this.tempDir, sessionId);
                const stats = fs.statSync(sessionPath);

                if (now - stats.mtimeMs > maxAge) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    cleaned++;
                }
            });

            res.json({
                success: true,
                message: `Cleaned ${cleaned} old sessions`
            });
        } catch (error) {
            console.error('[DEBUGGER] Cleanup error:', error);
            res.status(500).json({
                success: false,
                error: 'Cleanup failed'
            });
        }
    }

    // Helper Methods
    getFileExtension(language) {
        const extensions = {
            c: 'c', cpp: 'cpp', cxx: 'cpp', 'c++': 'cpp',
            java: 'java', python: 'py', js: 'js'
        };
        return extensions[language] || language;
    }

    buildCompileCommand(language, sourceFile, outputFile, debugFile = '') {
        const debugFlags = '-g -O0'; // Debug symbols, no optimization
        
        switch (language) {
            case 'c':
                return `gcc ${debugFlags} "${sourceFile}" -o "${outputFile}" -Wall -Wextra`;
            case 'cpp':
            case 'c++':
            case 'cxx':
                return `g++ ${debugFlags} "${sourceFile}" -o "${outputFile}" -Wall -Wextra`;
            case 'java':
                return `javac -g "${sourceFile}" -d "${path.dirname(outputFile)}"`;
            case 'python':
                return `python3 -m py_compile "${sourceFile}"`;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    buildGdbCommands(executable, breakpoints = [], command = 'run') {
        let commands = [`-ex "file ${executable}"`];

        if (breakpoints.length > 0) {
            breakpoints.forEach((bp, idx) => {
                commands.push(`-ex "break ${bp}"`);
            });
        }

        commands.push(`-ex "${command}"`);
        commands.push(`-ex "where"`);
        commands.push(`-ex "quit"`);

        return commands.join(' ');
    }

    extractErrorLine(errorMessage) {
        const match = errorMessage.match(/:\s*(\d+):/);
        return match ? parseInt(match[1]) : null;
    }

    async logActivity(userId, action, data) {
        try {
            await User.findByIdAndUpdate(userId, {
                $push: {
                    activityLog: {
                        action: `debugger_${action}`,
                        data: data,
                        timestamp: new Date()
                    }
                }
            });
        } catch (error) {
            console.error('[DEBUGGER] Failed to log activity:', error);
        }
    }
}

module.exports = new DebuggerController();
