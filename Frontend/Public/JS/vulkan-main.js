const state = {
    currentFile: 'example.c',
    code: '',
    breakpoints: new Set(),
    compilationResult: null,
    isCompiling: false,
    isRunning: false,
    isDebugging: false,
    tokenCount: 0,
    files: {
        'example.c': '#include <stdio.h>\nint main() {\n    printf("Hello, World!");\n    return 0;\n}',
        'hello.cpp': '#include <iostream>\nint main() {\n    std::cout << "Hello, C++" << std::endl;\n    return 0;\n}'
    },
    openTabs: ['example.c'],
    language: 'c',
    architecture: 'x64',
    optimization: 2,
    user: { name: 'Guest', email: null, isLoggedIn: false }
};

const elements = {
    // Panels
    mainContent: document.getElementById('mainContent'),
    leftPanel: document.getElementById('leftPanel'),
    middlePanel: document.getElementById('middlePanel'),
    rightPanel: document.getElementById('rightPanel'),
    resizeHandleLeft: document.getElementById('resizeHandleLeft'),
    resizeHandleRight: document.getElementById('resizeHandleRight'),
    dragDropArea: document.getElementById('dragDropArea'),
    
    // Editor
    codeEditor: document.getElementById('codeEditor'),
    lineNumbers: document.getElementById('lineNumbers'),
    breakpointsColumn: document.getElementById('breakpointsColumn'),
    cursorPosition: document.getElementById('cursorPosition'),
    fileInfo: document.getElementById('fileInfo'),
    editorTabs: document.getElementById('editorTabs'),
    
    // Controls
    languageSelect: document.getElementById('languageSelect'),
    architectureSelect: document.getElementById('architectureSelect'),
    optimizationLevel: document.getElementById('optimizationLevel'),
    optimizationValue: document.getElementById('optimizationValue'),
    
    // Buttons
    compileBtn: document.getElementById('compileBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    runBtn: document.getElementById('runBtn'),
    stopBtn: document.getElementById('stopBtn'),
    debugModeBtn: document.getElementById('debugModeBtn'),
    buildBtn: document.getElementById('buildBtn'),
    cleanBtn: document.getElementById('cleanBtn'),
    saveBtn: document.getElementById('saveBtn'),
    formatBtn: document.getElementById('formatBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    shareBtn: document.getElementById('shareBtn'),
    loginBtn: document.getElementById('loginBtn'),
    signupBtn: document.getElementById('signupBtn'),
    clearOutputBtn: document.getElementById('clearOutputBtn'),
    copyOutputBtn: document.getElementById('copyOutputBtn'),
    
    // Output
    outputBox: document.getElementById('outputBox'),
    consoleBox: document.getElementById('consoleBox'),
    debugBox: document.getElementById('debugBox'),
    debugVariables: document.getElementById('debugVariables'),
    debugBreakpoints: document.getElementById('debugBreakpoints'),
    
    // Status
    statusMessage: document.getElementById('statusMessage'),
    compilationTime: document.getElementById('compilationTime'),
    tokenCount: document.getElementById('tokenCount'),
    debugStatus: document.getElementById('debugStatus'),
    userInfo: document.getElementById('userInfo'),
    
    // File explorer
    fileExplorer: document.getElementById('fileExplorer'),
    
    // Modals
    settingsModal: document.getElementById('settingsModal'),
    loginModal: document.getElementById('loginModal'),
    signupModal: document.getElementById('signupModal'),
    
    // Spinner
    loadingSpinner: document.getElementById('loadingSpinner')
};

function init() {
    loadFile(state.currentFile);
    setupEditorEvents();
    setupButtonEvents();
    setupFileExplorerEvents();
    setupTabEvents();
    setupResizeHandles();
    setupDragDrop();
    setupThemeToggle();
    initializeSettings();
    
    updateLineNumbers();
    updateFileInfo();
    updateTokenCount();
    logToConsole('VulkanKT IDE initialized', 'success');
}

function setupResizeHandles() {
    let isResizing = false;
    let startX = 0;
    let startLeftWidth = 0;
    let resizingLeft = false;

    if (elements.resizeHandleLeft) {
        elements.resizeHandleLeft.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizingLeft = true;
            startX = e.clientX;
            startLeftWidth = elements.leftPanel.offsetWidth;
            document.body.style.cursor = 'col-resize';
        });
    }

    if (elements.resizeHandleRight) {
        elements.resizeHandleRight.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizingLeft = false;
            startX = e.clientX;
            startLeftWidth = elements.rightPanel.offsetWidth;
            document.body.style.cursor = 'col-resize';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const delta = e.clientX - startX;
        
        if (resizingLeft) {
            const newWidth = Math.max(200, Math.min(600, startLeftWidth + delta));
            elements.leftPanel.style.width = newWidth + 'px';
        } else {
            const newWidth = Math.max(200, Math.min(600, startLeftWidth - delta));
            elements.rightPanel.style.width = newWidth + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });
}

