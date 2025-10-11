document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    
    // Auto-focus on input
    inputText.focus();
    
    // Real-time conversion with debouncing
    let conversionTimeout;
    inputText.addEventListener('input', function() {
        clearTimeout(conversionTimeout);
        conversionTimeout = setTimeout(() => {
            convertText();
        }, 150);
    });
    
    // Convert on format change
    const formatOptions = document.querySelectorAll('input[name="format"]');
    formatOptions.forEach(option => {
        option.addEventListener('change', convertText);
    });
    
    // Handle Enter key for quick copy
    outputText.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'c') {
            copyOutput();
        }
    });
});

function convertText() {
    const input = document.getElementById('inputText').value;
    const output = document.getElementById('outputText');
    const format = document.querySelector('input[name="format"]:checked').value;
    
    if (!input) {
        output.value = '';
        updateStats(input);
        return;
    }
    
    let result = [];
    
    for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);
        
        switch(format) {
            case 'decimal':
                result.push(code);
                break;
            case 'hex':
                result.push('0x' + code.toString(16).toUpperCase().padStart(2, '0'));
                break;
            case 'binary':
                result.push(code.toString(2).padStart(8, '0'));
                break;
            case 'octal':
                result.push(code.toString(8));
                break;
        }
    }
    
    output.value = result.join(' ');
    updateStats(input);
}

function updateStats(text) {
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Animate character count
    animateValue('charCount', parseInt(document.getElementById('charCount').textContent) || 0, charCount, 300);
    animateValue('wordCount', parseInt(document.getElementById('wordCount').textContent) || 0, wordCount, 300);
    
    if (text) {
        const codes = [];
        for (let i = 0; i < text.length; i++) {
            codes.push(text.charCodeAt(i));
        }
        
        const minValue = Math.min(...codes);
        const maxValue = Math.max(...codes);
        
        document.getElementById('minValue').textContent = minValue;
        document.getElementById('maxValue').textContent = maxValue;
    } else {
        document.getElementById('minValue').textContent = '-';
        document.getElementById('maxValue').textContent = '-';
    }
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * progress;
        element.textContent = Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function clearAll() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
    updateStats('');
    document.getElementById('inputText').focus();
}

function copyOutput() {
    const output = document.getElementById('outputText');
    
    if (!output.value) {
        showNotification('Nothing to copy!', 'warning');
        return;
    }
    
    output.select();
    document.execCommand('copy');
    
    showNotification('Copied to clipboard!', 'success');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#7ed321' : '#f5a623'};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);