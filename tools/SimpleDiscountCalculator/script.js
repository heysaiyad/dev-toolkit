document.addEventListener('DOMContentLoaded', function() {
    const originalInput = document.getElementById('original-price');
    const discountInput = document.getElementById('discount-percent');
    const calculateBtn = document.getElementById('calculate-btn');
    const results = document.getElementById('results');
    const amountSavedEl = document.getElementById('amount-saved');
    const finalPriceEl = document.getElementById('final-price');

    originalInput.focus();

    calculateBtn.addEventListener('click', () => {
        const original = parseFloat(originalInput.value);
        const discount = parseFloat(discountInput.value);

        if (isNaN(original) || isNaN(discount) || original < 0 || discount < 0 || discount > 100) {
            alert("Please enter valid values. Discount must be between 0 and 100.");
            return;
        }

        const saved = original * (discount / 100);
        const final = original - saved;

        animateValue(amountSavedEl, 0, saved, 800);
        animateValue(finalPriceEl, 0, final, 800);
        results.style.display = "flex";
    });

    function animateValue(element, start, end, duration) {
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = start + (end - start) * progress;
            element.textContent = `₹${value.toFixed(2)}`;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
});
