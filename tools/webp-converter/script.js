// WebP Image Converter JavaScript functionality
class WebPConverter {
  constructor() {
    this.selectedFiles = [];
    this.convertedImages = [];
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.uploadArea = document.getElementById("upload-area");
    this.fileInput = document.getElementById("file-input");
    this.uploadBtn = document.getElementById("upload-btn");
    this.convertBtn = document.getElementById("convert-btn");
    this.resultsSection = document.getElementById("results-section");
    this.resultsGrid = document.getElementById("webp-results");
    this.progressSection = document.getElementById("progress-section");
    this.progressText = document.getElementById("progress-text");
    this.progressFill = document.getElementById("progress-fill");
    this.downloadAllBtn = document.getElementById("download-all-btn");
    this.clearAllBtn = document.getElementById("clear-all-btn");
    this.qualitySlider = document.getElementById("quality");
    this.qualityValue = document.getElementById("quality-value");
    this.maxWidthInput = document.getElementById("max-width");
    this.maxHeightInput = document.getElementById("max-height");
  }

  attachEventListeners() {
    // File upload events
    this.uploadArea.addEventListener("click", () => this.fileInput.click());
    this.uploadArea.addEventListener("dragover", (e) => this.handleDragOver(e));
    this.uploadArea.addEventListener("dragleave", (e) => this.handleDragLeave(e));
    this.uploadArea.addEventListener("drop", (e) => this.handleDrop(e));
    this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

    // Convert button
    this.convertBtn.addEventListener("click", () => this.convertImages());

    // Quality slider
    this.qualitySlider.addEventListener("input", (e) => {
      this.qualityValue.textContent = Math.round(e.target.value * 100) + "%";
    });

    // Action buttons
    this.downloadAllBtn.addEventListener("click", () => this.downloadAll());
    this.clearAllBtn.addEventListener("click", () => this.clearAll());
  }

  handleDragOver(e) {
    e.preventDefault();
    this.uploadArea.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.uploadArea.classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.uploadArea.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    this.addFiles(files);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(file => 
      file.type.startsWith('image/')
    );
    this.addFiles(files);
  }

  addFiles(files) {
    files.forEach(file => {
      if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
      }
    });
    this.updateFileList();
    this.updateConvertButton();
  }

  updateFileList() {
    const fileListContainer = this.uploadArea.querySelector('.webp-file-list') || 
      this.createFileListContainer();
    
    fileListContainer.innerHTML = '';
    
    this.selectedFiles.forEach((file, index) => {
      const fileItem = this.createFileItem(file, index);
      fileListContainer.appendChild(fileItem);
    });
  }

  createFileListContainer() {
    const container = document.createElement('div');
    container.className = 'webp-file-list';
    this.uploadArea.appendChild(container);
    return container;
  }

  createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'webp-file-item';
    
    const img = document.createElement('img');
    img.className = 'webp-file-icon';
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'webp-file-info';
    fileInfo.innerHTML = `
      <div class="webp-file-details">
        <div class="webp-file-name">${file.name}</div>
        <div class="webp-file-size">${this.formatFileSize(file.size)}</div>
      </div>
    `;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'webp-file-remove';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => this.removeFile(index));
    
    fileItem.appendChild(img);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    
    return fileItem;
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.updateFileList();
    this.updateConvertButton();
  }

  updateConvertButton() {
    this.convertBtn.disabled = this.selectedFiles.length === 0;
  }

  async convertImages() {
    if (this.selectedFiles.length === 0) return;

    this.showProgress();
    this.convertedImages = [];
    
    const quality = parseFloat(this.qualitySlider.value);
    const maxWidth = parseInt(this.maxWidthInput.value) || 1920;
    const maxHeight = parseInt(this.maxHeightInput.value) || 1080;

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      this.updateProgress(`Converting ${file.name}...`, (i / this.selectedFiles.length) * 100);
      
      try {
        const webpBlob = await this.convertToWebP(file, quality, maxWidth, maxHeight);
        const convertedImage = {
          originalFile: file,
          webpBlob: webpBlob,
          originalSize: file.size,
          webpSize: webpBlob.size,
          compressionRatio: ((file.size - webpBlob.size) / file.size * 100).toFixed(1)
        };
        this.convertedImages.push(convertedImage);
      } catch (error) {
        console.error(`Error converting ${file.name}:`, error);
        // Continue with other files
      }
    }

    this.hideProgress();
    this.displayResults();
  }

  async convertToWebP(file, quality, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let { width, height } = this.calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  showProgress() {
    this.progressSection.style.display = 'block';
    this.resultsSection.style.display = 'none';
  }

  hideProgress() {
    this.progressSection.style.display = 'none';
  }

  updateProgress(text, percentage) {
    this.progressText.textContent = text;
    this.progressFill.style.width = percentage + '%';
  }

  displayResults() {
    this.resultsSection.style.display = 'block';
    this.resultsGrid.innerHTML = '';

    this.convertedImages.forEach((image, index) => {
      const resultItem = this.createResultItem(image, index);
      this.resultsGrid.appendChild(resultItem);
    });
  }

  createResultItem(image, index) {
    const resultItem = document.createElement('div');
    resultItem.className = 'webp-result-item';
    
    const preview = document.createElement('img');
    preview.className = 'webp-result-preview';
    preview.src = URL.createObjectURL(image.webpBlob);
    preview.alt = image.originalFile.name;
    
    const info = document.createElement('div');
    info.className = 'webp-result-info';
    info.innerHTML = `
      <div class="webp-result-name">${image.originalFile.name}</div>
      <div class="webp-result-details">
        <div>Original: ${this.formatFileSize(image.originalSize)}</div>
        <div>WebP: ${this.formatFileSize(image.webpSize)}</div>
        <div>Saved: ${image.compressionRatio}%</div>
        <div>Quality: ${Math.round(parseFloat(this.qualitySlider.value) * 100)}%</div>
      </div>
    `;
    
    const actions = document.createElement('div');
    actions.className = 'webp-result-actions';
    actions.innerHTML = `
      <button class="webp-btn-download" onclick="webpConverter.downloadSingle(${index})">
        <i class="fas fa-download"></i>
        Download
      </button>
      <button class="webp-btn-remove" onclick="webpConverter.removeResult(${index})">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    resultItem.appendChild(preview);
    resultItem.appendChild(info);
    resultItem.appendChild(actions);
    
    return resultItem;
  }

  downloadSingle(index) {
    const image = this.convertedImages[index];
    const url = URL.createObjectURL(image.webpBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.getWebPFileName(image.originalFile.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadAll() {
    this.convertedImages.forEach((image, index) => {
      setTimeout(() => {
        this.downloadSingle(index);
      }, index * 100); // Stagger downloads
    });
  }

  removeResult(index) {
    this.convertedImages.splice(index, 1);
    this.displayResults();
    
    if (this.convertedImages.length === 0) {
      this.resultsSection.style.display = 'none';
    }
  }

  clearAll() {
    this.selectedFiles = [];
    this.convertedImages = [];
    this.updateFileList();
    this.updateConvertButton();
    this.resultsSection.style.display = 'none';
    this.fileInput.value = '';
  }

  getWebPFileName(originalName) {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExt}.webp`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Initialize the WebP Converter when the page loads
let webpConverter;
document.addEventListener("DOMContentLoaded", () => {
  webpConverter = new WebPConverter();
});
