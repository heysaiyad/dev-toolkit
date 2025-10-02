document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');
    const outputText = document.getElementById('output-text');
    const copyBtn = document.getElementById('copy-btn');
    const caseButtons = document.querySelectorAll('.case-btn');
    
    // Stats elements
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');
    const spaceCount = document.getElementById('space-count');

    // Auto-focus on input
    textInput.focus();

    // Case conversion functions
    const caseConverters = {
        uppercase: (text) => text.toUpperCase(),
        lowercase: (text) => text.toLowerCase(),
        titlecase: (text) => {
            return text.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },
        camelcase: (text) => {
            return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        },
        pascalcase: (text) => {
            return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
                return word.toUpperCase();
            }).replace(/\s+/g, '');
        },
        snakecase: (text) => {
            return text.replace(/\W+/g, ' ')
                .split(/ |\B(?=[A-Z])/)
                .map(word => word.toLowerCase())
                .join('_');
        },
        kebabcase: (text) => {
            return text.replace(/\W+/g, ' ')
                .split(/ |\B(?=[A-Z])/)
                .map(word => word.toLowerCase())
                .join('-');
        },
        constantcase: (text) => {
            return text.replace(/\W+/g, ' ')
                .split(/ |\B(?=[A-Z])/)
                .map(word => word.toUpperCase())
                .join('_');
        }
    };

    // Update stats
    function updateStats(text) {
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text.split('\n').length;
        const spaces = (text.match(/\s/g) || []).length;

        // Animate numbers
        animateValue(charCount, parseInt(charCount.textContent) || 0, chars, 500);
        animateValue(wordCount, parseInt(wordCount.textContent) || 0, words, 500);
        animateValue(lineCount, parseInt(lineCount.textContent) || 0, lines, 500);
        animateValue(spaceCount, parseInt(spaceCount.textContent) || 0, spaces, 500);
    }

    // Animate number changes
    function animateValue(element, start, end, duration) {
        const startTime = performance.now();

        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (end - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }

        requestAnimationFrame(updateValue);
    }

    // Convert text to specified case
    function convertText(caseType) {
        const text = textInput.value;
        if (!text.trim()) {
            outputText.textContent = 'Your converted text will appear here...';
            updateStats('');
            return;
        }

        const convertedText = caseConverters[caseType](text);
        outputText.textContent = convertedText;
        updateStats(convertedText);
    }

    // Handle case button clicks
    caseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const caseType = this.dataset.case;
            
            // Remove active class from all buttons
            caseButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Convert text
            convertText(caseType);
        });
    });

    // Handle input changes with debouncing
    let conversionTimeout;
    textInput.addEventListener('input', function() {
        clearTimeout(conversionTimeout);
        conversionTimeout = setTimeout(() => {
            const activeButton = document.querySelector('.case-btn.active');
            if (activeButton) {
                convertText(activeButton.dataset.case);
            } else {
                // If no case is selected, just update stats
                updateStats(this.value);
                outputText.textContent = 'Select a case type to convert your text...';
            }
        }, 150);
    });

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', function() {
        const textToCopy = outputText.textContent;
        
        if (textToCopy === 'Your converted text will appear here...' || 
            textToCopy === 'Select a case type to convert your text...') {
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            this.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Visual feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            this.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.background = '';
            }, 2000);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            copyBtn.click();
        }
        
        // Ctrl/Cmd + A to select all in input
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target === textInput) {
            // Allow default behavior
            return;
        }
    });

    // Initialize with empty stats
    updateStats('');
});
