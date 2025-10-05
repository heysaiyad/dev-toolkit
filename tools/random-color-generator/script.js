const generateBtn = document.getElementById('generateBtn');
const colorOutput = document.getElementById('colorOutput');
const colorPreview = document.getElementById('colorPreview');
const copyBtn = document.getElementById('copyBtn');
const message = document.getElementById('message');

// Generate a random HEX or RGB color
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    return { hex, rgb: `rgb(${r}, ${g}, ${b})` };
}

generateBtn.addEventListener('click', () => {
    const { hex, rgb } = getRandomColor();
    colorOutput.textContent = `${hex} | ${rgb}`;
    colorPreview.style.backgroundColor = hex;
});

// Copy color to clipboard
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(colorOutput.textContent)
        .then(() => {
            message.textContent = 'Color copied!';
            message.style.color = 'var(--success-color)';
            setTimeout(() => message.textContent = '', 2000);
        })
        .catch(() => {
            message.textContent = 'Failed to copy!';
            message.style.color = 'var(--error-color)';
            setTimeout(() => message.textContent = '', 2000);
        });
});
