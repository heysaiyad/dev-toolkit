class ColorContrastChecker {
    calculateContrastRatio(foreground, background) {
        const fgLuminance = this.getRelativeLuminance(foreground);
        const bgLuminance = this.getRelativeLuminance(background);
        
        const lighter = Math.max(fgLuminance, bgLuminance);
        const darker = Math.min(fgLuminance, bgLuminance);
        
        const ratio = (lighter + 0.05) / (darker + 0.05);
        return ratio;
    }
    
    getRelativeLuminance(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        const sRGB = rgb.map(val => val / 255);
        
        const linear = sRGB.map(val => {
            if (val <= 0.03928) {
                return val / 12.92;
            } else {
                return Math.pow((val + 0.055) / 1.055, 2.4);
            }
        });
        
        const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        return luminance;
    }
    
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
    }
    
    passesAA(ratio, isLargeText = false) {
        const threshold = isLargeText ? 3 : 4.5;
        return ratio >= threshold;
    }
    
    passesAAA(ratio, isLargeText = false) {
        const threshold = isLargeText ? 4.5 : 7;
        return ratio >= threshold;
    }
    
    isValidHex(hex) {
        const hexPattern = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexPattern.test(hex);
    }
    
    normalizeHex(hex) {
        hex = hex.trim();
        
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        
        if (hex.length === 4) {
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        
        return hex.toUpperCase();
    }
}

const checker = new ColorContrastChecker();

const foregroundPicker = document.getElementById('foregroundPicker');
const foregroundInput = document.getElementById('foregroundInput');
const foregroundPreview = document.getElementById('foregroundPreview');

const backgroundPicker = document.getElementById('backgroundPicker');
const backgroundInput = document.getElementById('backgroundInput');
const backgroundPreview = document.getElementById('backgroundPreview');

const checkBtn = document.getElementById('checkBtn');
const resultsSection = document.getElementById('resultsSection');
const previewBox = document.getElementById('previewBox');
const previewText = document.getElementById('previewText');
const previewSubtext = document.getElementById('previewSubtext');
const ratioDisplay = document.getElementById('ratioDisplay');
const complianceGrid = document.getElementById('complianceGrid');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let currentForeground = '#000000';
let currentBackground = '#FFFFFF';

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateColor(type, color) {
    if (!checker.isValidHex(color)) {
        showToast('Invalid hex color format. Use #RRGGBB or #RGB', true);
        return;
    }
    
    const normalizedColor = checker.normalizeHex(color);
    
    if (type === 'foreground') {
        currentForeground = normalizedColor;
        foregroundPicker.value = normalizedColor;
        foregroundInput.value = normalizedColor;
        foregroundPreview.style.backgroundColor = normalizedColor;
    } else {
        currentBackground = normalizedColor;
        backgroundPicker.value = normalizedColor;
        backgroundInput.value = normalizedColor;
        backgroundPreview.style.backgroundColor = normalizedColor;
    }
}

function createComplianceCard(title, description, ratio, threshold, passes) {
    const badgeClass = passes ? 'badge-pass' : 'badge-fail';
    const badgeIcon = passes ? 'fa-check-circle' : 'fa-times-circle';
    const badgeText = passes ? 'PASS' : 'FAIL';
    
    return `
        <div class="compliance-card">
            <div class="compliance-header">
                <div class="compliance-title">${title}</div>
                <div class="compliance-badge ${badgeClass}">
                    <i class="fas ${badgeIcon}"></i>
                    ${badgeText}
                </div>
            </div>
            <div class="compliance-details">
                ${description}<br>
                <strong>Required:</strong> ${threshold}:1<br>
                <strong>Actual:</strong> ${ratio.toFixed(2)}:1
            </div>
        </div>
    `;
}

function checkContrast() {
    try {
        const ratio = checker.calculateContrastRatio(currentForeground, currentBackground);
        
        previewBox.style.backgroundColor = currentBackground;
        previewBox.style.color = currentForeground;
        previewText.style.color = currentForeground;
        previewSubtext.style.color = currentForeground;
        
        ratioDisplay.textContent = ratio.toFixed(2) + ':1';
        
        const aaLarge = checker.passesAA(ratio, true);
        const aaNormal = checker.passesAA(ratio, false);
        const aaaLarge = checker.passesAAA(ratio, true);
        const aaaNormal = checker.passesAAA(ratio, false);
        
        const cards = [
            createComplianceCard(
                'WCAG AA - Normal Text',
                'Minimum level for body text and smaller UI elements',
                ratio,
                '4.5',
                aaNormal
            ),
            createComplianceCard(
                'WCAG AA - Large Text',
                'For headings and text 18pt+ or 14pt+ bold',
                ratio,
                '3.0',
                aaLarge
            ),
            createComplianceCard(
                'WCAG AAA - Normal Text',
                'Enhanced level for maximum accessibility',
                ratio,
                '7.0',
                aaaNormal
            ),
            createComplianceCard(
                'WCAG AAA - Large Text',
                'Enhanced level for large text elements',
                ratio,
                '4.5',
                aaaLarge
            )
        ];
        
        complianceGrid.innerHTML = cards.join('');
        
        resultsSection.style.display = 'block';
        
        showToast('Contrast ratio calculated successfully!');
        
    } catch (error) {
        showToast('Error calculating contrast: ' + error.message, true);
    }
}

function initializeColors() {
    updateColor('foreground', currentForeground);
    updateColor('background', currentBackground);
}

foregroundPicker.addEventListener('input', (e) => {
    updateColor('foreground', e.target.value);
});

foregroundInput.addEventListener('input', (e) => {
    updateColor('foreground', e.target.value);
});

foregroundInput.addEventListener('blur', (e) => {
    if (checker.isValidHex(e.target.value)) {
        updateColor('foreground', e.target.value);
    } else {
        e.target.value = currentForeground;
    }
});

foregroundPreview.addEventListener('click', () => {
    foregroundPicker.click();
});

backgroundPicker.addEventListener('input', (e) => {
    updateColor('background', e.target.value);
});

backgroundInput.addEventListener('input', (e) => {
    updateColor('background', e.target.value);
});

backgroundInput.addEventListener('blur', (e) => {
    if (checker.isValidHex(e.target.value)) {
        updateColor('background', e.target.value);
    } else {
        e.target.value = currentBackground;
    }
});

backgroundPreview.addEventListener('click', () => {
    backgroundPicker.click();
});

checkBtn.addEventListener('click', checkContrast);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        checkContrast();
    }
});

initializeColors();