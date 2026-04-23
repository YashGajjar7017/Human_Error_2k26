// ===================================
// FOLDER MANAGER - FILE SYSTEM ACCESS
// ===================================

class FolderManager {
    constructor() {
        this.openedFolder = null;
        this.fileStructure = {};
        this.currentFiles = new Map();
        this.init();
    }

    init() {
        const openFolderBtn = document.getElementById('openFolderBtn');
        const folderInput = document.getElementById('folderInput');
        const closeFolderBtn = document.getElementById('closeFolderBtn');

        if (openFolderBtn) {
            openFolderBtn.addEventListener('click', () => this.openFolder());
        }

        if (folderInput) {
            folderInput.addEventListener('change', (e) => this.handleFolderSelect(e));
        }

        if (closeFolderBtn) {
            closeFolderBtn.addEventListener('click', () => this.closeFolder());
        }

        // Keyboard shortcut for opening folder (Ctrl+Shift+O)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                this.openFolder();
            }
        });
    }

    openFolder() {
        const folderInput = document.getElementById('folderInput');
        if (folderInput) {
            folderInput.click();
        }
    }

    async handleFolderSelect(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;

        // Get folder path from first file
        const firstFile = files[0];
        const folderPath = firstFile.webkitRelativePath.split('/')[0] || 'Folder';
        
        this.openedFolder = {
            name: folderPath,
            files: files,
            path: folderPath
        };

        // Build file structure
        this.buildFileStructure(files);
        
        // Display folder info
        this.displayFolderInfo(folderPath);
        
        // Build and display file tree
        this.displayFileTree();

        console.log('Folder opened:', folderPath, 'Files:', files.length);
    }

    buildFileStructure(files) {
        this.fileStructure = {};
        this.currentFiles.clear();

        files.forEach((file) => {
            const relativePath = file.webkitRelativePath;
            const pathParts = relativePath.split('/');
            const fileName = pathParts[pathParts.length - 1];
            
            // Store file reference
            this.currentFiles.set(relativePath, file);

            // Build nested structure
            let current = this.fileStructure;
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }
            
            current[fileName] = {
                isFile: true,
                path: relativePath,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            };
        });
    }

    displayFolderInfo(folderPath) {
        const folderInfo = document.getElementById('folderInfo');
        const folderPathEl = document.getElementById('folderPath');
        
        if (folderInfo && folderPathEl) {
            folderPathEl.textContent = `📁 ${folderPath} (${this.currentFiles.size} files)`;
            folderInfo.style.display = 'block';
        }
    }

    displayFileTree() {
        const fileExplorer = document.getElementById('fileExplorer');
        if (!fileExplorer) return;

        // Clear existing file tree (but keep the static folders)
        const existingTree = fileExplorer.querySelector('.file-tree-container');
        if (existingTree) {
            existingTree.remove();
        }

        const treeContainer = document.createElement('div');
        treeContainer.className = 'file-tree-container';
        
        // Render tree structure
        const tree = this.renderTreeStructure(this.fileStructure);
        treeContainer.appendChild(tree);
        
        fileExplorer.appendChild(treeContainer);
    }

    renderTreeStructure(structure, level = 0) {
        const fragment = document.createDocumentFragment();
        const keys = Object.keys(structure).sort((a, b) => {
            const aIsFile = structure[a].isFile || false;
            const bIsFile = structure[b].isFile || false;
            if (aIsFile !== bIsFile) return aIsFile ? 1 : -1;
            return a.localeCompare(b);
        });

        keys.forEach((key, index) => {
            const item = structure[key];
            const isFile = item.isFile === true;

            const element = document.createElement('div');
            element.className = `file-tree-item ${isFile ? 'file' : 'folder'}`;
            element.style.marginLeft = `${level * 16}px`;

            if (isFile) {
                // File item
                const icon = document.createElement('span');
                icon.className = 'tree-icon';
                icon.innerHTML = this.getFileIcon(key);

                const name = document.createElement('span');
                name.className = 'file-name';
                name.textContent = key;

                const size = document.createElement('span');
                size.className = 'file-size';
                size.textContent = this.formatFileSize(item.size);

                element.appendChild(icon);
                element.appendChild(name);
                element.appendChild(size);

                element.addEventListener('click', () => this.openFile(item.path));
                element.addEventListener('dblclick', () => this.editFile(item.path));

                element.addEventListener('mouseenter', () => {
                    element.style.cursor = 'pointer';
                });
            } else {
                // Folder item
                const icon = document.createElement('span');
                icon.className = 'tree-icon collapsed';
                icon.innerHTML = '▶';

                const name = document.createElement('span');
                name.className = 'folder-name';
                name.textContent = key;

                element.appendChild(icon);
                element.appendChild(name);
                element.classList.add('collapsed');

                // Toggle folder expand/collapse
                element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = element.classList.contains('expanded');
                    if (isExpanded) {
                        element.classList.remove('expanded');
                        element.classList.add('collapsed');
                        icon.innerHTML = '▶';
                        // Hide nested items
                        const nested = element.nextElementSibling;
                        if (nested && nested.classList.contains('file-tree-nested')) {
                            nested.classList.remove('open');
                        }
                    } else {
                        element.classList.remove('collapsed');
                        element.classList.add('expanded');
                        icon.innerHTML = '▼';
                        // Create nested list if not exists
                        if (!element.nextElementSibling || !element.nextElementSibling.classList.contains('file-tree-nested')) {
                            const nested = document.createElement('div');
                            nested.className = 'file-tree-nested open';
                            nested.appendChild(this.renderTreeStructure(item, level + 1));
                            element.insertAdjacentElement('afterend', nested);
                        } else {
                            element.nextElementSibling.classList.add('open');
                        }
                    }
                });
            }

            fragment.appendChild(element);
        });

        return fragment;
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'js': '{ }',
            'ts': '<>',
            'python': 'py',
            'py': 'py',
            'java': 'J',
            'c': 'C',
            'cpp': '++',
            'h': 'H',
            'html': '🌐',
            'css': '🎨',
            'json': '{}',
            'xml': '<>',
            'txt': '📄',
            'md': '📝',
            'jpg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️',
        };
        return iconMap[ext] || '📄';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    openFile(filePath) {
        const file = this.currentFiles.get(filePath);
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            
            // Get file name from path
            const fileName = filePath.split('/').pop();
            
            // Update editor
            const editor = document.getElementById('codeEditor');
            if (editor) {
                editor.value = content;
                editor.setAttribute('data-file', filePath);
                editor.setAttribute('data-file-name', fileName);
            }

            // Update tab
            this.createOrUpdateTab(fileName, filePath);

            // Mark file as active in tree
            this.markFileActive(filePath);

            console.log('File opened:', filePath);
        };

        reader.readAsText(file);
    }

    editFile(filePath) {
        this.openFile(filePath);
        const editor = document.getElementById('codeEditor');
        if (editor) {
            editor.focus();
        }
    }

    createOrUpdateTab(fileName, filePath) {
        const editorTabs = document.getElementById('editorTabs');
        if (!editorTabs) return;

        // Check if tab already exists
        let tab = editorTabs.querySelector(`[data-file="${filePath}"]`);
        
        if (!tab) {
            tab = document.createElement('div');
            tab.className = 'editor-tab';
            tab.setAttribute('data-file', filePath);
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-file-code';
            
            const span = document.createElement('span');
            span.textContent = fileName;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'btn-close-tab';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tab.remove();
            });

            tab.appendChild(icon);
            tab.appendChild(span);
            tab.appendChild(closeBtn);
            
            editorTabs.appendChild(tab);
        }

        // Make tab active
        editorTabs.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    }

    markFileActive(filePath) {
        const fileItems = document.querySelectorAll('.file-tree-item.file');
        fileItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-file-path') === filePath) {
                item.classList.add('active');
            }
        });
    }

    closeFolder() {
        this.openedFolder = null;
        this.fileStructure = {};
        this.currentFiles.clear();

        const folderInfo = document.getElementById('folderInfo');
        if (folderInfo) {
            folderInfo.style.display = 'none';
        }

        const treeContainer = document.querySelector('.file-tree-container');
        if (treeContainer) {
            treeContainer.remove();
        }

        const folderInput = document.getElementById('folderInput');
        if (folderInput) {
            folderInput.value = '';
        }

        console.log('Folder closed');
    }
}

// Initialize folder manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.folderManager = new FolderManager();
    });
} else {
    window.folderManager = new FolderManager();
}
