const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const filesContainer = document.getElementById('filesContainer');
const fileList = document.getElementById('fileList');
const filesCount = document.getElementById('filesCount');
const createZipBtn = document.getElementById('createZipBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let uploadedFiles = [];
let draggedElement = null;

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
        pdf: { icon: 'fa-file-pdf', class: 'pdf' },
        doc: { icon: 'fa-file-word', class: 'text' },
        docx: { icon: 'fa-file-word', class: 'text' },
        xls: { icon: 'fa-file-excel', class: 'text' },
        xlsx: { icon: 'fa-file-excel', class: 'text' },
        ppt: { icon: 'fa-file-powerpoint', class: 'text' },
        pptx: { icon: 'fa-file-powerpoint', class: 'text' },
        txt: { icon: 'fa-file-alt', class: 'text' },
        jpg: { icon: 'fa-file-image', class: 'image' },
        jpeg: { icon: 'fa-file-image', class: 'image' },
        png: { icon: 'fa-file-image', class: 'image' },
        gif: { icon: 'fa-file-image', class: 'image' },
        svg: { icon: 'fa-file-image', class: 'image' },
        zip: { icon: 'fa-file-archive', class: 'archive' },
        rar: { icon: 'fa-file-archive', class: 'archive' },
        '7z': { icon: 'fa-file-archive', class: 'archive' },
        mp4: { icon: 'fa-file-video', class: 'default' },
        avi: { icon: 'fa-file-video', class: 'default' },
        mp3: { icon: 'fa-file-audio', class: 'default' },
        wav: { icon: 'fa-file-audio', class: 'default' },
    };
    
    return iconMap[extension] || { icon: 'fa-file', class: 'default' };
}

function updateFilesDisplay() {
    if (uploadedFiles.length === 0) {
        filesContainer.style.display = 'none';
        createZipBtn.disabled = true;
        return;
    }
    
    filesContainer.style.display = 'block';
    createZipBtn.disabled = false;
    filesCount.textContent = `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}`;
    
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileIcon = getFileIcon(file.name);
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.draggable = true;
        fileItem.dataset.index = index;
        
        fileItem.innerHTML = `
            <i class="fas fa-grip-vertical drag-handle"></i>
            <i class="fas ${fileIcon.icon} file-icon ${fileIcon.class}"></i>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="file-actions">
                <button class="icon-btn" onclick="removeFile(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        fileItem.addEventListener('dragstart', handleDragStart);
        fileItem.addEventListener('dragend', handleDragEnd);
        fileItem.addEventListener('dragover', handleDragOver);
        fileItem.addEventListener('drop', handleDrop);
        fileItem.addEventListener('dragenter', handleDragEnter);
        fileItem.addEventListener('dragleave', handleDragLeave);
        
        fileList.appendChild(fileItem);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(this.dataset.index);
        
        const draggedFile = uploadedFiles[draggedIndex];
        uploadedFiles.splice(draggedIndex, 1);
        uploadedFiles.splice(targetIndex, 0, draggedFile);
        
        updateFilesDisplay();
        showToast('File reordered successfully');
    }
    
    return false;
}

function addFiles(files) {
    const newFiles = Array.from(files);
    
    if (newFiles.length === 0) {
        return;
    }
    
    uploadedFiles = uploadedFiles.concat(newFiles);
    updateFilesDisplay();
    showToast(`${newFiles.length} file${newFiles.length !== 1 ? 's' : ''} added successfully`);
}

function removeFile(index) {
    const fileName = uploadedFiles[index].name;
    uploadedFiles.splice(index, 1);
    updateFilesDisplay();
    showToast(`${fileName} removed`);
}

function clearAllFiles() {
    uploadedFiles = [];
    updateFilesDisplay();
    showToast('All files cleared');
}

async function createZipFile() {
    if (uploadedFiles.length === 0) {
        showToast('No files to compress', true);
        return;
    }
    
    try {
        createZipBtn.disabled = true;
        createZipBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating ZIP...';
        
        const zip = new JSZip();
        
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            zip.file(file.name, file);
        }
        
        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });
        
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `files-${timestamp}.zip`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        createZipBtn.disabled = false;
        createZipBtn.innerHTML = '<i class="fas fa-file-archive"></i> Create ZIP';
        
        showToast('ZIP file created and downloaded successfully!');
        
    } catch (error) {
        createZipBtn.disabled = false;
        createZipBtn.innerHTML = '<i class="fas fa-file-archive"></i> Create ZIP';
        showToast('Error creating ZIP file: ' + error.message, true);
    }
}

selectFilesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

uploadSection.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    addFiles(e.target.files);
    fileInput.value = '';
});

uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('drag-over');
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.classList.remove('drag-over');
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
});

createZipBtn.addEventListener('click', createZipFile);
clearAllBtn.addEventListener('click', clearAllFiles);

window.removeFile = removeFile;