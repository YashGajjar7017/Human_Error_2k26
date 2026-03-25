// ===================================
// SETTINGS MANAGEMENT FOR VULKANKT IDE
// ===================================

// Initialize settings on page load
function initializeSettings() {
    setupSettingsTabs();
    setupThemeSwitching();
    setupSliderDisplays();
    loadSettingsFromStorage();
}

// Settings tab switching
function setupSettingsTabs() {
    const tabButtons = document.querySelectorAll('.settings-tab-btn');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active from all buttons and contents
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active to clicked button and corresponding content
            btn.classList.add('active');
            const activeContent = document.querySelector(`.settings-tab-content[data-tab="${tabName}"]`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}

// Theme switching functionality
function setupThemeSwitching() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
            
            // Update button states
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Set up color picker buttons
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const colorName = btn.getAttribute('data-color');
            setAccentColor(colorName);
            
            // Update button states
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Set theme and save to localStorage
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme === 'system' ? '' : theme);
    localStorage.setItem('theme', theme);
    
    // Update theme button states
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    logToConsole(`✅ Theme changed to ${theme}`, 'success');
}

// Set accent color and save to localStorage
function setAccentColor(colorName) {
    const colorMap = {
        'cyan': '#00d4ff',
        'blue': '#0088cc',
        'green': '#4ade80',
        'purple': '#9333ea',
        'pink': '#ec4899'
    };
    
    const colorValue = colorMap[colorName];
    if (colorValue) {
        document.documentElement.style.setProperty('--accent-color', colorValue);
        localStorage.setItem('accentColor', colorName);
        
        // Update color button states
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            if (btn.getAttribute('data-color') === colorName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        logToConsole(`✅ Accent color changed to ${colorName}`, 'success');
    }
}

// Setup slider value displays
function setupSliderDisplays() {
    const fontSizeInput = document.getElementById('fontSizeInput');
    const fontSizeValue = document.getElementById('fontSizeValue');
    if (fontSizeInput && fontSizeValue) {
        fontSizeInput.addEventListener('input', (e) => {
            fontSizeValue.textContent = e.target.value + 'px';
            if (elements.codeEditor) elements.codeEditor.style.fontSize = e.target.value + 'px';
        });
    }
    
    const lineHeightInput = document.getElementById('lineHeightInput');
    const lineHeightValue = document.getElementById('lineHeightValue');
    if (lineHeightInput && lineHeightValue) {
        lineHeightInput.addEventListener('input', (e) => {
            lineHeightValue.textContent = e.target.value;
            if (elements.codeEditor) elements.codeEditor.style.lineHeight = e.target.value;
        });
    }
    
    const autoSaveInput = document.getElementById('autoSaveInput');
    if (autoSaveInput) {
        autoSaveInput.addEventListener('input', (e) => {
            const value = Math.max(5, Math.min(300, parseInt(e.target.value) || 5));
            e.target.value = value;
            localStorage.setItem('autoSaveInterval', value);
        });
    }
    
    const undoLimitInput = document.getElementById('undoLimitInput');
    if (undoLimitInput) {
        undoLimitInput.addEventListener('input', (e) => {
            const value = Math.max(10, Math.min(1000, parseInt(e.target.value) || 100));
            e.target.value = value;
            localStorage.setItem('undoLimit', value);
        });
    }
}

// Comprehensive save all settings to localStorage
function saveSettings() {
    // Editor settings
    const fontFamily = document.getElementById('fontFamilySelect')?.value || 'Courier New';
    const fontSize = document.getElementById('fontSizeInput')?.value || '14';
    const lineHeight = document.getElementById('lineHeightInput')?.value || '1.5';
    const tabSize = document.getElementById('tabSizeSelect')?.value || '4';
    const autoSave = document.getElementById('autoSaveCheckbox')?.checked || false;
    const wordWrap = document.getElementById('wordWrapCheckbox')?.checked || false;
    const minimap = document.getElementById('minimapCheckbox')?.checked || false;
    const lineNumbers = document.getElementById('lineNumbersCheckbox')?.checked || true;
    const bracketHighlight = document.getElementById('bracketHighlightCheckbox')?.checked || true;
    const scrollBeyond = document.getElementById('scrollBeyondCheckbox')?.checked || false;
    
    // Compiler settings
    const defaultLanguage = document.getElementById('defaultLanguageSelect')?.value || 'c';
    const defaultArchitecture = document.getElementById('defaultArchitectureSelect')?.value || 'x64';
    const optimizationLevel = document.getElementById('optimizationSlider')?.value || '2';
    const strictMode = document.getElementById('strictModeCheckbox')?.checked || false;
    const warnings = document.getElementById('warningsCheckbox')?.checked || true;
    const errorChecking = document.getElementById('errorCheckingCheckbox')?.checked || true;
    const parallelBuild = document.getElementById('parallelBuildCheckbox')?.checked || true;
    
    // Appearance settings
    const theme = document.querySelector('.theme-btn.active')?.getAttribute('data-theme') || 'dark';
    const accentColor = document.querySelector('.color-btn.active')?.getAttribute('data-color') || 'cyan';
    const animationsEnabled = document.getElementById('animationsCheckbox')?.checked !== false;
    const glassMorphism = document.getElementById('glassMorphismCheckbox')?.checked !== false;
    const particles = document.getElementById('particlesCheckbox')?.checked || false;
    
    // General settings
    const autoSaveInterval = document.getElementById('autoSaveInput')?.value || '60';
    const undoLimit = document.getElementById('undoLimitInput')?.value || '100';
    const notifications = document.getElementById('notificationsCheckbox')?.checked !== false;
    const soundEffects = document.getElementById('soundEffectsCheckbox')?.checked || false;
    const updateCheck = document.getElementById('updateCheckCheckbox')?.checked !== false;
    const analytics = document.getElementById('analyticsCheckbox')?.checked !== false;
    
    // Create settings object
    const settings = {
        editor: {
            fontFamily, fontSize, lineHeight, tabSize,
            autoSave, wordWrap, minimap, lineNumbers, bracketHighlight, scrollBeyond
        },
        compiler: {
            defaultLanguage, defaultArchitecture, optimizationLevel,
            strictMode, warnings, errorChecking, parallelBuild
        },
        appearance: {
            theme, accentColor, animationsEnabled, glassMorphism, particles
        },
        general: {
            autoSaveInterval, undoLimit, notifications, soundEffects, updateCheck, analytics
        }
    };
    
    // Save to localStorage
    localStorage.setItem('IDESettings', JSON.stringify(settings));
    
    // Apply settings immediately
    applySettingsNow(settings);
    
    closeModal('settingsModal');
    logToConsole('✅ Settings saved successfully', 'success');
}

// Load settings from localStorage
function loadSettingsFromStorage() {
    const savedSettings = localStorage.getItem('IDESettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            applySettingsNow(settings);
            updateSettingsUI(settings);
        } catch (error) {
            logToConsole('⚠️ Error loading settings', 'warning');
        }
    } else {
        // Load theme from separate storage if exists
        const theme = localStorage.getItem('theme') || 'dark';
        const accentColor = localStorage.getItem('accentColor') || 'cyan';
        setTheme(theme);
        setAccentColor(accentColor);
    }
}

