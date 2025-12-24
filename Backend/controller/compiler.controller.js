const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const crypto = require('crypto');

const TEMP_DIR = path.join(__dirname, '..', 'Compling', 'TemporaryCache');

async function ensureTempDir() {
    await fs.mkdir(TEMP_DIR, { recursive: true });
}

function randomName(prefix = 'tmp') {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
}

function truncateBuffer(buf, maxBytes) {
    if (!maxBytes) return buf;
    if (buf.length <= maxBytes) return buf;
    return Buffer.concat([buf.slice(0, maxBytes), Buffer.from('\n...output truncated')]);
}

function spawnWithTimeout(command, args, opts = {}) {
    const { timeout = 5000, maxOutput = 1024 * 1024, cwd } = opts;

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
        let stdoutBuf = Buffer.alloc(0);
        let stderrBuf = Buffer.alloc(0);
        let timedOut = false;

        const killTimer = setTimeout(() => {
            timedOut = true;
            try { child.kill('SIGKILL'); } catch (e) {}
        }, timeout);

        child.stdout.on('data', (d) => {
            stdoutBuf = Buffer.concat([stdoutBuf, d]);
            if (stdoutBuf.length > maxOutput) stdoutBuf = truncateBuffer(stdoutBuf, maxOutput);
        });
        child.stderr.on('data', (d) => {
            stderrBuf = Buffer.concat([stderrBuf, d]);
            if (stderrBuf.length > maxOutput) stderrBuf = truncateBuffer(stderrBuf, maxOutput);
        });

        child.on('error', (err) => {
            clearTimeout(killTimer);
            reject(err);
        });

        child.on('close', (code, signal) => {
            clearTimeout(killTimer);
            resolve({ code, signal, stdout: stdoutBuf.toString('utf8'), stderr: stderrBuf.toString('utf8'), timedOut });
        });
    });
}

