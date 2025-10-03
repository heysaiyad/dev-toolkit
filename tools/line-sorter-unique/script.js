// Get DOM elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const processBtn = document.getElementById('processBtn');
const sortLinesCheck = document.getElementById('sortLines');
const uniqueLinesCheck = document.getElementById('uniqueLines');

// Process text function
function processText() {
    // Validate input
    if (!inputText.value.trim()) {
        outputText.value = '';
        return;
    }

    // Get options
    const sort = sortLinesCheck.checked;
    const unique = uniqueLinesCheck.checked;

    // Split input into lines and filter out empty lines
    let lines = inputText.value.split(/\r?\n/).filter(line => line.trim());

    // Process according to options
    if (unique) {
        lines = Array.from(new Set(lines));
    }
    if (sort) {
        lines = lines.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    }

    // Update output
    outputText.value = lines.join('\n');

    // Visual feedback
    processBtn.classList.add('processing');
    setTimeout(() => {
        processBtn.classList.remove('processing');
    }, 500);
}

// Add click handler for process button
processBtn.addEventListener('click', processText);

// Add keyboard shortcut (Ctrl/Cmd + Enter)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        processText();
    }
});

// Copy output to clipboard
document.getElementById('outputText').addEventListener('click', async function() {
    if (!this.value) return;
    
    try {
        await navigator.clipboard.writeText(this.value);
        const originalValue = this.value;
        this.value = '✓ Copied to clipboard!';
        setTimeout(() => {
            this.value = originalValue;
        }, 1000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
});
