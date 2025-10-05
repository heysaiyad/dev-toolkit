// Code Diff Viewer with Advanced Diff Algorithm
class CodeDiffViewer {
    constructor() {
        this.originalCode = '';
        this.modifiedCode = '';
        this.currentLanguage = 'javascript';
        this.diffResult = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleCode();
        this.updateFileButtonStates();
    }

    // Setup event listeners
    setupEventListeners() {
        // Compare button
        document.getElementById('compare-btn').addEventListener('click', () => {
            this.compareCode();
        });

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearAll();
        });

        // Swap button
        document.getElementById('swap-btn').addEventListener('click', () => {
            this.swapCode();
        });

        // Language selector
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
        });

        // File uploads
        document.getElementById('original-file').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'original');
        });

        document.getElementById('modified-file').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'modified');
        });

        // Auto-compare on input change
        document.getElementById('original-code').addEventListener('input', () => {
            this.debounceCompare();
        });

        document.getElementById('modified-code').addEventListener('input', () => {
            this.debounceCompare();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.compareCode();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.clearAll();
                        break;
                    case 's':
                        e.preventDefault();
                        this.swapCode();
                        break;
                }
            }
        });
    }

    // Load sample code
    loadSampleCode() {
        const originalTextarea = document.getElementById('original-code');
        const modifiedTextarea = document.getElementById('modified-code');
        
        // Only load if both are empty
        if (!originalTextarea.value.trim() && !modifiedTextarea.value.trim()) {
            originalTextarea.value = `function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("World");`;

            modifiedTextarea.value = `function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}!\`);
}

greet("World");
greet("Developer", "Hi");`;
        }
    }

    // Debounced comparison
    debounceCompare() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.compareCode();
        }, 500);
    }

    // Main comparison function
    compareCode() {
        this.originalCode = document.getElementById('original-code').value;
        this.modifiedCode = document.getElementById('modified-code').value;

        if (!this.originalCode.trim() && !this.modifiedCode.trim()) {
            this.showEmptyState();
            return;
        }

        try {
            this.diffResult = this.computeDiff(this.originalCode, this.modifiedCode);
            this.renderDiff();
            this.updateStats();
            this.showDiffViewer();
        } catch (error) {
            console.error('Error computing diff:', error);
            this.showError('Error computing differences. Please check your input.');
        }
    }

    // Advanced diff algorithm (Myers' algorithm)
    computeDiff(original, modified) {
        const originalLines = original.split('\n');
        const modifiedLines = modified.split('\n');
        
        const diff = this.myersDiff(originalLines, modifiedLines);
        return this.formatDiff(diff, originalLines, modifiedLines);
    }

    // Myers' diff algorithm implementation
    myersDiff(a, b) {
        const n = a.length;
        const m = b.length;
        const max = n + m;
        const v = new Array(2 * max + 1);
        v[max + 1] = 0;
        
        const trace = [];
        
        for (let d = 0; d <= max; d++) {
            trace.push(v.slice());
            
            for (let k = -d; k <= d; k += 2) {
                let x;
                if (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) {
                    x = v[max + k + 1];
                } else {
                    x = v[max + k - 1] + 1;
                }
                
                let y = x - k;
                
                while (x < n && y < m && a[x] === b[y]) {
                    x++;
                    y++;
                }
                
                v[max + k] = x;
                
                if (x >= n && y >= m) {
                    return this.buildPath(trace, a, b);
                }
            }
        }
        
        return [];
    }

    // Build the edit path from trace
    buildPath(trace, a, b) {
        const path = [];
        let x = a.length;
        let y = b.length;
        
        for (let d = trace.length - 1; d >= 0; d--) {
            const v = trace[d];
            const k = x - y;
            
            let prevK;
            if (k === -d || (k !== d && v[this.getIndex(v, k - 1)] < v[this.getIndex(v, k + 1)])) {
                prevK = k + 1;
            } else {
                prevK = k - 1;
            }
            
            const prevX = v[this.getIndex(v, prevK)];
            const prevY = prevX - prevK;
            
            while (x > prevX && y > prevY) {
                path.unshift({ type: 'equal', oldLine: x - 1, newLine: y - 1 });
                x--;
                y--;
            }
            
            if (d > 0) {
                if (x > prevX) {
                    path.unshift({ type: 'delete', oldLine: x - 1 });
                    x--;
                } else {
                    path.unshift({ type: 'insert', newLine: y - 1 });
                    y--;
                }
            }
        }
        
        return path;
    }

    // Helper function to get array index
    getIndex(v, k) {
        return Math.floor(v.length / 2) + k;
    }

    // Format diff result for display
    formatDiff(diff, originalLines, modifiedLines) {
        const result = {
            original: [],
            modified: [],
            stats: { additions: 0, deletions: 0, changes: 0 }
        };

        let oldLineNum = 0;
        let newLineNum = 0;

        diff.forEach(change => {
            switch (change.type) {
                case 'equal':
                    result.original.push({
                        type: 'unchanged',
                        lineNumber: oldLineNum + 1,
                        content: originalLines[oldLineNum] || '',
                        pair: newLineNum + 1
                    });
                    result.modified.push({
                        type: 'unchanged',
                        lineNumber: newLineNum + 1,
                        content: modifiedLines[newLineNum] || '',
                        pair: oldLineNum + 1
                    });
                    oldLineNum++;
                    newLineNum++;
                    break;
                    
                case 'delete':
                    result.original.push({
                        type: 'removed',
                        lineNumber: oldLineNum + 1,
                        content: originalLines[oldLineNum] || '',
                        pair: null
                    });
                    result.modified.push({
                        type: 'empty',
                        lineNumber: null,
                        content: '',
                        pair: oldLineNum + 1
                    });
                    oldLineNum++;
                    result.stats.deletions++;
                    break;
                    
                case 'insert':
                    result.original.push({
                        type: 'empty',
                        lineNumber: null,
                        content: '',
                        pair: newLineNum + 1
                    });
                    result.modified.push({
                        type: 'added',
                        lineNumber: newLineNum + 1,
                        content: modifiedLines[newLineNum] || '',
                        pair: null
                    });
                    newLineNum++;
                    result.stats.additions++;
                    break;
            }
        });

        // Handle remaining lines
        while (oldLineNum < originalLines.length) {
            result.original.push({
                type: 'removed',
                lineNumber: oldLineNum + 1,
                content: originalLines[oldLineNum] || '',
                pair: null
            });
            result.modified.push({
                type: 'empty',
                lineNumber: null,
                content: '',
                pair: oldLineNum + 1
            });
            oldLineNum++;
            result.stats.deletions++;
        }

        while (newLineNum < modifiedLines.length) {
            result.original.push({
                type: 'empty',
                lineNumber: null,
                content: '',
                pair: newLineNum + 1
            });
            result.modified.push({
                type: 'added',
                lineNumber: newLineNum + 1,
                content: modifiedLines[newLineNum] || '',
                pair: null
            });
            newLineNum++;
            result.stats.additions++;
        }

        return result;
    }

    // Render the diff view
    renderDiff() {
        if (!this.diffResult) return;

        const originalContent = document.getElementById('original-diff-content');
        const modifiedContent = document.getElementById('modified-diff-content');

        originalContent.innerHTML = this.renderDiffPane(this.diffResult.original);
        modifiedContent.innerHTML = this.renderDiffPane(this.diffResult.modified);
    }

    // Render individual diff pane
    renderDiffPane(lines) {
        return lines.map(line => {
            const lineNumber = line.lineNumber ? line.lineNumber.toString().padStart(3, ' ') : '';
            const content = this.escapeHtml(line.content);
            
            return `
                <div class="diff-line ${line.type}">
                    <div class="diff-line-number">${lineNumber}</div>
                    <div class="diff-line-content">${content}</div>
                </div>
            `;
        }).join('');
    }

    // Update statistics
    updateStats() {
        if (!this.diffResult) return;

        document.getElementById('additions-count').textContent = this.diffResult.stats.additions;
        document.getElementById('deletions-count').textContent = this.diffResult.stats.deletions;
        document.getElementById('changes-count').textContent = this.diffResult.stats.additions + this.diffResult.stats.deletions;
    }

    // Show diff viewer
    showDiffViewer() {
        document.getElementById('diff-viewer').style.display = 'block';
        document.getElementById('empty-state').style.display = 'none';
    }

    // Show empty state
    showEmptyState() {
        document.getElementById('diff-viewer').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
    }

    // Handle file upload
    async handleFileUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await this.readFileContent(file);
            const textarea = document.getElementById(`${type}-code`);
            const button = document.getElementById(`${type}-file-button`);
            
            textarea.value = content;
            button.classList.add('has-file');
            button.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${file.name}</span>
            `;
            
            // Auto-compare after file upload
            this.compareCode();
            this.showSuccess(`File "${file.name}" uploaded successfully!`);
        } catch (error) {
            console.error('Error reading file:', error);
            this.showError('Error reading file. Please try again.');
        }
    }

    // Read file content
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Update file button states
    updateFileButtonStates() {
        const originalFile = document.getElementById('original-file');
        const modifiedFile = document.getElementById('modified-file');
        
        originalFile.addEventListener('change', () => {
            const button = document.getElementById('original-file-button');
            if (originalFile.files.length > 0) {
                button.classList.add('has-file');
                button.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${originalFile.files[0].name}</span>
                `;
            } else {
                button.classList.remove('has-file');
                button.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Choose Original File</span>
                `;
            }
        });

        modifiedFile.addEventListener('change', () => {
            const button = document.getElementById('modified-file-button');
            if (modifiedFile.files.length > 0) {
                button.classList.add('has-file');
                button.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${modifiedFile.files[0].name}</span>
                `;
            } else {
                button.classList.remove('has-file');
                button.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Choose Modified File</span>
                `;
            }
        });
    }

    // Clear all content
    clearAll() {
        document.getElementById('original-code').value = '';
        document.getElementById('modified-code').value = '';
        document.getElementById('original-file').value = '';
        document.getElementById('modified-file').value = '';
        
        // Reset file buttons
        document.getElementById('original-file-button').classList.remove('has-file');
        document.getElementById('original-file-button').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Choose Original File</span>
        `;
        
        document.getElementById('modified-file-button').classList.remove('has-file');
        document.getElementById('modified-file-button').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Choose Modified File</span>
        `;
        
        this.showEmptyState();
        this.showInfo('All content cleared.');
    }

    // Swap code between sides
    swapCode() {
        const originalCode = document.getElementById('original-code').value;
        const modifiedCode = document.getElementById('modified-code').value;
        
        document.getElementById('original-code').value = modifiedCode;
        document.getElementById('modified-code').value = originalCode;
        
        // Swap files if they exist
        const originalFile = document.getElementById('original-file').files[0];
        const modifiedFile = document.getElementById('modified-file').files[0];
        
        if (originalFile || modifiedFile) {
            // Create new FileList-like objects
            const originalInput = document.getElementById('original-file');
            const modifiedInput = document.getElementById('modified-file');
            
            // Note: FileList is read-only, so we can't actually swap files
            // We'll just swap the content and reset the file inputs
            originalInput.value = '';
            modifiedInput.value = '';
            
            // Reset file buttons
            document.getElementById('original-file-button').classList.remove('has-file');
            document.getElementById('original-file-button').innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Choose Original File</span>
            `;
            
            document.getElementById('modified-file-button').classList.remove('has-file');
            document.getElementById('modified-file-button').innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Choose Modified File</span>
            `;
        }
        
        // Auto-compare after swap
        this.compareCode();
        this.showInfo('Code sides swapped.');
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Notification methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        }[type];

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        // Add notification styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    background: var(--bg-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    padding: 1rem 1.5rem;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 10001;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    backdrop-filter: blur(20px);
                    max-width: 400px;
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-success {
                    border-color: var(--success-color);
                    color: var(--success-color);
                }
                .notification-error {
                    border-color: var(--error-color);
                    color: var(--error-color);
                }
                .notification-warning {
                    border-color: var(--warning-color);
                    color: var(--warning-color);
                }
                .notification-info {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the Code Diff Viewer when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const diffViewer = new CodeDiffViewer();
    
    // Auto-focus on the first textarea
    document.getElementById('original-code').focus();
    
    // Auto-compare on page load with sample data
    setTimeout(() => {
        diffViewer.compareCode();
    }, 500);
});
