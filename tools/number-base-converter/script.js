document.addEventListener('DOMContentLoaded', function () {
    // Auto-focus on input
    const mainInput = document.getElementById('input-number');
    if (mainInput) {
        mainInput.focus();
    }

    // Conversion function
    function convertBase() {
        const number = document.getElementById("input-number").value.trim();
        const fromBase = document.getElementById("from-base").value;
        const toBase = document.getElementById("to-base").value;
        const resultBox = document.querySelector(".result-value");

        const bases = {
            decimal: 10,
            binary: 2,
            octal: 8,
            hexadecimal: 16
        };

        try {
            const decimalValue = parseInt(number, bases[fromBase]);
            if (isNaN(decimalValue)) throw new Error("Invalid number");

            let result;
            if (toBase === "decimal") result = decimalValue.toString(10);
            if (toBase === "binary") result = decimalValue.toString(2);
            if (toBase === "octal") result = decimalValue.toString(8);
            if (toBase === "hexadecimal") result = decimalValue.toString(16).toUpperCase();

            resultBox.textContent = result;
        } catch (e) {
            resultBox.textContent = "❌ Invalid Input!";
        }
    }

    // Attach event listener to button
    const convertBtn = document.querySelector(".convert-btn");
    if (convertBtn) {
        convertBtn.addEventListener("click", convertBase);
    }
});