function setupDragDrop() {
    if (!elements.dragDropArea) return;
    
    const dragArea = elements.dragDropArea;
    const editor = elements.codeEditor;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        editor.addEventListener(eventName, preventDefaults, false);
        dragArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        editor.addEventListener(eventName, () => {
            dragArea.classList.add('active');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        editor.addEventListener(eventName, () => {
            dragArea.classList.remove('active');
        });
    });

    editor.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                elements.codeEditor.value = event.target.result;
                const fileName = file.name;
                state.currentFile = fileName;
                state.files[fileName] = event.target.result;
                state.openTabs = [fileName];
                updateEditorTabs();
                updateLineNumbers();
                logToConsole(`File loaded: ${fileName}`, 'success');
            };
            reader.readAsText(file);
        }
    });
}

function setupThemeToggle() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            logToConsole(`Theme switched to ${newTheme}`, 'info');
        });
    }
}

function updateThemeIcon(theme) {
    const icon = elements.themeToggleBtn.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}


function updateLineNumbers() {
    const lines = elements.codeEditor.value.split('\n');
    elements.lineNumbers.innerHTML = '';
    
    for (let i = 1; i <= Math.max(lines.length, 10); i++) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-number';
        lineDiv.textContent = i;
        elements.lineNumbers.appendChild(lineDiv);
    }
    
    updateBreakpointColumn(lines.length);
}

function updateTokenCount() {
    // Rough token estimation (1 token ≈ 4 characters)
    const codeLength = elements.codeEditor.value.length;
    state.tokenCount = Math.ceil(codeLength / 4);
    if (elements.tokenCount) {
        elements.tokenCount.textContent = `🔷 Tokens: ${state.tokenCount}`;
    }
}

function updateBreakpointColumn(lineCount) {
    elements.breakpointsColumn.innerHTML = '';
    
    for (let i = 1; i <= Math.max(lineCount, 10); i++) {
        const breakpoint = document.createElement('div');
        breakpoint.className = 'breakpoint';
        if (state.breakpoints.has(i)) {
            breakpoint.classList.add('active');
        }
        breakpoint.addEventListener('click', () => toggleBreakpoint(i));
        elements.breakpointsColumn.appendChild(breakpoint);
    }
}

function toggleBreakpoint(line) {
    if (state.breakpoints.has(line)) {
        state.breakpoints.delete(line);
    } else {
        state.breakpoints.add(line);
    }
    
    updateBreakpointColumn(elements.codeEditor.value.split('\n').length);
    updateDebugInfo();
    logToConsole(`Breakpoint toggled at line ${line}`, 'info');
}

function updateCursorPosition() {
    const lines = elements.codeEditor.value.substring(0, elements.codeEditor.selectionStart).split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    
    elements.cursorPosition.textContent = `Ln ${line}, Col ${col}`;
}

function updateFileInfo() {
    const lines = elements.codeEditor.value.split('\n').length;
    const lang = state.language.toUpperCase();
    elements.fileInfo.textContent = `${lang} • ${lines} lines`;
}

