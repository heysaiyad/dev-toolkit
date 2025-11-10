// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const paletteDiv = document.getElementById('palette');
const extractBtn = document.getElementById('extractBtn');
const exportBtn = document.getElementById('exportBtn');
const colorCountSlider = document.getElementById('colorCount');
const colorCountValue = document.getElementById('colorCountValue');

let currentImage = null;
let extractedColors = [];

// Color conversion functions
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Quantize color to reduce similar colors (faster processing)
function quantizeColor(r, g, b, factor = 20) {
  return [
    Math.round(r / factor) * factor,
    Math.round(g / factor) * factor,
    Math.round(b / factor) * factor
  ];
}

// Upload area interactions
uploadArea.addEventListener('click', () => {
  imageUpload.click();
});

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageUpload(file);
  }
});

// Color count slider
colorCountSlider.addEventListener('input', (e) => {
  colorCountValue.textContent = e.target.value;
});

// Image upload handler
imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handleImageUpload(file);
  }
});

function handleImageUpload(file) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    
    img.onload = () => {
      currentImage = img;
      imagePreview.src = e.target.result;
      previewContainer.style.display = 'block';
      extractBtn.disabled = false;
      
      // Reset palette
      paletteDiv.innerHTML = '<i class="fas fa-palette empty-icon"></i><div>Click "Extract Colors" to analyze the image</div>';
      paletteDiv.classList.add('empty');
      exportBtn.style.display = 'none';
    };
  };
  
  reader.readAsDataURL(file);
}

// Extract colors button
extractBtn.addEventListener('click', () => {
  if (!currentImage) return;
  
  extractBtn.disabled = true;
  extractBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting...';
  
  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    extractColors();
    extractBtn.disabled = false;
    extractBtn.innerHTML = '<i class="fas fa-palette"></i> Extract Colors';
  });
});

function extractColors() {
  // Scale down image for faster processing (max 400px)
  const maxSize = 400;
  let width = currentImage.width;
  let height = currentImage.height;
  
  if (width > maxSize || height > maxSize) {
    if (width > height) {
      height = (height / width) * maxSize;
      width = maxSize;
    } else {
      width = (width / height) * maxSize;
      height = maxSize;
    }
  }
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(currentImage, 0, 0, width, height);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Sample every 4th pixel for even faster processing
  const step = 4;
  const colorCount = {};
  
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Quantize colors to reduce variations
    const [qr, qg, qb] = quantizeColor(r, g, b);
    const key = `${qr},${qg},${qb}`;
    colorCount[key] = (colorCount[key] || 0) + 1;
  }
  
  // Get top colors based on slider value
  const numColors = parseInt(colorCountSlider.value);
  const sortedColors = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numColors)
    .map(entry => entry[0]);
  
  // Store extracted colors
  extractedColors = sortedColors.map(color => {
    const [r, g, b] = color.split(',').map(Number);
    return {
      r, g, b,
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b)
    };
  });
  
  displayPalette();
}

function displayPalette() {
  paletteDiv.innerHTML = '';
  paletteDiv.classList.remove('empty');
  
  extractedColors.forEach((color, index) => {
    const colorCard = document.createElement('div');
    colorCard.className = 'color-card';
    
    colorCard.innerHTML = `
      <div class="color-preview" style="background-color: ${color.hex}"></div>
      <div class="color-info">
        <div class="color-value">
          <div>
            <div class="color-label">HEX</div>
            <div class="color-code">${color.hex}</div>
          </div>
          <button class="copy-color-btn" data-color="${color.hex}" data-format="HEX">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="color-value">
          <div>
            <div class="color-label">RGB</div>
            <div class="color-code">${color.rgb}</div>
          </div>
          <button class="copy-color-btn" data-color="${color.rgb}" data-format="RGB">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="color-value">
          <div>
            <div class="color-label">HSL</div>
            <div class="color-code">${color.hsl}</div>
          </div>
          <button class="copy-color-btn" data-color="${color.hsl}" data-format="HSL">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    `;
    
    paletteDiv.appendChild(colorCard);
  });
  
  // Add copy functionality to all copy buttons
  document.querySelectorAll('.copy-color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const color = btn.dataset.color;
      const format = btn.dataset.format;
      copyToClipboard(color, format);
    });
  });
  
  // Show export button
  exportBtn.style.display = 'inline-flex';
}

function copyToClipboard(text, format) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${format} copied: ${text}`);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.copied-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'copied-toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// Export palette functionality
exportBtn.addEventListener('click', () => {
  if (extractedColors.length === 0) return;
  
  const exportData = {
    timestamp: new Date().toISOString(),
    colorCount: extractedColors.length,
    colors: extractedColors.map((color, index) => ({
      index: index + 1,
      hex: color.hex,
      rgb: color.rgb,
      hsl: color.hsl
    }))
  };
  
  // Create downloadable JSON file
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `color-palette-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  showToast('Palette exported successfully!');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + V to paste image
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    navigator.clipboard.read().then(items => {
      for (let item of items) {
        for (let type of item.types) {
          if (type.startsWith('image/')) {
            item.getType(type).then(blob => {
              handleImageUpload(blob);
            });
            break;
          }
        }
      }
    }).catch(err => {
      console.log('Clipboard access denied:', err);
    });
  }
  
  // Enter to extract colors
  if (e.key === 'Enter' && !extractBtn.disabled) {
    extractBtn.click();
  }
});