document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const numberInput = document.getElementById('numberInput');
    const checkBtn = document.getElementById('checkBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const resultExplanation = document.getElementById('resultExplanation');
    const errorContainer = document.getElementById('error');

    const checkNumber = () => {
        const inputValue = numberInput.value.trim();

        // Hide previous results and errors
        resultContainer.classList.add('hidden');
        errorContainer.style.display = 'none';

        // --- Validation ---
        if (inputValue === '') {
            showError('Please enter a number.');
            return;
        }

        const number = Number(inputValue);
        if (isNaN(number)) {
            showError('Invalid input. Please enter a valid number.');
            return;
        }
        
        // Check if the number is a whole number (integer)
        if (!Number.isInteger(number)) {
            showError('This tool only works with whole numbers (integers).');
            return;
        }

        // --- Logic ---
        // Use the modulo operator (%) to check for a remainder
        if (number % 2 === 0) {
            displayResult('Even', 'fa-check-circle', 'This number is divisible by 2 with no remainder.', 'even');
        } else {
            displayResult('Odd', 'fa-times-circle', 'This number leaves a remainder of 1 when divided by 2.', 'odd');
        }
    };

    const displayResult = (type, icon, explanation, resultClass) => {
        resultText.textContent = type;
        resultIcon.className = `fas ${icon} result-icon`;
        resultExplanation.textContent = explanation;

        // Apply result-specific class for styling
        resultContainer.className = 'result-container'; // Reset classes first
        resultContainer.classList.add(resultClass);
        
        resultContainer.classList.remove('hidden');
    };
    
    const showError = (message) => {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    };

    // --- Event Listeners ---
    checkBtn.addEventListener('click', checkNumber);

    numberInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkNumber();
        }
    });
});