function setupEditorEvents() {
    elements.codeEditor.addEventListener('input', () => {
        updateLineNumbers();
        updateFileInfo();
        updateTokenCount();
        updateCursorPosition();
        state.code = elements.codeEditor.value;
    });
    
    elements.codeEditor.addEventListener('click', updateCursorPosition);
    elements.codeEditor.addEventListener('keyup', updateCursorPosition);
    
    // Sync scroll between line numbers and code
    elements.codeEditor.addEventListener('scroll', () => {
        elements.lineNumbers.scrollTop = elements.codeEditor.scrollTop;
        elements.breakpointsColumn.scrollTop = elements.codeEditor.scrollTop;
    });
    
    // Handle Tab key
    elements.codeEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = elements.codeEditor.selectionStart;
            const end = elements.codeEditor.selectionEnd;
            elements.codeEditor.value = 
                elements.codeEditor.value.substring(0, start) + 
                '\t' + 
                elements.codeEditor.value.substring(end);
            elements.codeEditor.selectionStart = elements.codeEditor.selectionEnd = start + 1;
            updateLineNumbers();
            updateTokenCount();
        }
    });
}

// ===================================
// FILE MANAGEMENT
// ===================================

function loadFile(filename) {
    state.currentFile = filename;
    state.code = state.files[filename] || '';
    elements.codeEditor.value = state.code;
    
    // Update language based on file extension
    const ext = filename.split('.').pop();
    const langMap = {
        'c': 'c',
        'cpp': 'cpp',
        'rs': 'rust',
        'go': 'go',
        'java': 'java',
        'py': 'python'
    };
    state.language = langMap[ext] || 'c';
    elements.languageSelect.value = state.language;
    
    // Update tabs
    updateEditorTabs();
    updateLineNumbers();
    updateCursorPosition();
    updateFileInfo();
    
    logToConsole(`Loaded file: ${filename}`, 'info');
}

function updateEditorTabs() {
    elements.editorTabs.innerHTML = '';
    
    state.openTabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `editor-tab ${tab === state.currentFile ? 'active' : ''}`;
        tabEl.dataset.file = tab;
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-code';
        
        const label = document.createElement('span');
        label.textContent = tab;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-close-tab';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab);
        });
        
        tabEl.appendChild(icon);
        tabEl.appendChild(label);
        tabEl.appendChild(closeBtn);
        
        tabEl.addEventListener('click', () => loadFile(tab));
        
        elements.editorTabs.appendChild(tabEl);
    });
}

function closeTab(filename) {
    state.openTabs = state.openTabs.filter(t => t !== filename);
    if (state.currentFile === filename) {
        state.currentFile = state.openTabs[0] || 'example.c';
        if (!state.openTabs.includes(state.currentFile)) {
            state.openTabs.push(state.currentFile);
        }
        loadFile(state.currentFile);
    }
    updateEditorTabs();
}

// ===================================
// FILE EXPLORER
// ===================================

function setupFileExplorerEvents() {
    document.querySelectorAll('.folder-item').forEach(item => {
        const toggle = item.querySelector('.folder-toggle');
        const nextItems = item.nextElementSibling;
        
        if (nextItems && nextItems.classList.contains('folder-items')) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                nextItems.classList.toggle('active');
                toggle.textContent = nextItems.classList.contains('active') ? '▼' : '▶';
            });
        }
    });
    
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
            const filename = item.dataset.file;
            if (!state.openTabs.includes(filename)) {
                state.openTabs.push(filename);
                updateEditorTabs();
            }
            loadFile(filename);
        });
    });
}

// ===================================
// TAB SWITCHING
// ===================================

function setupTabEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update button states
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content visibility
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabContent = document.getElementById(tab + 'Tab');
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

// ===================================
// BUTTON EVENTS
// ===================================

