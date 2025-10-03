// Enhanced Word Counter with Advanced Analytics
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');

    // Main stats elements
    const wordCountSpan = document.getElementById('word-count');
    const charCountSpan = document.getElementById('char-count');
    const charNoSpacesSpan = document.getElementById('char-no-spaces');
    const paragraphCountSpan = document.getElementById('paragraph-count');

    // Advanced stats elements
    const sentenceCountSpan = document.getElementById('sentence-count');
    const avgWordsSentenceSpan = document.getElementById('avg-words-sentence');
    const readingTimeSpan = document.getElementById('reading-time');
    const longestWordSpan = document.getElementById('longest-word');

    // Real-time analysis function
    function analyzeText() {
        const text = textInput.value;

        // Basic counts
        const charCount = text.length;
        const charNoSpaces = text.replace(/\s/g, '').length;

        // Word count
        let wordCount = 0;
        if (text.trim() !== '') {
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount = words.length;
        }

        // Paragraph count
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
        const paragraphCount = text.trim() === '' ? 0 : paragraphs.length;

        // Sentence count
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const sentenceCount = sentences.length;

        // Average words per sentence
        const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount * 10) / 10 : 0;

        // Reading time (average 200 words per minute)
        const readingTime = Math.ceil(wordCount / 200);

        // Longest word
        let longestWordLength = 0;
        if (text.trim() !== '') {
            const words = text.match(/\b\w+\b/g) || [];
            longestWordLength = words.reduce((max, word) => Math.max(max, word.length), 0);
        }

        // Update UI with animations
        updateStatWithAnimation(wordCountSpan, wordCount);
        updateStatWithAnimation(charCountSpan, charCount);
        updateStatWithAnimation(charNoSpacesSpan, charNoSpaces);
        updateStatWithAnimation(paragraphCountSpan, paragraphCount);
        updateStatWithAnimation(sentenceCountSpan, sentenceCount);
        updateStatWithAnimation(avgWordsSentenceSpan, avgWordsPerSentence);
        updateStatWithAnimation(readingTimeSpan, readingTime);
        updateStatWithAnimation(longestWordSpan, longestWordLength);
    }

    // Animated counter update
    function updateStatWithAnimation(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;

        if (currentValue !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.style.color = 'var(--primary-color)';

            // Animate the number change
            animateNumber(element, currentValue, newValue, 300);

            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 300);
        }
    }

    // Number animation function
    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = start + (difference * easeOutQuart(progress));
            element.textContent = Math.round(current);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = end;
            }
        }

        requestAnimationFrame(updateNumber);
    }

    // Easing function for smooth animation
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // Add typing sound effect simulation
    function playTypingFeedback() {
        // Visual feedback instead of audio
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.borderColor = 'var(--primary-color)';
                setTimeout(() => {
                    card.style.borderColor = '';
                }, 100);
            }, index * 20);
        });
    }

    // Debounced analysis for better performance
    let analysisTimeout;
    function debouncedAnalysis() {
        clearTimeout(analysisTimeout);
        analysisTimeout = setTimeout(() => {
            analyzeText();
            playTypingFeedback();
        }, 150);
    }

    // Event listeners
    textInput.addEventListener('input', debouncedAnalysis);
    textInput.addEventListener('paste', () => {
        setTimeout(analyzeText, 10); // Small delay for paste to complete
    });

    // Auto-focus on load
    textInput.focus();

    // Add keyboard shortcuts
    textInput.addEventListener('keydown', function(e) {
        // Ctrl+A to select all
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            textInput.select();
        }

        // Ctrl+Shift+C to clear text
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            if (confirm('Clear all text?')) {
                textInput.value = '';
                analyzeText();
            }
        }
    });

    // Add word highlighting on double-click
    textInput.addEventListener('dblclick', function(e) {
        const selection = window.getSelection();
        if (selection.toString().trim()) {
            // Highlight the selected word temporarily
            const selectedText = selection.toString();
            // Selected word captured for potential future features

            // You could add more functionality here like word definition lookup
        }
    });

    // Character limit warning
    const maxChars = 10000;
    textInput.addEventListener('input', function() {
        const currentLength = textInput.value.length;

        if (currentLength > maxChars * 0.9) {
            const charCountElement = document.getElementById('char-count');
            charCountElement.style.color = currentLength > maxChars ? 'var(--error-color)' : 'var(--warning-color)';
        } else {
            const charCountElement = document.getElementById('char-count');
            charCountElement.style.color = '';
        }
    });

    // Add sample text for demonstration
    function loadSampleText() {
        const sampleText = `Welcome to the DevToolkit Word Counter!

This is a powerful text analysis tool that provides real-time statistics about your content. As you type or paste text, you'll see instant updates for word count, character count, paragraphs, and much more.

Features include:
- Real-time word and character counting
- Paragraph and sentence analysis
- Reading time estimation
- Advanced text statistics
- Responsive design that works on all devices

Try typing or pasting your own text to see the magic happen! This tool is perfect for writers, students, content creators, and anyone who needs to analyze text content quickly and efficiently.`;

        textInput.value = sampleText;
        analyzeText();
    }

    // Add sample text button (optional)
    const sampleButton = document.createElement('button');
    sampleButton.textContent = 'Load Sample Text';
    sampleButton.className = 'btn btn-secondary';
    sampleButton.style.marginTop = '1rem';
    sampleButton.addEventListener('click', loadSampleText);

    // Add button to the tool header
    const toolHeader = document.querySelector('.tool-header');
    toolHeader.appendChild(sampleButton);

    // Initial analysis
    analyzeText();
});

// Add CSS for enhanced interactions
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .btn-secondary {
        background: transparent;
        color: var(--text-primary);
        border: 2px solid var(--primary-color);
    }

    .btn-secondary:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    #text-input::-webkit-scrollbar {
        width: 8px;
    }

    #text-input::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: 4px;
    }

    #text-input::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 4px;
    }

    #text-input::-webkit-scrollbar-thumb:hover {
        background: var(--accent-color);
    }

    .stat-card {
        cursor: pointer;
    }

    .stat-card:active {
        transform: translateY(-2px) scale(0.98);
    }

    .typing-indicator {
        position: absolute;
        top: 1rem;
        right: 1rem;
        color: var(--primary-color);
        font-size: 0.8rem;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .typing-indicator.active {
        opacity: 1;
    }
`;
document.head.appendChild(enhancedStyle);