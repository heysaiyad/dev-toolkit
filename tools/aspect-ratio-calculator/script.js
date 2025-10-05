// DOM Elements
const modeButtons = document.querySelectorAll('.mode-btn');
const aspectRatioPreset = document.getElementById('aspect-ratio-preset');
const customRatioDiv = document.getElementById('custom-ratio');
const ratioWidthInput = document.getElementById('ratio-width');
const ratioHeightInput = document.getElementById('ratio-height');
const knownValueInput = document.getElementById('known-value');
const unitSelect = document.getElementById('unit-select');
const knownDimensionLabel = document.getElementById('known-dimension-label');
const widthValueEl = document.getElementById('width-value');
const heightValueEl = document.getElementById('height-value');
const diagonalValueEl = document.getElementById('diagonal-value');
const ratioValueEl = document.getElementById('ratio-value');
const copyBtn = document.getElementById('copy-btn');
const aspectPreview = document.getElementById('aspect-preview');
const previewRatioLabel = document.getElementById('preview-ratio-label');
const dimensionSvg = document.getElementById('dimension-svg');

// State
let currentMode = 'calculate-height'; // or 'calculate-width'
let calculationTimeout;

// Unit conversion to inches (for diagonal calculation)
const unitToInches = {
    px: 1 / 96, // Standard CSS: 96px = 1 inch
    cm: 1 / 2.54,
    in: 1,
    mm: 1 / 25.4,
    pt: 1 / 72
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    knownValueInput.focus();
});

// Event Listeners
function setupEventListeners() {
    // Mode switching
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.dataset.mode;
            updateLabels();
            calculate();
        });
    });

    // Aspect ratio preset change
    aspectRatioPreset.addEventListener('change', function() {
        if (this.value === 'custom') {
            customRatioDiv.style.display = 'flex';
        } else {
            customRatioDiv.style.display = 'none';
        }
        calculate();
    });

    // Custom ratio inputs
    ratioWidthInput.addEventListener('input', debounceCalculate);
    ratioHeightInput.addEventListener('input', debounceCalculate);

    // Known value input
    knownValueInput.addEventListener('input', debounceCalculate);

    // Unit change
    unitSelect.addEventListener('change', calculate);

    // Copy button
    copyBtn.addEventListener('click', copyToClipboard);
}

// Update labels based on mode
function updateLabels() {
    if (currentMode === 'calculate-height') {
        knownDimensionLabel.innerHTML = '<i class="fas fa-ruler-horizontal"></i> Width';
    } else {
        knownDimensionLabel.innerHTML = '<i class="fas fa-ruler-vertical"></i> Height';
    }
}

// Debounce calculation for performance
function debounceCalculate() {
    clearTimeout(calculationTimeout);
    calculationTimeout = setTimeout(calculate, 150);
}

// Parse aspect ratio
function parseAspectRatio() {
    let ratioValue = aspectRatioPreset.value;

    if (ratioValue === 'custom') {
        const w = parseFloat(ratioWidthInput.value);
        const h = parseFloat(ratioHeightInput.value);

        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            return null;
        }

        return { width: w, height: h, label: `${w}:${h}` };
    }

    // Parse preset ratio (format: "16:9" or "2.39:1")
    const parts = ratioValue.split(':');
    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);

    if (isNaN(w) || isNaN(h)) {
        return null;
    }

    return { width: w, height: h, label: ratioValue };
}

// Main calculation function
function calculate() {
    const knownValue = parseFloat(knownValueInput.value);
    const ratio = parseAspectRatio();
    const unit = unitSelect.value;

    // Validation
    if (isNaN(knownValue) || knownValue <= 0 || !ratio) {
        resetResults();
        return;
    }

    let width, height;

    // Calculate based on mode
    if (currentMode === 'calculate-height') {
        width = knownValue;
        height = (knownValue * ratio.height) / ratio.width;
    } else {
        height = knownValue;
        width = (knownValue * ratio.width) / ratio.height;
    }

    // Calculate diagonal in inches and cm
    const widthInInches = width * unitToInches[unit];
    const heightInInches = height * unitToInches[unit];
    const diagonalInches = Math.sqrt(Math.pow(widthInInches, 2) + Math.pow(heightInInches, 2));
    const diagonalCm = diagonalInches * 2.54;

    // Format results
    const formattedWidth = formatNumber(width);
    const formattedHeight = formatNumber(height);
    const formattedDiagonalInches = formatNumber(diagonalInches, 2);
    const formattedDiagonalCm = formatNumber(diagonalCm, 1);

    // Update UI with all dimensions
    widthValueEl.textContent = `${formattedWidth} ${unit}`;
    heightValueEl.textContent = `${formattedHeight} ${unit}`;
    diagonalValueEl.textContent = `${formattedDiagonalInches}" (${formattedDiagonalCm} cm)`;
    ratioValueEl.textContent = ratio.label;

    // Update preview and dimension lines
    updatePreview(ratio.width, ratio.height, ratio.label);
    drawDimensionLines(formattedWidth, formattedHeight, unit);

    // Enable copy button
    copyBtn.disabled = false;
}

