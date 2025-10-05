document.addEventListener('DOMContentLoaded', () => {
    const pxInput = document.getElementById('pxValue');
    const baseInput = document.getElementById('baseValue');
    const convertBtn = document.getElementById('convertBtn');
    const remResult = document.getElementById('remResult');
    const emResult = document.getElementById('emResult');

    function convert() {
        const pxValue = parseFloat(pxInput.value);
        const baseValue = parseFloat(baseInput.value) || 16;

        if (isNaN(pxValue)) {
            remResult.textContent = 'REM: Please enter a valid number';
            emResult.textContent = 'EM: Please enter a valid number';
            return;
        }

        const remValue = (pxValue / baseValue).toFixed(4);
        const emValue = (pxValue / baseValue).toFixed(4);

        remResult.textContent = `REM: ${remValue}rem`;
        emResult.textContent = `EM: ${emValue}em`;
    }

    // Event listeners
    convertBtn.addEventListener('click', convert);
    pxInput.addEventListener('input', convert);
    baseInput.addEventListener('input', convert);

    // Initial conversion
    convert();
});