function setupButtonEvents() {
    // Compilation
    if (elements.compileBtn) elements.compileBtn.addEventListener('click', compileCode);
    if (elements.analyzeBtn) elements.analyzeBtn.addEventListener('click', analyzeCode);
    
    // Execution
    if (elements.runBtn) elements.runBtn.addEventListener('click', runCode);
    if (elements.stopBtn) elements.stopBtn.addEventListener('click', stopCode);
    
    // Debug
    if (elements.debugModeBtn) elements.debugModeBtn.addEventListener('click', toggleDebugMode);
    
    // Build
    if (elements.buildBtn) elements.buildBtn.addEventListener('click', buildProject);
    if (elements.cleanBtn) elements.cleanBtn.addEventListener('click', cleanBuild);
    
    // File
    if (elements.saveBtn) elements.saveBtn.addEventListener('click', saveFile);
    if (elements.formatBtn) elements.formatBtn.addEventListener('click', formatCode);
    
    // Settings & Auth
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', () => openModal('settingsModal'));
    if (elements.shareBtn) elements.shareBtn.addEventListener('click', shareCode);
    if (elements.loginBtn) elements.loginBtn.addEventListener('click', () => openModal('loginModal'));
    if (elements.signupBtn) elements.signupBtn.addEventListener('click', () => openModal('signupModal'));
    
    // Output controls
    if (elements.clearOutputBtn) elements.clearOutputBtn.addEventListener('click', clearOutput);
    if (elements.copyOutputBtn) elements.copyOutputBtn.addEventListener('click', copyOutput);
    
    // Selectors
    elements.languageSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
        updateFileInfo();
        logToConsole(`Language switched to ${state.language}`, 'info');
    });

    elements.architectureSelect.addEventListener('change', (e) => {
        state.architecture = e.target.value;
        logToConsole(`Architecture changed to ${state.architecture}`, 'info');
    });

    elements.optimizationLevel.addEventListener('change', (e) => {
        state.optimization = parseInt(e.target.value);
        const levels = ['O0', 'O1', 'O2', 'O3'];
        if (elements.optimizationValue) {
            elements.optimizationValue.textContent = levels[state.optimization];
        }
        logToConsole(`Optimization level set to ${levels[state.optimization]}`, 'info');
    });
}

// ===================================
// ACTION HANDLERS
// ===================================

function runCode() {
    if (!state.isRunning) {
        state.isRunning = true;
        if (elements.runBtn) elements.runBtn.style.opacity = '0.5';
        logToConsole('▶️ Program started', 'success');
        if (elements.statusMessage) elements.statusMessage.textContent = '▶️ Running...';
        setTimeout(() => {
            state.isRunning = false;
            if (elements.runBtn) elements.runBtn.style.opacity = '1';
            logToConsole('Program finished', 'success');
            if (elements.statusMessage) elements.statusMessage.textContent = 'Ready';
        }, 2000);
    }
}

function stopCode() {
    if (state.isRunning) {
        state.isRunning = false;
        if (elements.runBtn) elements.runBtn.style.opacity = '1';
        logToConsole('⏹️ Program stopped', 'warning');
        if (elements.statusMessage) elements.statusMessage.textContent = 'Stopped';
    }
}

function toggleDebugMode() {
    state.isDebugging = !state.isDebugging;
    if (elements.debugStatus) {
        elements.debugStatus.classList.toggle('active');
        elements.debugStatus.textContent = state.isDebugging ? 'Debug: ON' : 'Debug: OFF';
    }
    if (elements.debugModeBtn) elements.debugModeBtn.style.opacity = state.isDebugging ? '1' : '0.5';
    logToConsole(`Debug mode ${state.isDebugging ? 'enabled' : 'disabled'}`, 'info');
    switchTab('debug');
}

function buildProject() {
    logToConsole('📦 Building project...', 'info');
    setTimeout(() => {
        logToConsole('✅ Build completed', 'success');
        if (elements.statusMessage) elements.statusMessage.textContent = '✅ Build successful';
    }, 1500);
}

function cleanBuild() {
    logToConsole('🧹 Cleaning build artifacts...', 'info');
    setTimeout(() => {
        logToConsole('✅ Clean completed', 'success');
        if (elements.statusMessage) elements.statusMessage.textContent = 'Clean completed';
    }, 1000);
}

function saveFile() {
    state.files[state.currentFile] = elements.codeEditor.value;
    logToConsole(`💾 File saved: ${state.currentFile}`, 'success');
    if (elements.statusMessage) elements.statusMessage.textContent = '💾 Saved';
}

function formatCode() {
    logToConsole('🎨 Formatting code...', 'info');
    setTimeout(() => {
        logToConsole('✅ Code formatted', 'success');
    }, 500);
}

