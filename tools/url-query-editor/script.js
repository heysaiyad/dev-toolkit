class URLQueryEditor {
    constructor() {
        this.parameters = new Map();
        this.baseUrl = '';
        this.initializeElements();
        this.bindEvents();
        this.loadSampleURL();
    }

    initializeElements() {
        this.urlInput = document.getElementById('urlInput');
        this.parseBtn = document.getElementById('parseBtn');
        this.addParamBtn = document.getElementById('addParamBtn');
        this.parametersContainer = document.getElementById('parametersContainer');
        this.outputUrl = document.getElementById('outputUrl');
        this.copyBtn = document.getElementById('copyBtn');
    }

    bindEvents() {
        this.parseBtn.addEventListener('click', () => this.parseURL());
        this.addParamBtn.addEventListener('click', () => this.addParameter());
        this.copyBtn.addEventListener('click', () => this.copyURL());
        
        // Parse URL on Enter key
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.parseURL();
            }
        });

        // Auto-update URL when typing
        this.urlInput.addEventListener('input', () => {
            this.debounce(() => this.autoParseURL(), 500);
        });
    }

    loadSampleURL() {
        const sampleURL = 'https://example.com/search?q=javascript&category=programming&sort=date&limit=10';
        this.urlInput.value = sampleURL;
        this.parseURL();
    }

    loadExample(exampleUrl) {
        this.urlInput.value = exampleUrl;
        this.parseURL();
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }

    autoParseURL() {
        const url = this.urlInput.value.trim();
        if (url && this.isValidURL(url)) {
            this.parseURL();
        }
    }

    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            // Check if it's a relative URL with parameters
            return string.includes('?') && string.includes('=');
        }
    }

    parseURL() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a URL');
            return;
        }

        try {
            let urlObject;
            
            // Handle full URLs
            if (url.startsWith('http://') || url.startsWith('https://')) {
                urlObject = new URL(url);
                this.baseUrl = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;
            } 
            // Handle URLs without protocol
            else if (url.includes('://')) {
                urlObject = new URL(url);
                this.baseUrl = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;
            }
            // Handle relative URLs or URLs without protocol
            else {
                const parts = url.split('?');
                this.baseUrl = parts[0] || '';
                
                // Create a fake URL object to parse parameters
                const fakeUrl = 'https://example.com' + (url.startsWith('/') ? url : '/' + url);
                urlObject = new URL(fakeUrl);
            }

            // Clear existing parameters
            this.parameters.clear();

            // Parse query parameters
            urlObject.searchParams.forEach((value, key) => {
                this.parameters.set(key, value);
            });

            this.renderParameters();
            this.updateOutput();
            this.hideError();

        } catch (error) {
            this.showError('Invalid URL format. Please check your URL.');
        }
    }

    addParameter(key = '', value = '') {
        const paramId = Date.now() + Math.random();
        
        if (!key && !value) {
            // Add to parameters map
            this.parameters.set('', '');
        } else {
            this.parameters.set(key, value);
        }

        this.renderParameters();
        this.updateOutput();

        // Focus on the new parameter key input
        setTimeout(() => {
            const newInputs = this.parametersContainer.querySelectorAll('.param-input');
            if (newInputs.length > 0) {
                newInputs[newInputs.length - 2].focus(); // Focus on key input
            }
        }, 100);
    }

    removeParameter(key) {
        this.parameters.delete(key);
        this.renderParameters();
        this.updateOutput();
    }

    updateParameter(oldKey, newKey, newValue) {
        // If key changed, remove old and add new
        if (oldKey !== newKey) {
            this.parameters.delete(oldKey);
        }
        
        // Update or add the parameter
        this.parameters.set(newKey, newValue);
        this.updateOutput();
    }

    renderParameters() {
        if (this.parameters.size === 0) {
            this.parametersContainer.innerHTML = `
                <div class="empty-state">
                    No parameters found. Enter a URL or add parameters manually.
                </div>
            `;
            return;
        }

        let html = '';
        let index = 0;
        
        this.parameters.forEach((value, key) => {
            html += `
                <div class="table-row" data-key="${this.escapeHtml(key)}" data-index="${index}">
                    <input 
                        type="text" 
                        class="param-input param-key" 
                        value="${this.escapeHtml(key)}" 
                        placeholder="Parameter key"
                        data-original-key="${this.escapeHtml(key)}"
                    >
                    <input 
                        type="text" 
                        class="param-input param-value" 
                        value="${this.escapeHtml(value)}" 
                        placeholder="Parameter value"
                    >
                    <div class="param-actions">
                        <button class="remove-btn" onclick="urlEditor.removeParameter('${this.escapeHtml(key)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            index++;
        });

        this.parametersContainer.innerHTML = html;

        // Add event listeners to the new inputs
        this.addParameterInputListeners();
    }

    addParameterInputListeners() {
        const rows = this.parametersContainer.querySelectorAll('.table-row');
        
        rows.forEach(row => {
            const keyInput = row.querySelector('.param-key');
            const valueInput = row.querySelector('.param-value');
            
            const updateParam = () => {
                const originalKey = keyInput.dataset.originalKey;
                const newKey = keyInput.value;
                const newValue = valueInput.value;
                
                this.updateParameter(originalKey, newKey, newValue);
                keyInput.dataset.originalKey = newKey;
            };

            keyInput.addEventListener('input', updateParam);
            valueInput.addEventListener('input', updateParam);
            
            // Update on blur to ensure consistency
            keyInput.addEventListener('blur', () => {
                this.renderParameters();
            });
        });
    }

    updateOutput() {
        let outputURL = this.baseUrl;
        
        if (this.parameters.size > 0) {
            const params = new URLSearchParams();
            
            this.parameters.forEach((value, key) => {
                if (key) { // Only add non-empty keys
                    params.append(key, value);
                }
            });
            
            const queryString = params.toString();
            if (queryString) {
                outputURL += '?' + queryString;
            }
        }

        this.outputUrl.textContent = outputURL || 'Enter a URL or add parameters to see the result here.';
        
        // Show/hide copy button
        if (outputURL && outputURL !== this.baseUrl) {
            this.copyBtn.style.display = 'flex';
        } else {
            this.copyBtn.style.display = 'none';
        }
    }

    copyURL() {
        const url = this.outputUrl.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                this.showCopySuccess();
            }).catch(() => {
                this.fallbackCopy(url);
            });
        } else {
            this.fallbackCopy(url);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            this.showError('Failed to copy URL');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    showCopySuccess() {
        const originalText = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        this.copyBtn.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            this.copyBtn.innerHTML = originalText;
            this.copyBtn.style.background = 'var(--primary-color)';
        }, 2000);
    }

    showError(message) {
        // Remove existing error if any
        this.hideError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: var(--error-color);
            padding: 1rem;
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        `;
        
        this.urlInput.parentNode.insertBefore(errorDiv, this.urlInput.parentNode.firstChild);
    }

    hideError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Utility functions for demo and examples
const URLEditorUtils = {
    loadExample(exampleUrl) {
        urlEditor.urlInput.value = exampleUrl;
        urlEditor.parseURL();
    },

    clearAll() {
        urlEditor.parameters.clear();
        urlEditor.baseUrl = '';
        urlEditor.urlInput.value = '';
        urlEditor.renderParameters();
        urlEditor.updateOutput();
        urlEditor.hideError();
    },

    addCommonParameters() {
        const commonParams = [
            ['utm_source', 'google'],
            ['utm_medium', 'cpc'],
            ['utm_campaign', 'summer_sale'],
            ['ref', 'homepage']
        ];

        commonParams.forEach(([key, value]) => {
            urlEditor.addParameter(key, value);
        });
    }
};

// Initialize the URL Query Editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.urlEditor = new URLQueryEditor();
});

// Add some example URLs and quick actions
document.addEventListener('DOMContentLoaded', () => {
    // Add example buttons if needed
    const examples = [
        {
            name: 'E-commerce Search',
            url: 'https://shop.example.com/search?q=laptop&category=electronics&brand=apple&min_price=500&max_price=2000&sort=price_asc'
        },
        {
            name: 'Social Media Share',
            url: 'https://social.example.com/share?url=https://example.com&title=Check this out&hashtags=awesome,cool'
        },
        {
            name: 'Analytics Tracking',
            url: 'https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_content=ad1&gclid=abc123'
        }
    ];

    // You can add example buttons here if desired
    // This is just the core functionality
});