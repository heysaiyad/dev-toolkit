document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const numberInput = document.getElementById('numberInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsContainer = document.getElementById('results');
    const squareResult = document.getElementById('squareResult');
    const cubeResult = document.getElementById('cubeResult');
    const errorContainer = document.getElementById('error');

    // Animate the number rolling up
    const animateCountUp = (element, endValue) => {
        const duration = 1500;
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * endValue);
            
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = endValue.toLocaleString();
            }
        };
        requestAnimationFrame(step);
    };

    // Main calculate function
    const calculate = () => {
        const inputValue = numberInput.value.trim();

        // Hide previous results and errors
        resultsContainer.classList.add('hidden');
        errorContainer.classList.remove('show');

        // Input validation
        if (inputValue === '' || isNaN(inputValue)) {
            errorContainer.classList.add('show');
            return;
        }

        const number = Number(inputValue);
        const square = number * number;
        const cube = number * number * number;
        
        // Show results and start animation
        resultsContainer.classList.remove('hidden');
        animateCountUp(squareResult, square);
        animateCountUp(cubeResult, cube);
    };

    // Event listeners
    calculateBtn.addEventListener('click', calculate);
    numberInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            calculate();
        }
    });
});