// Apply settings to the application
function applySettingsNow(settings) {
    if (settings.editor && elements.codeEditor) {
        const editor = settings.editor;
        if (editor.fontSize) {
            elements.codeEditor.style.fontSize = editor.fontSize + 'px';
        }
        if (editor.lineHeight) {
            elements.codeEditor.style.lineHeight = editor.lineHeight;
        }
        if (editor.tabSize) {
            elements.codeEditor.style.tabSize = editor.tabSize;
        }
    }
    
    if (settings.appearance) {
        const appearance = settings.appearance;
        setTheme(appearance.theme || 'dark');
        setAccentColor(appearance.accentColor || 'cyan');
        
        // Apply animation setting
        if (appearance.animationsEnabled === false) {
            document.body.style.animationPlayState = 'paused';
        }
    }
    
    if (settings.compiler) {
        const compiler = settings.compiler;
        if (compiler.defaultLanguage && elements.languageSelect) {
            elements.languageSelect.value = compiler.defaultLanguage;
        }
        if (compiler.defaultArchitecture && elements.architectureSelect) {
            elements.architectureSelect.value = compiler.defaultArchitecture;
        }
    }
}

// Update settings UI with saved settings
function updateSettingsUI(settings) {
    if (settings.editor) {
        const editor = settings.editor;
        if (editor.fontFamily && document.getElementById('fontFamilySelect')) {
            document.getElementById('fontFamilySelect').value = editor.fontFamily;
        }
        if (editor.fontSize && document.getElementById('fontSizeInput')) {
            document.getElementById('fontSizeInput').value = editor.fontSize;
            const display = document.getElementById('fontSizeValue');
            if (display) display.textContent = editor.fontSize + 'px';
        }
        if (editor.lineHeight && document.getElementById('lineHeightInput')) {
            document.getElementById('lineHeightInput').value = editor.lineHeight;
            const display = document.getElementById('lineHeightValue');
            if (display) display.textContent = editor.lineHeight;
        }
        if (editor.tabSize && document.getElementById('tabSizeSelect')) {
            document.getElementById('tabSizeSelect').value = editor.tabSize;
        }
    }
    
    if (settings.appearance) {
        const appearance = settings.appearance;
        // Update theme buttons
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            if (btn.getAttribute('data-theme') === appearance.theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        // Update color buttons
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            if (btn.getAttribute('data-color') === appearance.accentColor) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Reset settings to defaults
function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        localStorage.removeItem('IDESettings');
        localStorage.setItem('theme', 'dark');
        localStorage.setItem('accentColor', 'cyan');
        
        // Reload the page to apply defaults
        if (typeof logToConsole === 'function') {
            logToConsole('Settings reset to defaults', 'info');
        }
        location.reload();
    }
}
