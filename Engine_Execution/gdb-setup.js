const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class GDBCompiler {
    constructor(options = {}) {
        // Allow tests to inject a fake exec implementation for determinism
        this.exec = options.exec || exec;
        this.gdbPath = path.join(__dirname, '..', 'GDB Complier');
        this.tempDir = path.join(__dirname, 'temp');
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    compileCFile(filePath, outputName = 'output') {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(this.tempDir, outputName);
            const gccPath = path.join(this.gdbPath, 'gcc');
            const command = `"${gccPath}" "${filePath}" -o "${outputPath}"`;
            
            this.exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject({ error: error.message, stderr });
                    return;
                }
                resolve({ stdout, stderr, outputPath });
            });
        });
    }

    compileCppFile(filePath, outputName = 'output') {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(this.tempDir, outputName);
            const gppPath = path.join(this.gdbPath, 'g++');
            const command = `"${gppPath}" "${filePath}" -o "${outputPath}"`;
            
            this.exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject({ error: error.message, stderr });
                    return;
                }
                resolve({ stdout, stderr, outputPath });
            });
        });
    }

    debugFile(filePath, breakpoints = []) {
        return new Promise((resolve, reject) => {
            const gdbPath = path.join(this.gdbPath, 'gdb');
            const command = `"${gdbPath}" "${filePath}"`;
            
            const child = this.exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject({ error: error.message, stderr });
                    return;
                }
                resolve({ stdout, stderr });
            });

            // Send initial commands to GDB
            try {
                child.stdin.write('run\n');
                child.stdin.end();
            } catch (e) {
                // Some exec implementations may not expose stdin in tests; ignore
            }
        });
    }

    getCompilerInfo() {
        return {
            gcc: path.join(this.gdbPath, 'gcc'),
            gpp: path.join(this.gdbPath, 'g++'),
            gdb: path.join(this.gdbPath, 'gdb'),
            tempDir: this.tempDir
        };
    }

    compileFromContent(content, language, outputName = 'output') {
        return new Promise((resolve, reject) => {
            const extension = language === 'cpp' ? '.cpp' : '.c';
            const tempFile = path.join(this.tempDir, `temp_${Date.now()}${extension}`);
            
            fs.writeFile(tempFile, content, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                const compileMethod = language === 'cpp' ? 'compileCppFile' : 'compileCFile';
                this[compileMethod](tempFile, outputName)
                    .then(result => {
                        fs.unlink(tempFile, () => {});
                        resolve(result);
                    })
                    .catch(error => {
                        fs.unlink(tempFile, () => {});
                        reject(error);
                    });
            });
        });
    }
}

module.exports = GDBCompiler;
