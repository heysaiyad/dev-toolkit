document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const shapeTypeSelect = document.getElementById("shapeType");
    const xInput = document.getElementById("x");
    const yInput = document.getElementById("y");
    const radiusInput = document.getElementById("radius");
    const widthInput = document.getElementById("width");
    const heightInput = document.getElementById("height");
    const rxInput = document.getElementById("rx");
    const ryInput = document.getElementById("ry");
    const fillColorInput = document.getElementById("fillColor");
    const strokeColorInput = document.getElementById("strokeColor");
    const strokeWidthInput = document.getElementById("strokeWidth");
    const opacityInput = document.getElementById("opacity");
    const opacityValue = document.getElementById("opacityValue");
    const generateBtn = document.getElementById("generateBtn");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const svgPreview = document.getElementById("svgPreview");
    const codeOutput = document.getElementById("codeOutput");
    const messageDiv = document.getElementById("message");

    // Control groups for showing/hiding
    const radiusGroup = document.getElementById("radiusGroup");
    const widthGroup = document.getElementById("widthGroup");
    const heightGroup = document.getElementById("heightGroup");
    const rxGroup = document.getElementById("rxGroup");
    const ryGroup = document.getElementById("ryGroup");

    // Initialize
    updateControlVisibility();
    updateOpacityDisplay();
    generateSVG();

    // Event listeners
    shapeTypeSelect.addEventListener("change", updateControlVisibility);
    opacityInput.addEventListener("input", updateOpacityDisplay);
    generateBtn.addEventListener("click", generateSVG);
    copyBtn.addEventListener("click", copyCode);
    downloadBtn.addEventListener("click", downloadSVG);

    // Add input listeners for real-time updates
    [xInput, yInput, radiusInput, widthInput, heightInput, rxInput, ryInput, 
     fillColorInput, strokeColorInput, strokeWidthInput, opacityInput].forEach(input => {
        input.addEventListener("input", generateSVG);
    });

    function updateControlVisibility() {
        const shapeType = shapeTypeSelect.value;
        
        // Hide all groups first
        radiusGroup.style.display = "none";
        widthGroup.style.display = "none";
        heightGroup.style.display = "none";
        rxGroup.style.display = "none";
        ryGroup.style.display = "none";

        // Show relevant groups based on shape type
        switch (shapeType) {
            case "circle":
                radiusGroup.style.display = "block";
                break;
            case "rectangle":
                widthGroup.style.display = "block";
                heightGroup.style.display = "block";
                break;
            case "ellipse":
                rxGroup.style.display = "block";
                ryGroup.style.display = "block";
                break;
        }
    }

    function updateOpacityDisplay() {
        opacityValue.textContent = opacityInput.value;
    }

    function generateSVG() {
        const shapeType = shapeTypeSelect.value;
        const x = parseInt(xInput.value);
        const y = parseInt(yInput.value);
        const fillColor = fillColorInput.value;
        const strokeColor = strokeColorInput.value;
        const strokeWidth = parseInt(strokeWidthInput.value);
        const opacity = parseFloat(opacityInput.value);

        let shapeElement = "";
        let svgWidth = 300;
        let svgHeight = 200;

        // Calculate SVG dimensions based on shape
        switch (shapeType) {
            case "circle":
                const radius = parseInt(radiusInput.value);
                shapeElement = `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
                svgWidth = Math.max(300, (x + radius) * 2);
                svgHeight = Math.max(200, (y + radius) * 2);
                break;

            case "rectangle":
                const width = parseInt(widthInput.value);
                const height = parseInt(heightInput.value);
                shapeElement = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
                svgWidth = Math.max(300, x + width + 50);
                svgHeight = Math.max(200, y + height + 50);
                break;

            case "ellipse":
                const rx = parseInt(rxInput.value);
                const ry = parseInt(ryInput.value);
                shapeElement = `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
                svgWidth = Math.max(300, (x + rx) * 2);
                svgHeight = Math.max(200, (y + ry) * 2);
                break;
        }

        // Generate complete SVG
        const svgCode = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  ${shapeElement}
</svg>`;

        // Update preview
        svgPreview.innerHTML = svgCode;

        // Update code output
        codeOutput.innerHTML = `<pre><code>${escapeHtml(svgCode)}</code></pre>`;

        // Store current SVG code for copying/downloading
        window.currentSVGCode = svgCode;
    }

    function copyCode() {
        if (window.currentSVGCode) {
            navigator.clipboard.writeText(window.currentSVGCode).then(() => {
                showMessage("SVG code copied to clipboard!", "success");
            }).catch(() => {
                showMessage("Failed to copy code. Please try again.", "error");
            });
        }
    }

    function downloadSVG() {
        if (window.currentSVGCode) {
            const blob = new Blob([window.currentSVGCode], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `svg-shape-${shapeTypeSelect.value}-${Date.now()}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage("SVG file downloaded successfully!", "success");
        }
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        messageDiv.style.display = "block";
        
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    // Add some preset examples
    function loadPreset(preset) {
        switch (preset) {
            case "circle":
                shapeTypeSelect.value = "circle";
                xInput.value = "100";
                yInput.value = "100";
                radiusInput.value = "50";
                fillColorInput.value = "#3498db";
                strokeColorInput.value = "#2c3e50";
                strokeWidthInput.value = "2";
                opacityInput.value = "1";
                break;
            case "rectangle":
                shapeTypeSelect.value = "rectangle";
                xInput.value = "50";
                yInput.value = "50";
                widthInput.value = "100";
                heightInput.value = "80";
                fillColorInput.value = "#e74c3c";
                strokeColorInput.value = "#c0392b";
                strokeWidthInput.value = "3";
                opacityInput.value = "0.8";
                break;
            case "ellipse":
                shapeTypeSelect.value = "ellipse";
                xInput.value = "120";
                yInput.value = "100";
                rxInput.value = "60";
                ryInput.value = "40";
                fillColorInput.value = "#2ecc71";
                strokeColorInput.value = "#27ae60";
                strokeWidthInput.value = "2";
                opacityInput.value = "0.9";
                break;
        }
        updateControlVisibility();
        updateOpacityDisplay();
        generateSVG();
    }

    // Add preset buttons (optional enhancement)
    const presetSection = document.createElement("div");
    presetSection.className = "preset-section";
    presetSection.innerHTML = `
        <h4>Quick Presets:</h4>
        <div class="preset-buttons">
            <button class="btn btn-secondary preset-btn" data-preset="circle">Blue Circle</button>
            <button class="btn btn-secondary preset-btn" data-preset="rectangle">Red Rectangle</button>
            <button class="btn btn-secondary preset-btn" data-preset="ellipse">Green Ellipse</button>
        </div>
    `;
    
    // Insert preset section before the input section
    const inputSection = document.querySelector(".input-section");
    inputSection.parentNode.insertBefore(presetSection, inputSection);

    // Add preset button styles
    const presetStyles = document.createElement("style");
    presetStyles.textContent = `
        .preset-section {
            background: var(--bg-secondary);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        .preset-section h4 {
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        .preset-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        .preset-btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(presetStyles);

    // Add preset button event listeners
    document.querySelectorAll(".preset-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const preset = e.target.dataset.preset;
            loadPreset(preset);
        });
    });
});
