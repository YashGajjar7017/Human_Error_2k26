/**
 * Code Autocomplete Module
 * Integrates with backend prediction API for real-time code suggestions
 */

class CodeAutocomplete {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'http://localhost:5001/api/predict';
        this.updateDelay = options.updateDelay || 500; // ms
        this.maxSuggestions = options.maxSuggestions || 5;
        this.language = options.language || 'python';
        
        this.editor = null;
        this.suggestionsDiv = null;
        this.currentSuggestions = [];
        this.updateTimer = null;
        this.selectedIndex = 0;
        
        this.stats = {
            suggestions_shown: 0,
            suggestions_accepted: 0,
            keystrokes: 0
        };
    }
    
    /**
     * Initialize autocomplete on textarea or code editor
     */
    init(editorElement, suggestionsContainer) {
        this.editor = editorElement;
        this.suggestionsDiv = suggestionsContainer || this._createSuggestionsDiv();
        
        // Attach event listeners
        this.editor.addEventListener('input', (e) => this._onInput(e));
        this.editor.addEventListener('keydown', (e) => this._onKeyDown(e));
        this.editor.addEventListener('click', () => this._closeSuggestions());
        
        console.log('✓ Code autocomplete initialized');
    }
    
    /**
     * Handle input changes
     */
    _onInput(event) {
        this.stats.keystrokes++;
        
        // Debounce suggestions
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        
        this.updateTimer = setTimeout(() => {
            this._updateSuggestions();
        }, this.updateDelay);
    }
    
    /**
     * Handle keyboard navigation
     */
    _onKeyDown(event) {
        // Don't interfere with normal shortcuts
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        
        // Escape: close suggestions
        if (event.key === 'Escape') {
            this._closeSuggestions();
            return;
        }
        
        // Arrow keys: navigate suggestions
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this._selectNext();
            return;
        }
        
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this._selectPrevious();
            return;
        }
        
        // Enter or Tab: accept suggestion
        if ((event.key === 'Enter' || event.key === 'Tab') && this.currentSuggestions.length > 0) {
            event.preventDefault();
            this._acceptSuggestion(this.selectedIndex);
            return;
        }
    }
    
    /**
     * Fetch suggestions from API
     */
    async _updateSuggestions() {
        const code = this.editor.value;
        
        if (!code || code.length < 2) {
            this._closeSuggestions();
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/completion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    language: this.language,
                    top_k: this.maxSuggestions
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.predictions && data.predictions.length > 0) {
                this.currentSuggestions = data.predictions;
                this.selectedIndex = 0;
                this._showSuggestions();
                this.stats.suggestions_shown++;
            } else {
                this._closeSuggestions();
            }
        } catch (error) {
            console.error('Suggestion fetch error:', error);
            this._closeSuggestions();
        }
    }
    
    /**
     * Display suggestions
     */
    _showSuggestions() {
        this.suggestionsDiv.innerHTML = '';
        
        this.currentSuggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = `autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="suggestion-text">${this._escape(suggestion.display)}</div>
                <div class="suggestion-prob">${(suggestion.probability * 100).toFixed(1)}%</div>
            `;
            
            item.addEventListener('click', () => this._acceptSuggestion(index));
            item.addEventListener('mouseover', () => {
                this.selectedIndex = index;
                this._highlightSuggestion(index);
            });
            
            this.suggestionsDiv.appendChild(item);
        });
        
        this.suggestionsDiv.style.display = 'block';
    }
    
    /**
     * Highlight specific suggestion
     */
    _highlightSuggestion(index) {
        const items = this.suggestionsDiv.querySelectorAll('.autocomplete-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
    }
    
    /**
     * Navigate to next suggestion
     */
    _selectNext() {
        if (this.currentSuggestions.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.currentSuggestions.length;
        this._highlightSuggestion(this.selectedIndex);
    }
    
    /**
     * Navigate to previous suggestion
     */
    _selectPrevious() {
        if (this.currentSuggestions.length === 0) return;
        this.selectedIndex = (this.selectedIndex - 1 + this.currentSuggestions.length) % this.currentSuggestions.length;
        this._highlightSuggestion(this.selectedIndex);
    }
    
    /**
     * Accept a suggestion
     */
    _acceptSuggestion(index) {
        if (!this.currentSuggestions[index]) return;
        
        const suggestion = this.currentSuggestions[index].token;
        let code = this.editor.value;
        
        // Insert suggestion
        if (suggestion === '<NEWLINE>') {
            code += '\n';
        } else if (suggestion === '<INDENT>') {
            code += '    ';
        } else if (suggestion.startsWith('<KEYWORD:')) {
            code += suggestion.slice(9, -1) + ' ';
        } else {
            code += suggestion + ' ';
        }
        
        this.editor.value = code;
        this._closeSuggestions();
        this.stats.suggestions_accepted++;
        
        // Trigger change event
        this.editor.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    /**
     * Close suggestions
     */
    _closeSuggestions() {
        this.suggestionsDiv.style.display = 'none';
        this.currentSuggestions = [];
    }
    
    /**
     * Create suggestions container
     */
    _createSuggestionsDiv() {
        const div = document.createElement('div');
        div.id = 'autocomplete-suggestions';
        div.className = 'autocomplete-container';
        document.body.appendChild(div);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .autocomplete-container {
                position: fixed;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                max-width: 300px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 10000;
                display: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .autocomplete-item {
                padding: 8px 12px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .autocomplete-item:last-child {
                border-bottom: none;
            }
            
            .autocomplete-item:hover,
            .autocomplete-item.selected {
                background-color: #e3f2fd;
                color: #1976d2;
            }
            
            .suggestion-text {
                font-weight: 500;
            }
            
            .suggestion-prob {
                color: #999;
                font-size: 11px;
                margin-left: 8px;
            }
        `;
        document.head.appendChild(style);
        
        return div;
    }
    
    /**
     * HTML escape
     */
    _escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Get statistics
     */
    getStats() {
        return {
            ...this.stats,
            acceptance_rate: this.stats.suggestions_shown > 0 
                ? ((this.stats.suggestions_accepted / this.stats.suggestions_shown) * 100).toFixed(1) + '%'
                : 'N/A'
        };
    }
    
    /**
     * Clear statistics
     */
    clearStats() {
        this.stats = {
            suggestions_shown: 0,
            suggestions_accepted: 0,
            keystrokes: 0
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeAutocomplete;
}