function shareCode() {
    const code = elements.codeEditor.value;
    const shareText = `VulkanKT Code:\n\n${code}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'VulkanKT Code',
            text: shareText
        });
    } else {
        logToConsole('Share functionality not available', 'warning');
    }
}

// ===================================
// API CALLS - COMPILE
// ===================================

async function compileCode() {
    const code = elements.codeEditor.value;
    
    if (!code.trim()) {
        logToConsole('Error: Code is empty', 'error');
        return;
    }
    
    state.isCompiling = true;
    elements.loadingSpinner.classList.add('active');
    elements.compileBtn.disabled = true;
    
    const startTime = performance.now();
    
    try {
        const response = await fetch('/api/vulkan/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                language: state.language,
                target: state.architecture,
                flags: { optimization: state.optimization }
            })
        });
        
        const result = await response.json();
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        if (result.success) {
            state.compilationResult = result.data;
            displayCompilationResult(result.data, duration);
            elements.statusMessage.textContent = '✅ Compilation successful';
            elements.compilationTime.textContent = `⏱️ ${duration}ms`;
            logToConsole(`Compilation complete: ${duration}ms`, 'success');
        } else {
            logToConsole(`Compilation error: ${result.error}`, 'error');
            elements.statusMessage.textContent = `❌ ${result.error}`;
        }
    } catch (error) {
        logToConsole(`Network error: ${error.message}`, 'error');
        elements.statusMessage.textContent = '❌ Network error';
    } finally {
        state.isCompiling = false;
        elements.loadingSpinner.classList.remove('active');
        elements.compileBtn.disabled = false;
    }
}

// ===================================
// API CALLS - ANALYZE
// ===================================

async function analyzeCode() {
    const code = elements.codeEditor.value;
    
    if (!code.trim()) {
        logToConsole('Error: Code is empty', 'error');
        return;
    }
    
    elements.loadingSpinner.classList.add('active');
    
    try {
        const response = await fetch('/api/vulkan/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                language: state.language
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayAnalysisResult(result.data);
            logToConsole('Code analysis complete', 'success');
        } else {
            logToConsole(`Analysis error: ${result.error}`, 'error');
        }
    } catch (error) {
        logToConsole(`Network error: ${error.message}`, 'error');
    } finally {
        elements.loadingSpinner.classList.remove('active');
    }
}

// ===================================
// DISPLAY RESULTS
// ===================================

function displayCompilationResult(data, duration) {
    // Clear previous output
    elements.outputBox.innerHTML = '';
    
    // Machine Code
    const machineCodeSection = document.createElement('div');
    machineCodeSection.innerHTML = `
        <h4 style="color: var(--accent-color); margin-bottom: 10px;">Machine Code (Hex)</h4>
        <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; margin-bottom: 15px; max-height: 150px; overflow-y: auto;">
            <code style="color: #90ee90; word-break: break-all; font-size: 11px;">
                ${data.machineCode.substring(0, 500)}${data.machineCode.length > 500 ? '...' : ''}
            </code>
        </div>
    `;
    elements.outputBox.appendChild(machineCodeSection);
    
    // Binary Info
    const infoSection = document.createElement('div');
    infoSection.innerHTML = `
        <h4 style="color: var(--accent-color); margin-bottom: 8px;">Binary Information</h4>
        <div style="font-size: 12px; color: var(--text-primary); line-height: 1.6;">
            <div><strong>Size:</strong> ${data.metadata.size} bytes</div>
            <div><strong>Language:</strong> ${data.metadata.language}</div>
            <div><strong>Target:</strong> ${data.metadata.target}</div>
            <div><strong>Optimization:</strong> O${data.metadata.optimizationLevel}</div>
            <div><strong>Duration:</strong> ${duration}ms</div>
        </div>
    `;
    elements.outputBox.appendChild(infoSection);
    
    // Assembly Preview
    const assemblySection = document.createElement('div');
    assemblySection.style.marginTop = '15px';
    assemblySection.innerHTML = `
        <h4 style="color: var(--accent-color); margin-bottom: 8px;">Assembly Code (Preview)</h4>
        <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; max-height: 150px; overflow-y: auto;">
            <pre style="color: #87ceeb; font-size: 11px; margin: 0;">
${data.assembly.split('\n').slice(0, 10).join('\n')}${data.assembly.split('\n').length > 10 ? '\n...' : ''}
            </pre>
        </div>
    `;
    elements.outputBox.appendChild(assemblySection);
    
    // Switch to output tab
    document.querySelectorAll('.tab-btn')[0].click();
}

function displayAnalysisResult(data) {
    elements.outputBox.innerHTML = '';
    
    const statsSection = document.createElement('div');
    statsSection.innerHTML = `
        <h4 style="color: var(--accent-color); margin-bottom: 10px;">Code Analysis</h4>
        <div style="font-size: 12px; color: var(--text-primary); line-height: 2;">
            <div><strong>Language:</strong> ${data.language}</div>
            <div><strong>Lines:</strong> ${data.stats.lines}</div>
            <div><strong>Functions:</strong> ${data.stats.functions}</div>
            <div><strong>Variables:</strong> ${data.stats.variables}</div>
            <div><strong>Imports:</strong> ${data.stats.imports}</div>
        </div>
    `;
    elements.outputBox.appendChild(statsSection);
    
    document.querySelectorAll('.tab-btn')[0].click();
}

// ===================================
// OUTPUT MANAGEMENT
// ===================================

function clearOutput() {
    elements.outputBox.innerHTML = '<p class="output-info">📋 Output cleared</p>';
    if (elements.consoleBox) elements.consoleBox.innerHTML = '';
    if (elements.debugBox) elements.debugBox.innerHTML = '';
    logToConsole('Output cleared', 'info');
}

function copyOutput() {
    const text = elements.outputBox.innerText;
    navigator.clipboard.writeText(text).then(() => {
        logToConsole('Output copied to clipboard', 'success');
    }).catch(() => {
        logToConsole('Failed to copy output', 'error');
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.output-tabs .tab-btn');
    const contents = document.querySelectorAll('.output-content .tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    const activeTab = document.querySelector(`.output-tabs [data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

// ===================================
// OUTPUT MANAGEMENT
// ===================================

function clearOutput() {
    elements.outputBox.innerHTML = '<p class="output-info">📋 Output cleared</p>';
    if (elements.consoleBox) elements.consoleBox.innerHTML = '';
    if (elements.debugBox) elements.debugBox.innerHTML = '';
    logToConsole('Output cleared', 'info');
}

function copyOutput() {
    const text = elements.outputBox.innerText;
    navigator.clipboard.writeText(text).then(() => {
        logToConsole('Output copied to clipboard', 'success');
    }).catch(() => {
        logToConsole('Failed to copy output', 'error');
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.output-tabs .tab-btn');
    const contents = document.querySelectorAll('.output-content .tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    const activeTab = document.querySelector(`.output-tabs [data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

// ===================================
// MODAL FUNCTIONS
// ===================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        state.user = { name: 'User', email: email, isLoggedIn: true };
        updateUserInfo();
        closeModal('loginModal');
        logToConsole(`✅ Logged in as ${email}`, 'success');
    } else {
        logToConsole('⚠️ Please fill in all fields', 'warning');
    }
}

function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!name || !email || !password) {
        logToConsole('⚠️ Please fill in all fields', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        logToConsole('⚠️ Passwords do not match', 'error');
        return;
    }
    
    if (!agreeTerms) {
        logToConsole('⚠️ Please agree to terms and conditions', 'warning');
        return;
    }
    
    state.user = { name: name, email: email, isLoggedIn: true };
    updateUserInfo();
    closeModal('signupModal');
    logToConsole(`✅ Account created for ${name}`, 'success');
}

function switchToLogin() {
    closeModal('signupModal');
    openModal('loginModal');
}

function switchToSignup() {
    closeModal('loginModal');
    openModal('signupModal');
}

function saveSettings() {
    const autoSave = document.getElementById('autoSaveCheckbox').checked;
    const fontSize = document.getElementById('fontSizeInput').value;
    
    localStorage.setItem('autoSave', autoSave);
    localStorage.setItem('fontSize', fontSize);
    
    elements.codeEditor.style.fontSize = fontSize + 'px';
    closeModal('settingsModal');
    logToConsole('✅ Settings saved', 'success');
}

function updateUserInfo() {
    const displayName = state.user.isLoggedIn ? state.user.name : 'Guest';
    if (elements.userInfo) {
        elements.userInfo.textContent = `👤 ${displayName}`;
    }
}

// ===================================
// UTILITIES
// ===================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// OUTPUT MANAGEMENT
// ===================================

function clearOutput() {
    elements.outputBox.innerHTML = '<p class="output-info">📋 Output cleared</p>';
    if (elements.consoleBox) elements.consoleBox.innerHTML = '';
    if (elements.debugBox) elements.debugBox.innerHTML = '';
    logToConsole('Output cleared', 'info');
}

function copyOutput() {
    const text = elements.outputBox.innerText;
    navigator.clipboard.writeText(text).then(() => {
        logToConsole('Output copied to clipboard', 'success');
    }).catch(() => {
        logToConsole('Failed to copy output', 'error');
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.output-tabs .tab-btn');
    const contents = document.querySelectorAll('.output-content .tab-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    const activeTab = document.querySelector(`.output-tabs [data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
}

// ===================================
// MODAL FUNCTIONS
// ===================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        state.user = { name: 'User', email: email, isLoggedIn: true };
        updateUserInfo();
        closeModal('loginModal');
        logToConsole(`✅ Logged in as ${email}`, 'success');
    } else {
        logToConsole('⚠️ Please fill in all fields', 'warning');
    }
}

function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!name || !email || !password) {
        logToConsole('⚠️ Please fill in all fields', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        logToConsole('⚠️ Passwords do not match', 'error');
        return;
    }
    
    if (!agreeTerms) {
        logToConsole('⚠️ Please agree to terms and conditions', 'warning');
        return;
    }
    
    state.user = { name: name, email: email, isLoggedIn: true };
    updateUserInfo();
    closeModal('signupModal');
    logToConsole(`✅ Account created for ${name}`, 'success');
}

function switchToLogin() {
    closeModal('signupModal');
    openModal('loginModal');
}

function switchToSignup() {
    closeModal('loginModal');
    openModal('signupModal');
}

function saveSettings() {
    const autoSave = document.getElementById('autoSaveCheckbox').checked;
    const fontSize = document.getElementById('fontSizeInput').value;
    
    localStorage.setItem('autoSave', autoSave);
    localStorage.setItem('fontSize', fontSize);
    
    elements.codeEditor.style.fontSize = fontSize + 'px';
    closeModal('settingsModal');
    logToConsole('✅ Settings saved', 'success');
}

function updateUserInfo() {
    const displayName = state.user.isLoggedIn ? state.user.name : 'Guest';
    if (elements.userInfo) {
        elements.userInfo.textContent = `👤 ${displayName}`;
    }
}

// ===================================
// UTILITIES
// ===================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// LOGGING
// ===================================

function logToConsole(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const consoleItem = document.createElement('div');
    consoleItem.className = `console-item ${type}`;
    consoleItem.innerHTML = `
        <span class="console-time">[${time}]</span>
        <span class="console-text">${message}</span>
    `;
    
    elements.consoleBox.appendChild(consoleItem);
    elements.consoleBox.scrollTop = elements.consoleBox.scrollHeight;
    
    // Keep only last 100 items
    if (elements.consoleBox.children.length > 100) {
        elements.consoleBox.removeChild(elements.consoleBox.firstChild);
    }
}

// ===================================
// DEBUG INFO
// ===================================

function updateDebugInfo() {
    // Update breakpoints
    elements.debugBreakpoints.innerHTML = '';
    if (state.breakpoints.size > 0) {
        Array.from(state.breakpoints).sort((a, b) => a - b).forEach(line => {
            const item = document.createElement('div');
            item.className = 'debug-breakpoint-item';
            item.innerHTML = `
                <span>Line ${line}</span>
                <button class="btn btn-sm" onclick="toggleBreakpoint(${line})">Remove</button>
            `;
            elements.debugBreakpoints.appendChild(item);
        });
    } else {
        elements.debugBreakpoints.innerHTML = '<p style="color: var(--text-secondary); font-size: 11px;">No breakpoints set</p>';
    }
}

// ===================================
// INITIALIZATION
// ===================================

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