// Format number with proper decimals
function formatNumber(num, maxDecimals = 2) {
    // If integer, return as is
    if (Number.isInteger(num)) {
        return num.toString();
    }

    // Round to max decimals and remove trailing zeros
    return parseFloat(num.toFixed(maxDecimals)).toString();
}

// Update visual preview
function updatePreview(ratioWidth, ratioHeight, label) {
    const containerWidth = aspectPreview.parentElement.clientWidth - 32; // Account for padding
    const containerHeight = 400;

    // Calculate preview dimensions maintaining aspect ratio
    let previewWidth, previewHeight;
    const ratio = ratioWidth / ratioHeight;

    if (ratio >= 1) {
        // Landscape or square
        previewWidth = Math.min(containerWidth, 600);
        previewHeight = previewWidth / ratio;

        if (previewHeight > containerHeight) {
            previewHeight = containerHeight;
            previewWidth = previewHeight * ratio;
        }
    } else {
        // Portrait
        previewHeight = Math.min(containerHeight, 400);
        previewWidth = previewHeight * ratio;

        if (previewWidth > containerWidth) {
            previewWidth = containerWidth;
            previewHeight = previewWidth / ratio;
        }
    }

    aspectPreview.style.width = `${previewWidth}px`;
    aspectPreview.style.height = `${previewHeight}px`;
    previewRatioLabel.textContent = label;
}

// Reset results
function resetResults() {
    widthValueEl.textContent = '-';
    heightValueEl.textContent = '-';
    diagonalValueEl.textContent = '-';
    ratioValueEl.textContent = '-';
    copyBtn.disabled = true;

    // Clear dimension lines
    dimensionSvg.innerHTML = '';

    // Reset preview to default
    const ratio = parseAspectRatio();
    if (ratio) {
        updatePreview(ratio.width, ratio.height, ratio.label);
    }
}

// Store current dimension values for resize
let currentDimensions = {
    width: null,
    height: null,
    unit: null
};

