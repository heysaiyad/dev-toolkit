document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const textInput = document.getElementById('text-input');
    const textOutput = document.getElementById('text-output');
    const trimBtn = document.getElementById('trim-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // Options checkboxes
    const trimLinesCheckbox = document.getElementById('trim-lines');
    const normalizeSpacesCheckbox = document.getElementById('normalize-spaces');
    const trimEachLineCheckbox = document.getElementById('trim-each-line');
    const removeEmptyLinesCheckbox = document.getElementById('remove-empty-lines');
    
    // Stats elements
    const originalCharsEl = document.getElementById('original-chars');
    const trimmedCharsEl = document.getElementById('trimmed-chars');
    const charsRemovedEl = document.getElementById('chars-removed');
    const reductionPercentageEl = document.getElementById('reduction-percentage');

    // Auto-focus on input
    if (textInput) textInput.focus();

    // Main trim function
    function trimText() {
        let text = textInput.value;
        const originalLength = text.length;
        
        if (text.trim() === '') {
            textOutput.value = '';
            updateStats(0, 0, 0);
            return;
        }

        let processedText = text;

        // Apply trimming options based on checkboxes
        if (trimLinesCheckbox.checked) {
            processedText = processedText.trim();
        }

        if (trimEachLineCheckbox.checked) {
            processedText = processedText
                .split('\n')
                .map(line => line.trim())
                .join('\n');
        }

        if (normalizeSpacesCheckbox.checked) {
            // Replace multiple consecutive spaces with single spaces
            processedText = processedText.replace(/[ \t]+/g, ' ');
        }

        if (removeEmptyLinesCheckbox.checked) {
            processedText = processedText
                .split('\n')
                .filter(line => line.trim() !== '')
                .join('\n');
        }

        // Update output
        textOutput.value = processedText;
        
        // Update stats
        const trimmedLength = processedText.length;
        const charsRemoved = originalLength - trimmedLength;
        updateStats(originalLength, trimmedLength, charsRemoved);

        // Add success animation to trim button
        trimBtn.classList.add('success');
        setTimeout(() => {
            trimBtn.classList.remove('success');
        }, 300);
    }

    // Update statistics
    function updateStats(original, trimmed, removed) {
        const reduction = original > 0 ? ((removed / original) * 100).toFixed(1) : 0;
        
        animateValue(originalCharsEl, parseInt(originalCharsEl.textContent) || 0, original, 300);
        animateValue(trimmedCharsEl, parseInt(trimmedCharsEl.textContent) || 0, trimmed, 300);
        animateValue(charsRemovedEl, parseInt(charsRemovedEl.textContent) || 0, removed, 300);
        
        // Animate percentage separately
        const currentPercentage = parseFloat(reductionPercentageEl.textContent) || 0;
        animatePercentage(reductionPercentageEl, currentPercentage, reduction, 300);
    }

    // Animate number values
    function animateValue(element, start, end, duration) {
        const startTime = performance.now();

        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = start + (end - start) * progress;
            element.textContent = Math.round(current);

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }

        requestAnimationFrame(updateValue);
    }

    // Animate percentage values
    function animatePercentage(element, start, end, duration) {
        const startTime = performance.now();

        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = start + (end - start) * progress;
            element.textContent = current.toFixed(1) + '%';

            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }

        requestAnimationFrame(updateValue);
    }

    // Copy to clipboard function
    function copyToClipboard() {
        if (textOutput.value.trim() === '') {
            showFeedback(copyBtn, 'Nothing to copy!', false);
            return;
        }

        textOutput.select();
        textOutput.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            showFeedback(copyBtn, 'Copied!', true);
        } catch (err) {
            // Fallback to newer Clipboard API
            navigator.clipboard.writeText(textOutput.value).then(() => {
                showFeedback(copyBtn, 'Copied!', true);
            }).catch(() => {
                showFeedback(copyBtn, 'Copy failed!', false);
            });
        }
    }

    // Clear all text
    function clearAll() {
        textInput.value = '';
        textOutput.value = '';
        updateStats(0, 0, 0);
        textInput.focus();
        
        showFeedback(clearBtn, 'Cleared!', true);
    }

    // Show feedback on buttons
    function showFeedback(button, message, success) {
        const originalHTML = button.innerHTML;
        const originalClass = button.className;

        if (success) {
            button.classList.add('success');
            button.innerHTML = '<i class="fas fa-check"></i> ' + message;
        } else {
            button.innerHTML = '<i class="fas fa-times"></i> ' + message;
        }

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.className = originalClass;
        }, 2000);
    }

    // Real-time trimming as user types (with debouncing)
    let trimTimeout;
    function debouncedTrim() {
        clearTimeout(trimTimeout);
        trimTimeout = setTimeout(() => {
            if (textInput.value.trim() !== '') {
                trimText();
            } else {
                textOutput.value = '';
                updateStats(0, 0, 0);
            }
        }, 300);
    }

    // Event listeners
    trimBtn.addEventListener('click', trimText);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);
    
    // Real-time processing
    textInput.addEventListener('input', debouncedTrim);
    
    // Option changes trigger re-processing
    trimLinesCheckbox.addEventListener('change', () => {
        if (textInput.value.trim() !== '') {
            trimText();
        }
    });
    
    normalizeSpacesCheckbox.addEventListener('change', () => {
        if (textInput.value.trim() !== '') {
            trimText();
        }
    });
    
    trimEachLineCheckbox.addEventListener('change', () => {
        if (textInput.value.trim() !== '') {
            trimText();
        }
    });
    
    removeEmptyLinesCheckbox.addEventListener('change', () => {
        if (textInput.value.trim() !== '') {
            trimText();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to trim
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            trimText();
        }
        
        // Ctrl/Cmd + Shift + C to copy
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyToClipboard();
        }
        
        // Ctrl/Cmd + Shift + X to clear
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
            e.preventDefault();
            clearAll();
        }
    });

    // Load sample text functionality
    function loadSampleText() {
        const sampleText = `   
        Welcome to the Text Trimmer tool!   

        This    is    a    sample    text    with    various    whitespace    issues.
        
            • Leading spaces on this line
    Trailing spaces on this line        
        
        
        Multiple empty lines above and below
        
        
            Mixed    spacing    and    tabs	here
        
    Final line with trailing spaces    
        `;
        
        textInput.value = sampleText;
        trimText();
        showFeedback(sampleButton, 'Sample loaded!', true);
    }

    // Add sample text button
    const sampleButton = document.createElement('button');
    sampleButton.innerHTML = '<i class="fas fa-file-text"></i> Load Sample';
    sampleButton.className = 'btn btn-secondary';
    sampleButton.style.marginTop = '1rem';
    sampleButton.addEventListener('click', loadSampleText);

    // Add button to the tool header
    const toolHeader = document.querySelector('.tool-header');
    toolHeader.appendChild(sampleButton);

    // Initial stats update
    updateStats(0, 0, 0);
});

// Add CSS for enhanced interactions
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.5s ease;
    }

    .btn:active::before {
        width: 300px;
        height: 300px;
    }

    .success {
        animation: successPulse 0.3s ease;
    }

    /* Tooltip styles */
    .btn[title]:hover::after {
        content: attr(title);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-dark);
        color: var(--text-primary);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        white-space: nowrap;
        z-index: 1000;
        margin-bottom: 0.5rem;
    }
`;
document.head.appendChild(enhancedStyle);