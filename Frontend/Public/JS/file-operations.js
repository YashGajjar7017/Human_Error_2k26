// ===================================
// FILE OPERATIONS - SAVE & DOWNLOAD
// ===================================

class FileOperations {
    constructor() {
        this.editorBuffer = new Map();
        this.unsavedFiles = new Set();
        this.init();
    }

    init() {
        const editor = document.getElementById('codeEditor');
        
        if (editor) {
            // Track changes
            editor.addEventListener('input', () => this.markAsUnsaved());
            
            // Ctrl+S to save
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    this.saveFile();
                }
            });

            // Ctrl+Shift+S to save and download all
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                    e.preventDefault();
                    this.saveAndDownloadAll();
                }
            });
        }

        // Save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveFile());
        }
    }

    markAsUnsaved() {
        const editor = document.getElementById('codeEditor');
        const fileName = editor?.getAttribute('data-file-name') || 'Untitled';
        
        if (fileName) {
            this.unsavedFiles.add(fileName);
            this.updateTabStatus(fileName, true);
        }
    }

    updateTabStatus(fileName, unsaved) {
        const tab = document.querySelector(`.editor-tab:has(> span:contains("${fileName}"))`);
        if (tab) {
            if (unsaved) {
                tab.classList.add('unsaved');
                const span = tab.querySelector('span');
                if (span && !span.textContent.includes('●')) {
                    span.textContent = '● ' + span.textContent;
                }
            } else {
                tab.classList.remove('unsaved');
                const span = tab.querySelector('span');
                if (span) {
                    span.textContent = span.textContent.replace('● ', '');
                }
            }
        }
    }

    saveFile() {
        const editor = document.getElementById('codeEditor');
        const fileName = editor?.getAttribute('data-file-name');
        const filePath = editor?.getAttribute('data-file');
        
        if (!fileName || !filePath) {
            this.showNotification('No file selected', 'warning');
            return;
        }

        const content = editor.value;
        
        // Store in buffer
        this.editorBuffer.set(filePath, {
            content: content,
            name: fileName,
            timestamp: new Date(),
            size: new Blob([content]).size
        });

        this.unsavedFiles.delete(fileName);
        this.updateTabStatus(fileName, false);

        this.showNotification(`✓ File saved: ${fileName}`, 'success');
        console.log('File saved to buffer:', fileName);
    }

    async saveAndDownloadAll() {
        const editor = document.getElementById('codeEditor');
        
        if (!this.editorBuffer.size && !editor.value) {
            this.showNotification('No files to download', 'warning');
            return;
        }

        // Save current file first
        if (editor.getAttribute('data-file-name')) {
            this.saveFile();
        }

        // Create zip file (requires JSZip library)
        if (typeof JSZip === 'undefined') {
            // Fallback: download as text if JSZip not available
            this.downloadAsText();
            return;
        }

        try {
            const zip = new JSZip();
            
            // Add buffered files
            this.editorBuffer.forEach((file, path) => {
                zip.file(path, file.content);
            });

            const blob = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(blob, 'files.zip');
            
            this.showNotification('✓ All files downloaded!', 'success');
        } catch (error) {
            console.error('Error creating zip:', error);
            this.downloadAsText();
        }
    }

    downloadAsText() {
        if (!this.editorBuffer.size) {
            this.showNotification('No files to download', 'warning');
            return;
        }

        let content = '=== SAVED FILES ===\n\n';
        
        this.editorBuffer.forEach((file, path) => {
            content += `\n--- FILE: ${path} ---\n`;
            content += `Size: ${this.formatFileSize(file.size)}\n`;
            content += `Saved: ${file.timestamp.toLocaleString()}\n`;
            content += `\n${file.content}\n`;
            content += '---\n';
        });

        const blob = new Blob([content], { type: 'text/plain' });
        this.downloadBlob(blob, 'saved-files.txt');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log('Downloaded:', filename);
    }

    downloadSingleFile(filePath) {
        const file = this.editorBuffer.get(filePath);
        if (!file) {
            this.showNotification('File not in buffer', 'warning');
            return;
        }

        const blob = new Blob([file.content], { type: 'text/plain' });
        this.downloadBlob(blob, file.name);
        
        this.showNotification(`✓ Downloaded: ${file.name}`, 'success');
    }

    downloadCurrentFile() {
        const editor = document.getElementById('codeEditor');
        const fileName = editor?.getAttribute('data-file-name');
        const filePath = editor?.getAttribute('data-file');

        if (!fileName || !filePath) {
            this.showNotification('No file to download', 'warning');
            return;
        }

        // Ensure file is saved first
        if (this.unsavedFiles.has(fileName)) {
            this.saveFile();
        }

        const content = editor.value;
        const blob = new Blob([content], { type: 'text/plain' });
        this.downloadBlob(blob, fileName);
        
        this.showNotification(`✓ Downloaded: ${fileName}`, 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
            success: 'rgba(74, 222, 128, 0.9)',
            warning: 'rgba(251, 191, 36, 0.9)',
            error: 'rgba(255, 107, 107, 0.9)',
            info: 'rgba(0, 212, 255, 0.9)'
        };
        return colors[type] || colors.info;
    }

    // Export buffer for API usage
    getBufferContent() {
        return Object.fromEntries(this.editorBuffer);
    }

    // Clear buffer
    clearBuffer() {
        this.editorBuffer.clear();
        this.unsavedFiles.clear();
        this.showNotification('Buffer cleared', 'info');
    }

    // Get file from buffer
    getFile(filePath) {
        return this.editorBuffer.get(filePath);
    }

    // Add custom animation styles
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            .editor-tab.unsaved {
                font-weight: bold;
                color: var(--warning-color);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize file operations
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fileOperations = new FileOperations();
        window.fileOperations.addAnimationStyles();
    });
} else {
    window.fileOperations = new FileOperations();
    window.fileOperations.addAnimationStyles();
}