// Draw dimension lines on SVG
function drawDimensionLines(formattedWidth, formattedHeight, unit) {
    // Store for resize
    currentDimensions = {
        width: formattedWidth,
        height: formattedHeight,
        unit: unit
    };

    // Clear previous lines
    dimensionSvg.innerHTML = '';

    // Get preview element position and size
    const previewRect = aspectPreview.getBoundingClientRect();
    const containerRect = dimensionSvg.getBoundingClientRect();

    // Calculate relative positions
    const left = previewRect.left - containerRect.left;
    const top = previewRect.top - containerRect.top;
    const rectWidth = previewRect.width;
    const rectHeight = previewRect.height;

    const offset = 20; // Distance from rectangle
    const arrowSize = 6;
    const color = '#ff6b35'; // Primary color

    // Create SVG namespace
    const svgNS = 'http://www.w3.org/2000/svg';

    // Helper function to create dimension line with arrows and text
    function createDimensionLine(x1, y1, x2, y2, text, textX, textY, rotation = 0, bgColor = '#1a1a2e') {
        const group = document.createElementNS(svgNS, 'g');

        // Main line
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        group.appendChild(line);

        // Arrow at start
        const arrow1 = document.createElementNS(svgNS, 'polygon');
        const angle1 = Math.atan2(y2 - y1, x2 - x1);
        const points1 = [
            `${x1 + arrowSize * Math.cos(angle1 - Math.PI/6)},${y1 + arrowSize * Math.sin(angle1 - Math.PI/6)}`,
            `${x1},${y1}`,
            `${x1 + arrowSize * Math.cos(angle1 + Math.PI/6)},${y1 + arrowSize * Math.sin(angle1 + Math.PI/6)}`
        ].join(' ');
        arrow1.setAttribute('points', points1);
        arrow1.setAttribute('fill', color);
        group.appendChild(arrow1);

        // Arrow at end
        const arrow2 = document.createElementNS(svgNS, 'polygon');
        const angle2 = Math.atan2(y1 - y2, x1 - x2);
        const points2 = [
            `${x2 + arrowSize * Math.cos(angle2 - Math.PI/6)},${y2 + arrowSize * Math.sin(angle2 - Math.PI/6)}`,
            `${x2},${y2}`,
            `${x2 + arrowSize * Math.cos(angle2 + Math.PI/6)},${y2 + arrowSize * Math.sin(angle2 + Math.PI/6)}`
        ].join(' ');
        arrow2.setAttribute('points', points2);
        arrow2.setAttribute('fill', color);
        group.appendChild(arrow2);

        // Text background
        const textBg = document.createElementNS(svgNS, 'rect');
        const padding = 6;
        const bgWidth = text.length * 7 + padding * 2;
        const bgHeight = 20;
        textBg.setAttribute('x', -bgWidth / 2);
        textBg.setAttribute('y', -bgHeight / 2);
        textBg.setAttribute('width', bgWidth);
        textBg.setAttribute('height', bgHeight);
        textBg.setAttribute('fill', bgColor);
        textBg.setAttribute('rx', '4');

        // Text
        const textEl = document.createElementNS(svgNS, 'text');
        textEl.setAttribute('x', 0);
        textEl.setAttribute('y', 5);
        textEl.setAttribute('fill', color);
        textEl.setAttribute('font-size', '12');
        textEl.setAttribute('font-weight', '600');
        textEl.setAttribute('text-anchor', 'middle');
        textEl.textContent = text;

        // Group for text and background with rotation
        const textGroup = document.createElementNS(svgNS, 'g');
        if (rotation !== 0) {
            textGroup.setAttribute('transform', `translate(${textX}, ${textY}) rotate(${rotation})`);
        } else {
            textGroup.setAttribute('transform', `translate(${textX}, ${textY})`);
        }
        textGroup.appendChild(textBg);
        textGroup.appendChild(textEl);
        group.appendChild(textGroup);

        return group;
    }

    // Width dimension (top) - no rotation, dark background (outside rectangle)
    const widthLine = createDimensionLine(
        left, top - offset,
        left + rectWidth, top - offset,
        `${formattedWidth} ${unit}`,
        left + rectWidth / 2, top - offset,
        0,
        '#1a1a2e'
    );
    dimensionSvg.appendChild(widthLine);

    // Height dimension (right) - rotated 90 degrees, dark background (outside rectangle)
    const heightLine = createDimensionLine(
        left + rectWidth + offset, top,
        left + rectWidth + offset, top + rectHeight,
        `${formattedHeight} ${unit}`,
        left + rectWidth + offset, top + rectHeight / 2,
        -90,
        '#1a1a2e'
    );
    dimensionSvg.appendChild(heightLine);

    // Diagonal dimension - rotated based on actual angle, in same unit
    // Calculate diagonal in the same unit as width/height
    const diagonalInSameUnit = Math.sqrt(Math.pow(parseFloat(formattedWidth), 2) + Math.pow(parseFloat(formattedHeight), 2));
    const formattedDiagonalSameUnit = formatNumber(diagonalInSameUnit, 2);

    // Constant inset from rectangle edges (not along diagonal)
    const diagonalInset = 15; // pixels to inset from edges

    // Calculate actual diagonal angle based on aspect ratio
    const diagonalAngleRad = Math.atan2(rectHeight, rectWidth);
    const diagonalAngleDeg = diagonalAngleRad * 180 / Math.PI;

    // Start and end points with constant inset from edges
    const diagStartX = left + diagonalInset;
    const diagStartY = top + diagonalInset;
    const diagEndX = left + rectWidth - diagonalInset;
    const diagEndY = top + rectHeight - diagonalInset;

    // Text position: center of the shortened diagonal line
    const diagCenterX = (diagStartX + diagEndX) / 2;
    const diagCenterY = (diagStartY + diagEndY) / 2;

    // Diagonal with rectangle background color (inside rectangle)
    const diagonalLine = createDimensionLine(
        diagStartX, diagStartY,
        diagEndX, diagEndY,
        `${formattedDiagonalSameUnit} ${unit}`,
        diagCenterX, diagCenterY,
        diagonalAngleDeg,
        '#183547'
    );
    dimensionSvg.appendChild(diagonalLine);
}

// Copy to clipboard
function copyToClipboard() {
    const width = widthValueEl.textContent;
    const height = heightValueEl.textContent;
    const diagonal = diagonalValueEl.textContent;
    const text = `${width} × ${height} (Diagonal: ${diagonal})`;

    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Initialize preview on load
window.addEventListener('load', function() {
    const ratio = parseAspectRatio();
    if (ratio) {
        updatePreview(ratio.width, ratio.height, ratio.label);
    }
});

// Recalculate preview and dimension lines on window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const ratio = parseAspectRatio();
        if (ratio) {
            updatePreview(ratio.width, ratio.height, ratio.label);

            // Redraw dimension lines if we have current dimensions
            if (currentDimensions.width && currentDimensions.height && currentDimensions.unit) {
                drawDimensionLines(currentDimensions.width, currentDimensions.height, currentDimensions.unit);
            }
        }
    }, 150);
});