async function compileAndRunFromContent({ content, language, filename, stdin = '', timeout = 5000, maxOutput = 1024 * 1024 }) {
    await ensureTempDir();
    language = (language || '').toLowerCase();
    filename = filename || (language === 'python' ? 'script.py' : (language === 'javascript' ? 'script.js' : `source`));

    const baseName = randomName('run');
    const workDir = path.join(TEMP_DIR, baseName);
    await fs.mkdir(workDir, { recursive: true });

    try {
        if (language === 'c' || language === 'cpp') {
            const ext = language === 'cpp' ? '.cpp' : '.c';
            const srcPath = path.join(workDir, filename.endsWith(ext) ? filename : `main${ext}`);
            await fs.writeFile(srcPath, content);
            const exeName = process.platform === 'win32' ? 'a.exe' : 'a.out';
            const compiler = language === 'cpp' ? 'g++' : 'gcc';
            const compileArgs = [srcPath, '-O2', '-o', exeName];
            const compile = await spawnWithTimeout(compiler, compileArgs, { cwd: workDir, timeout: timeout, maxOutput });
            if (compile.code !== 0) {
                return { success: false, compile, stdout: compile.stdout, stderr: compile.stderr };
            }

            const run = await spawnWithTimeout(path.join(workDir, exeName), [], { cwd: workDir, timeout, maxOutput });
            return { success: true, compile, run, stdout: run.stdout, stderr: run.stderr };
        }

        if (language === 'python') {
            const srcPath = path.join(workDir, filename.endsWith('.py') ? filename : `script.py`);
            await fs.writeFile(srcPath, content);
            const run = await spawnWithTimeout('python', [srcPath], { cwd: workDir, timeout, maxOutput });
            return { success: true, run, stdout: run.stdout, stderr: run.stderr };
        }

        // TypeScript: try ts-node or tsc -> node transpile
        if (language === 'typescript' || language === 'ts') {
            const srcPath = path.join(workDir, filename.endsWith('.ts') ? filename : `script.ts`);
            await fs.writeFile(srcPath, content);

            // Try npx ts-node first (run directly), fallback to tsc compile
            try {
                const run = await spawnWithTimeout('npx', ['ts-node', srcPath], { cwd: workDir, timeout, maxOutput });
                return { success: true, run, stdout: run.stdout, stderr: run.stderr };
            } catch (err) {
                // fallback to tsc + node
                const outJs = path.join(workDir, 'out.js');
                const compile = await spawnWithTimeout('npx', ['tsc', '--outFile', outJs, srcPath], { cwd: workDir, timeout, maxOutput });
                if (compile.code !== 0) return { success: false, compile, stdout: compile.stdout, stderr: compile.stderr };
                const run = await spawnWithTimeout('node', [outJs], { cwd: workDir, timeout, maxOutput });
                return { success: true, compile, run, stdout: run.stdout, stderr: run.stderr };
            }
        }

        // Go: compile to an executable and run
        if (language === 'go' || language === 'golang') {
            const srcPath = path.join(workDir, filename.endsWith('.go') ? filename : `main.go`);
            await fs.writeFile(srcPath, content);
            const exeName = process.platform === 'win32' ? 'main.exe' : 'main';
            const compile = await spawnWithTimeout('go', ['build', '-o', exeName, srcPath], { cwd: workDir, timeout, maxOutput });
            if (compile.code !== 0) return { success: false, compile, stdout: compile.stdout, stderr: compile.stderr };
            const run = await spawnWithTimeout(path.join(workDir, exeName), [], { cwd: workDir, timeout, maxOutput });
            return { success: true, compile, run, stdout: run.stdout, stderr: run.stderr };
        }

        // Rust: use rustc to compile to an executable and run
        if (language === 'rust') {
            const ext = '.rs';
            const srcPath = path.join(workDir, filename.endsWith(ext) ? filename : `main${ext}`);
            await fs.writeFile(srcPath, content);
            const exeName = process.platform === 'win32' ? 'main.exe' : 'main';
            const compile = await spawnWithTimeout('rustc', [srcPath, '-o', exeName], { cwd: workDir, timeout, maxOutput });
            if (compile.code !== 0) return { success: false, compile, stdout: compile.stdout, stderr: compile.stderr };
            const run = await spawnWithTimeout(path.join(workDir, exeName), [], { cwd: workDir, timeout, maxOutput });
            return { success: true, compile, run, stdout: run.stdout, stderr: run.stderr };
        }

        if (language === 'javascript' || language === 'node') {
            const srcPath = path.join(workDir, filename.endsWith('.js') ? filename : `script.js`);
            await fs.writeFile(srcPath, content);
            const run = await spawnWithTimeout('node', [srcPath], { cwd: workDir, timeout, maxOutput });
            return { success: true, run, stdout: run.stdout, stderr: run.stderr };
        }

        if (language === 'java') {
            // Expect the content to contain a public class with matching name
            const classNameMatch = content.match(/public\s+class\s+(\w+)/);
            const className = classNameMatch ? classNameMatch[1] : 'Main';
            const srcPath = path.join(workDir, `${className}.java`);
            await fs.writeFile(srcPath, content);
            const compile = await spawnWithTimeout('javac', [srcPath], { cwd: workDir, timeout, maxOutput });
            if (compile.code !== 0) return { success: false, compile, stdout: compile.stdout, stderr: compile.stderr };
            const run = await spawnWithTimeout('java', ['-cp', workDir, className], { cwd: workDir, timeout, maxOutput });
            return { success: true, compile, run, stdout: run.stdout, stderr: run.stderr };
        }

        return { success: false, error: 'Unsupported language' };
    } catch (err) {
        return { success: false, error: err.message || String(err) };
    } finally {
        // Clean up workDir asynchronously (best-effort)
        fs.rm(workDir, { recursive: true, force: true }).catch(() => { });
    }
}

module.exports = {
    compileAndRunFromContent,
    spawnWithTimeout
};
