// Auto-focus on input when page loads
document.addEventListener('DOMContentLoaded', function() {
    const numberInput = document.getElementById('numberInput');
    if (numberInput) {
        numberInput.focus();
    }
    
    // Add Enter key support
    numberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculate();
        }
    });
});

function calculate() {
    const numberInput = document.getElementById('numberInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const squareResult = document.getElementById('squareResult');
    const cubeResult = document.getElementById('cubeResult');
    const squareFormula = document.getElementById('squareFormula');
    const cubeFormula = document.getElementById('cubeFormula');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Hide previous messages and results
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    resultsContainer.style.display = 'none';
    
    const inputValue = numberInput.value.trim();
    
    // Check if input is empty
    if (inputValue === '') {
        showError('Please enter a number');
        return;
    }
    
    // Convert to number and validate
    const number = parseFloat(inputValue);
    
    if (isNaN(number)) {
        showError('Please enter a valid number');
        return;
    }
    
    // Check for very large numbers that might cause issues
    if (Math.abs(number) > 1e15) {
        showError('Number is too large. Please enter a smaller number.');
        return;
    }
    
    // Calculate square and cube
    const square = number * number;
    const cube = number * number * number;
    
    // Update results with animation
    animateValue(squareResult, 0, square, 1000);
    animateValue(cubeResult, 0, cube, 1000);
    
    // Update formulas
    squareFormula.textContent = `${number}² = ${formatNumber(square)}`;
    cubeFormula.textContent = `${number}³ = ${formatNumber(cube)}`;
    
    // Show results
    resultsContainer.style.display = 'grid';
    showSuccess(`Calculated square and cube for ${formatNumber(number)}`);
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const current = start + (end - start) * easeOutQuart;
        element.textContent = formatNumber(Math.round(current * 1000000) / 1000000);
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function formatNumber(num) {
    // Handle very large or very small numbers with scientific notation
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
    }
    
    // Format with appropriate decimal places
    if (num % 1 === 0) {
        // Integer
        return num.toLocaleString();
    } else {
        // Decimal - limit to 6 decimal places
        const formatted = num.toFixed(6);
        return parseFloat(formatted).toString();
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    errorMessage.classList.add('show');
}

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successMessage.classList.add('show');
}

// Additional utility functions for enhanced functionality
function clearResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    resultsContainer.style.display = 'none';
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    
    document.getElementById('numberInput').focus();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        clearResults();
    }
});
