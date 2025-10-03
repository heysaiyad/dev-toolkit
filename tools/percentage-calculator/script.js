// Auto-focus on first input when page loads
document.addEventListener('DOMContentLoaded', function() {
    const percentageInput = document.getElementById('percentage');
    if (percentageInput) {
        percentageInput.focus();
    }
    
    // Add Enter key support for both inputs
    percentageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('number').focus();
        }
    });
    
    document.getElementById('number').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculatePercentage();
        }
    });
});

function calculatePercentage() {
    const percentage = document.getElementById('percentage').value;
    const number = document.getElementById('number').value;
    const resultDiv = document.getElementById('result');
    
    if (percentage === '' || number === '') {
        resultDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter both values';
        resultDiv.classList.remove('show');
        return;
    }

    // Validate numeric inputs
    if (isNaN(percentage) || isNaN(number)) {
        resultDiv.innerHTML = '<i class="fas fa-times-circle"></i> Please enter valid numbers';
        resultDiv.classList.remove('show');
        return;
    }

    const result = (parseFloat(percentage) * parseFloat(number)) / 100;
    resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> Result: <strong>${result}</strong>`;
    resultDiv.classList.add('show');
}