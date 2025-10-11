document.addEventListener('DOMContentLoaded', function() {
    // --- 1. GET UI ELEMENTS ---
    const textInput = document.getElementById('text-input');
    const resultDisplay = document.getElementById('result-display');
    
    // Auto-focus on the main input field as recommended
    textInput.focus();

    // --- 2. DEBOUNCING SETUP ---
    // This prevents the analysis function from running on every single keystroke, improving performance.
    let debounceTimeout;
    textInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(analyzeText, 150); // Wait 150ms after user stops typing
    });

    // --- 3. ANALYSIS FUNCTION ---
    function analyzeText() {
        const text = textInput.value;

        // If input is empty, clear the result and exit
        if (text.trim() === '') {
            resultDisplay.textContent = '';
            resultDisplay.className = ''; // Clear any color classes
            return;
        }

        // Logic to check the case
        const hasLetters = /[a-zA-Z]/.test(text);
        const isUpperCase = text === text.toUpperCase();
        const isLowerCase = text === text.toLowerCase();

        // Check for mixed case first
        if (!isUpperCase && !isLowerCase && hasLetters) {
            resultDisplay.textContent = 'Mixed Case';
            resultDisplay.className = 'mixedcase';
        } else if (isUpperCase && hasLetters) {
            resultDisplay.textContent = 'UPPERCASE';
            resultDisplay.className = 'uppercase';
        } else if (isLowerCase && hasLetters) {
            resultDisplay.textContent = 'lowercase';
            resultDisplay.className = 'lowercase';
        } else {
            // Handles cases with only numbers/symbols
            resultDisplay.textContent = 'Mixed Case';
            resultDisplay.className = 'mixedcase';
        }
    }
});