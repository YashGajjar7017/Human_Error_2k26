const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Setup script to configure GDB compiler paths
function setupGDBCompiler() {
    const gdbPath = path.join(__dirname, '..', 'GDB Complier');
    const binPath = path.join(gdbPath, 'bin');
    
    console.log('Setting up GDB Compiler...');
    console.log('GDB Path:', gdbPath);
    
    // Check if GDB compiler exists
    if (!fs.existsSync(gdbPath)) {
        console.error('GDB Complier directory not found!');
        return false;
    }
    
    // Create symbolic links or configure paths
    const compilers = ['gcc', 'g++', 'gdb'];
    
    compilers.forEach(compiler => {
        const compilerPath = path.join(gdbPath, compiler);
        if (fs.existsSync(compilerPath)) {
            console.log(`✓ ${compiler} found at: ${compilerPath}`);
        } else {
            console.log(`✗ ${compiler} not found at: ${compilerPath}`);
        }
    });
    
    return true;
}

// Test compilation
function testCompilation() {
    const testCode = `
#include <stdio.h>
int main() {
    printf("Hello from GDB Compiler!\\n");
    return 0;
}
`;
    
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const testFile = path.join(tempDir, 'test.c');
    fs.writeFileSync(testFile, testCode);
    
    console.log('Testing compilation...');
    
    const GDBCompiler = require('./gdb-setup');
    const compiler = new GDBCompiler();
    
    compiler.compileCFile(testFile, 'test_output')
        .then(result => {
            console.log('✓ Compilation test successful!');
            console.log('Output:', result.stdout);
            fs.unlinkSync(testFile);
        })
        .catch(error => {
            console.error('✗ Compilation test failed:', error);
        });
}

module.exports = { setupGDBCompiler, testCompilation };

// Run setup if called directly
if (require.main === module) {
    setupGDBCompiler();
    testCompilation();
}
