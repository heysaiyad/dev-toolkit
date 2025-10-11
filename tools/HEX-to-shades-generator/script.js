// Utility Functions
function cleanHex(h) {
    if (!h) return null;
    h = h.trim().toLowerCase();
    if (h.startsWith('#')) h = h.slice(1);
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9a-f]{6}$/.test(h)) return null;
    return '#' + h;
  }
  
  function hexToRgb(hex) {
    const h = cleanHex(hex);
    if (!h) return null;
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return { r, g, b };
  }
  
  function rgbToHex({ r, g, b }) {
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }
  
  function rgbToCss(rgb) {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
  
  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  
  // Lighten/darken by mixing towards white/black by given fraction (0..1)
  function mixWith(hex, fraction, lighten = true) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const t = lighten ? 255 : 0;
    const f = fraction;
    const newR = Math.round((t - rgb.r) * f + rgb.r);
    const newG = Math.round((t - rgb.g) * f + rgb.g);
    const newB = Math.round((t - rgb.b) * f + rgb.b);
    return { r: newR, g: newG, b: newB };
  }
  
  // Build an array of 10 shades stepping proportionally up to percent
  function buildShades(hex, percent, mode) {
    const top = Math.min(100, Math.max(1, Number(percent)));
    const steps = 10;
    const shades = [];
    for (let i = 1; i <= steps; i++) {
      const p = (top / 100) * (i / steps);
      const rgb = mixWith(hex, p, mode === 'lighten');
      const hsl = rgbToHsl(rgb);
      shades.push({ hex: rgbToHex(rgb), rgb, hsl, weight: Math.round(p * 100) });
    }
    // Reverse for logical order: lightest/darkest first based on mode
    return shades.reverse();
  }
  
  // DOM Elements
  const colorPicker = document.getElementById('colorPicker');
  const hexInput = document.getElementById('hexInput');
  const percentInput = document.getElementById('percentInput');
  const modeSelect = document.getElementById('modeSelect');
  const generateBtn = document.getElementById('generateBtn');
  const shadesGrid = document.getElementById('shadesGrid');
  const exportBox = document.getElementById('exportBox');
  const swatchLarge = document.getElementById('swatchLarge');
  const bigHex = document.getElementById('bigHex');
  const bigRgb = document.getElementById('bigRgb');
  const luminance = document.getElementById('luminance');
  const toast = document.getElementById('toast');
  const copyCssBtn = document.getElementById('copyCssBtn');
  const resetBtn = document.getElementById('resetBtn');
  
  // Custom copy function (fallback for older browsers)
  function copyToClipboard(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.left = '-999999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      return document.execCommand('copy');
    } catch (err) {
      console.error('Copy failed:', err);
      return false;
    } finally {
      document.body.removeChild(tempInput);
    }
  }
  
  function showToast(message = 'Copied to clipboard!') {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
  
  // Update preview swatch with animation and contrast adjustment
  function updatePreview(hex) {
    const clean = cleanHex(hex);
    if (!clean) return;
    const rgb = hexToRgb(clean);
    const hsl = rgbToHsl(rgb);
  
    // Trigger shimmer animation
    swatchLarge.classList.add('changing');
    setTimeout(() => swatchLarge.classList.remove('changing'), 500);
  
    // Update styles and text
    swatchLarge.style.background = clean;
    bigHex.textContent = clean.toUpperCase();
    bigRgb.textContent = `${rgbToCss(rgb)} — H:${hsl.h}° S:${hsl.s}% L:${hsl.l}%`;
    luminance.textContent = `L: ${hsl.l}%`;
  
    // Adjust text color for contrast based on luminance
    if (hsl.l < 50) {
      bigHex.style.color = '#fff';
      bigRgb.style.color = 'rgba(255,255,255,0.8)';
    } else {
      bigHex.style.color = '#000';
      bigRgb.style.color = 'rgba(0,0,0,0.6)';
    }
  }
  
  // Render shades with staggered animations
  function renderShades(shades, baseHex) {
    shadesGrid.innerHTML = '';
    const cssVars = [];
    shades.forEach((shade, idx) => {
      const shadeDiv = document.createElement('div');
      shadeDiv.className = 'shade';
      shadeDiv.style.setProperty('--index', idx); // For animation delay
  
      const swatch = document.createElement('div');
      swatch.className = 'shade-swatch';
      swatch.style.background = shade.hex;
  
      const meta = document.createElement('div');
      meta.className = 'shade-meta';
      meta.innerHTML = `
        <div>
          <strong>${shade.hex}</strong>
          <div class="tiny">W${shade.weight * 10}</div> <!-- e.g., W200 for 20% -->
        </div>
        <button class="copy-btn" data-hex="${shade.hex}">Copy</button>
      `;
  
      shadeDiv.appendChild(swatch);
      shadeDiv.appendChild(meta);
      shadesGrid.appendChild(shadeDiv);
  
      // Add copy event to button
      const copyBtn = meta.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => {
        if (copyToClipboard(shade.hex)) {
          showToast(`${shade.hex} copied!`);
        } else {
          showToast('Copy failed. Please try again.');
        }
      });
  
      // CSS var for export
      const varName = `--shade-${shade.weight * 10}`;
      cssVars.push(`  ${varName}: ${shade.hex}; /* ${shade.rgb.r}, ${shade.rgb.g}, ${shade.rgb.b} */`);
    });
  
    // Update export box
    const exportText = `:root {\n  --base: ${baseHex};\n${cssVars.join('\n')}\n}`;
    exportBox.textContent = exportText;
  
    // Trigger grid visibility and shade animations
    shadesGrid.classList.add('visible');
    setTimeout(() => {
      shades.forEach((_, idx) => {
        const shadeEl = shadesGrid.children[idx];
        setTimeout(() => shadeEl.style.animationPlayState = 'running', idx * 50);
      });
    }, 100);
  }
  
  // Main generate function
  function generate() {
    const hex = cleanHex(hexInput.value) || cleanHex(colorPicker.value);
    if (!hex) {
      showToast('Please enter a valid HEX color (e.g., #7c3aed)');
      return;
    }
  
    const percent = Number(percentInput.value) || 20;
    if (percent < 1 || percent > 100) {
      showToast('Percentage must be between 1 and 100.');
      return;
    }
  
    const mode = modeSelect.value;
  
    // Show loading on button
    generateBtn.classList.add('loading');
    generateBtn.textContent = '';
  
    // Simulate brief processing delay for UX
    setTimeout(() => {
      updatePreview(hex);
      const shades = buildShades(hex, percent, mode);
      renderShades(shades, hex);
  
      // Reset button
      generateBtn.classList.remove('loading');
      generateBtn.textContent = 'Generate Shades';
    }, 300);
  }
  
  // Event Listeners
  colorPicker.addEventListener('input', (e) => {
    hexInput.value = e.target.value;
    updatePreview(e.target.value);
  });
  
  hexInput.addEventListener('input', (e) => {
    const cleaned = cleanHex(e.target.value);
    if (cleaned) {
      colorPicker.value = cleaned;
      updatePreview(cleaned);
    } else if (e.target.value === '') {
      // Allow empty for typing
      return;
    }
  });
  
  hexInput.addEventListener('change', (e) => {
    const cleaned = cleanHex(e.target.value);
    if (!cleaned) {
      showToast('Invalid HEX format. Use #RRGGBB or #RGB.');
      e.target.value = colorPicker.value; // Revert
    }
  });
  
  percentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate();
  });
  
  generateBtn.addEventListener('click', generate);
  
  copyCssBtn.addEventListener('click', () => {
    const text = exportBox.textContent;
    if (text.includes('/* Generate')) {
      showToast('Generate shades first to copy CSS.');
      return;
    }
    if (copyToClipboard(text)) {
      showToast('CSS variables copied!');
    } else {
      showToast('Copy failed. Please try again.');
    }
  });
  
  resetBtn.addEventListener('click', () => {
    const defaultHex = '#7c3aed';
    const defaultPercent = 20;
    const defaultMode = 'lighten';
  
    colorPicker.value = defaultHex;
    hexInput.value = defaultHex;
    percentInput.value = defaultPercent;
    modeSelect.value = defaultMode;
  
    updatePreview(defaultHex);
    generate(); // Regenerate with defaults
  });
  
  // Initial load
  window.addEventListener('load', () => {
    updatePreview('#7c3aed');
    generate();
  });
  