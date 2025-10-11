const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const fileInput = document.getElementById('fileInput');

// Drag and drop handlers
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('dragover');
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.classList.remove('dragover');
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            displayPreview(e.target.result, file, img.width, img.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayPreview(imgSrc, file, width, height) {
    // Update all favicon previews
    ['chrome', 'firefox', 'safari'].forEach(browser => {
        const faviconEl = document.getElementById(`favicon-${browser}`);
        faviconEl.innerHTML = `<img src="${imgSrc}" alt="Favicon">`;
    });

    // Update file info
    const fileSize = (file.size / 1024).toFixed(2);
    document.getElementById('fileSize').textContent = fileSize + ' KB';
    document.getElementById('dimensions').textContent = `${width}×${height}`;

    // Show preview section
    uploadSection.style.display = 'none';
    previewSection.classList.add('active');
}

function resetTool() {
    uploadSection.style.display = 'block';
    previewSection.classList.remove('active');
    fileInput.value = '';
}