document.addEventListener('DOMContentLoaded', function() {
    const numberInput = document.getElementById('numberInput');
    const result = document.getElementById('result');

    if (!numberInput || !result) {
        console.error('Required elements not found');
        return;
    }

    // Auto-focus on input
    numberInput.focus();

    // Add Enter key support
    numberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkNumber();
        }
    });

    numberInput.addEventListener('input', checkNumber);

    function checkNumber() {
        const value = numberInput.value.trim();
        
        if (value === "") {
            result.textContent = "";
            result.className = "result";
            return;
        }
        
        if (isNaN(value)) {
            result.textContent = "❌ Please enter a valid number";
            result.className = "result error";
            return;
        }
        
        const num = parseFloat(value);
        
        if (!Number.isInteger(num)) {
            result.textContent = "❌ Please enter an integer (whole number)";
            result.className = "result error";
            return;
        }
        
        const isEven = num % 2 === 0;
        result.textContent = `✅ ${num} is ${isEven ? 'Even' : 'Odd'}`;
        result.className = `result ${isEven ? 'even' : 'odd'}`;
    }
});
