function hexToRgb(hex) {
    let h = hex.startsWith('#') ? hex.slice(1) : hex;

    // Handle 3-digit shorthand format ('f00'->'ff0000')
    if (h.length == 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }

    // Validate length and characters
    if (h.length !== 6 || !/^[0-9a-f]{6}$/i.test(h)) {
        return 'Invalid Hex color';
    }

    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);


    return `rgb(${r}, ${g}, ${b})`;
}

// Function to read the input, perform conversions and update UI elements

function conversion() {
    const hexInput = document.getElementById('hexInput').value.trim();
    const outputElement = document.getElementById('output');
    const previewElement = document.getElementById('prev-box');

    const rgbResult = hexToRgb(hexInput);

    outputElement.textContent = rgbResult;
    if (rgbResult === 'Invalid Hex color') {
 
        outputElement.style.backgroundColor = '#fee2e2'; 
        outputElement.style.color = '#b91c1c';       


        previewElement.style.backgroundColor = 'transparent';
        previewElement.style.borderColor = 'rgb(255, 0, 0)';
    
    } else {
        
        outputElement.style.backgroundColor = 'var(--bg-primary)'; 
        outputElement.style.color = '#fff';        

        previewElement.style.backgroundColor = rgbResult;
        previewElement.style.borderColor = rgbResult;
      
    }



}

// Function to implement copy clipboard feature
function copyToClipboard() {
    const rgbValue = document.getElementById('output').textContent;
    if (rgbValue === 'Invalid Hex color') {
        showMessage("Cannot copy invalid color.", true);
        return;
    }

    // Use execCommand for broader compatibility in iframe environments
    const tempInput = document.createElement('textarea');
    tempInput.value = rgbValue;
    document.body.appendChild(tempInput);
    tempInput.select();

    try {
        document.execCommand('copy');
        showMessage(`Copied: ${rgbValue}`);
    } catch (err) {
        showMessage('Failed to copy. Please try manually.', true);
    } finally {
        document.body.removeChild(tempInput);
    }
}

// Function to display the error messages
function showMessage(text, isError = false) {
    const box = document.getElementById('message');
    box.textContent = text;
    box.style.fontSize = '1rem';
    box.style.fontWeight = '600';
    box.style.transition = 'color 0.3s ease-in-out';
    box.style.textAlign = 'center';


    setTimeout(() => {
        box.textContent = '';

    }, 3000);
}