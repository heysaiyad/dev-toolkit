const fileInput = document.getElementById('fileInput');
const qualityRange = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const formatSel = document.getElementById('format');
const maxWidthEl = document.getElementById('maxWidth');
const maxHeightEl = document.getElementById('maxHeight');
const keepAspectEl = document.getElementById('keepAspect');
const origPreview = document.getElementById('origPreview');
const compPreview = document.getElementById('compPreview');
const compressBtn = document.getElementById('compressBtn');
const downloadLink = document.getElementById('downloadLink');
const infoOriginal = document.getElementById('infoOriginal');
const infoCompressed = document.getElementById('infoCompressed');
const infoSavings = document.getElementById('infoSavings');
const transparencyNote = document.getElementById('transparencyNote');

// Accessibility-friendly toggle for the download link state
function setDownloadEnabled(enabled) {
    if (!downloadLink) return;
    if (enabled) {
        downloadLink.removeAttribute('aria-disabled');
        downloadLink.removeAttribute('tabindex');
        downloadLink.classList.remove('is-disabled');
        downloadLink.removeAttribute('disabled');
    } else {
        downloadLink.setAttribute('aria-disabled', 'true');
        downloadLink.setAttribute('tabindex', '-1');
        downloadLink.classList.add('is-disabled');
        downloadLink.setAttribute('disabled', '');
        downloadLink.removeAttribute('href');
        downloadLink.removeAttribute('download');
    }
}

let originalFile = null;
let originalImg = null;
let compressedBlob = null;
let compressedURL = null;
let resizableComp = null;
let resizableOrig = null;
let compResizeObserver = null;
let lastBoxW = null, lastBoxH = null;
let isProgrammaticResize = false;

function setupCompResizeObserver(box) {
    if (compResizeObserver) compResizeObserver.disconnect();

    const onResize = (entries) => {
        if (!entries || !entries[0] || isProgrammaticResize) return;

        // Read the size the browser actually paints (avoids subpixel & box-model drift)
        let newW = box.offsetWidth;
        let newH = box.offsetHeight;

        // Guard against tiny oscillations from rounding/scrollbar jitters
        if (lastBoxW != null && lastBoxH != null) {
            const jitter = Math.abs(newW - lastBoxW) + Math.abs(newH - lastBoxH);
            if (jitter <= 1) return;
        }

        const keepAspect = !!(keepAspectEl && keepAspectEl.checked);


        // Update inputs only if changed (avoid flicker)
        if (maxWidthEl.value !== String(newW)) maxWidthEl.value = String(newW);
        if (maxHeightEl.value !== String(newH)) maxHeightEl.value = String(newH);

        lastBoxW = newW;
        lastBoxH = newH;

        // Keep original preview the exact same display size
        if (resizableOrig) {
            resizableOrig.style.width = newW + 'px';
            resizableOrig.style.height = newH + 'px';
        }

        // Do not recompress mid-drag (your previous guard)
        debouncedCompress();
    };

    // Throttle to frame rate to avoid “mid-frame” mismatches
    let rafId = null;
    compResizeObserver = new ResizeObserver((entries) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            onResize(entries);
        });
    });

    compResizeObserver.observe(box);
}


function bytesToNice(bytes) {
    if (bytes == null) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let num = bytes;
    while (num >= 1024 && i < units.length - 1) {
        num /= 1024;
        i++;
    }
    return num.toFixed(num < 10 && i > 0 ? 2 : 0) + ' ' + units[i];
}

function clearPreview(el) {
    [...el.querySelectorAll('img,canvas,.resizable')].forEach(n => n.remove());
    el.classList.remove('has-image');
}

function showImageIn(el, src, w, h) {
    if (el === origPreview) {
        // Render original inside a resizable box that mirrors the compressed size
        clearPreview(el);
        let box = resizableOrig;
        if (!box) {
            box = document.createElement('div');
            box.className = 'resizable';
            resizableOrig = box;
        }
        const img = document.createElement('img');
        img.alt = 'preview';
        img.src = src;
        // If compressed box exists, match its current size, otherwise use provided or natural
        let ow = (resizableComp && resizableComp.offsetWidth) || (typeof w === 'number' ? w : undefined);
        let oh = (resizableComp && resizableComp.offsetHeight) || (typeof h === 'number' ? h : undefined);
        if (ow) box.style.width = ow + 'px';
        if (oh) box.style.height = oh + 'px';
        box.innerHTML = '';
        box.appendChild(img);
        el.appendChild(box);
        el.classList.add('has-image');
        return;
    }

    let box = resizableComp;
    if (!box) {
        // first time create
        box = document.createElement('div');
        box.className = 'resizable';
        if (typeof w === 'number' && w > 0) box.style.width = w + 'px';
        if (typeof h === 'number' && h > 0) box.style.height = h + 'px';

        const img = document.createElement('img');
        img.alt = 'preview';
        img.src = src;
        box.appendChild(img);

        resizableComp = box;
        if (el !== box.parentNode) el.appendChild(box);
        el.classList.add('has-image');

        // set aspect ratio constraint if needed
        updateResizableAspect();

        // (re)attach observer
        setupCompResizeObserver(box);
        lastBoxW = (typeof w === 'number' ? w : null);
        lastBoxH = (typeof h === 'number' ? h : null);
        return;
    }

    // reuse existing box + img
    let img = box.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        img.alt = 'preview';
        box.appendChild(img);
    }

    // refresh aspect ratio constraint (in case checkbox changed)
    updateResizableAspect();

    if (typeof w === 'number' && w > 0) box.style.width = w + 'px';
    if (typeof h === 'number' && h > 0) box.style.height = h + 'px';
    if (img.src !== src) img.src = src;

    if (box.parentNode !== el) {
        el.appendChild(box);
        el.classList.add('has-image');
    }
}


function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
}

function computeTargetSize(srcW, srcH, maxW, maxH, keepAspect) {
    if (!maxW && !maxH) return {w: srcW, h: srcH};
    let w = srcW, h = srcH;
    if (keepAspect !== false) {
        if (maxW && w > maxW) {
            const scale = maxW / w;
            w = maxW;
            h = Math.round(h * scale);
        }
        if (maxH && h > maxH) {
            const scale = maxH / h;
            h = maxH;
            w = Math.round(w * scale);
        }
    } else {
        if (maxW && w > maxW) {
            w = maxW;
        }
        if (maxH && h > maxH) {
            h = maxH;
        }
    }
    return {w, h};
}

async function compress() {
    if (!originalFile || !originalImg) return;

    const srcType = originalFile.type; // image/jpeg or image/png
    let targetType = formatSel.value;
    if (targetType === 'auto') {
        // If JPEG, keep JPEG. If PNG, convert to JPEG to allow quality compression.
        targetType = srcType === 'image/jpeg' ? 'image/jpeg' : 'image/jpeg';
    }

    // transparency notice
    const willLoseAlpha = (srcType === 'image/png') && (targetType === 'image/jpeg');
    transparencyNote.style.display = willLoseAlpha ? 'block' : 'none';

    const q = Math.min(100, Math.max(1, parseInt(qualityRange.value, 10) || 80)) / 100;

    const maxW = parseInt(maxWidthEl.value, 10);
    const maxH = parseInt(maxHeightEl.value, 10);

    const keepAspect = keepAspectEl ? !!keepAspectEl.checked : true;
    const {
        w: dstW,
        h: dstH
    } = computeTargetSize(originalImg.naturalWidth, originalImg.naturalHeight, maxW, maxH, keepAspect);

    const canvas = document.createElement('canvas');
    canvas.width = dstW;
    canvas.height = dstH;
    const ctx = canvas.getContext('2d');

    if (willLoseAlpha) {
        // fill with white to avoid black background where transparent
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(originalImg, 0, 0, dstW, dstH);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, targetType, q));
    if (!blob) {
        alert('Compression failed. Try different settings.');
        return;
    }

    // Revoke previous
    if (compressedURL) {
        URL.revokeObjectURL(compressedURL);
    }
    compressedBlob = blob;
    compressedURL = URL.createObjectURL(blob);

    // show preview
    showImageIn(compPreview, compressedURL, dstW, dstH);
    // ensure original display matches compressed size
    if (resizableOrig) {
        resizableOrig.style.width = dstW + 'px';
        resizableOrig.style.height = dstH + 'px';
    }

    // update stats
    infoOriginal.textContent = `Original: ${originalImg.naturalWidth}×${originalImg.naturalHeight}, ${bytesToNice(originalFile.size)}`;
    infoCompressed.textContent = `Compressed: ${dstW}×${dstH}, ${bytesToNice(blob.size)}`;
    const diff = originalFile.size - blob.size;
    const pct = originalFile.size > 0 ? Math.round((diff / originalFile.size) * 100) : 0;
    const sign = diff >= 0 ? 'reduction' : 'increase';
    infoSavings.textContent = `Savings: ${bytesToNice(Math.abs(diff))} (${Math.abs(pct)}% ${sign})`;

    // enable download
    const baseName = (originalFile.name || 'image').replace(/\.[^.]+$/, '');
    const ext = targetType === 'image/png' ? 'png' : 'jpg';
    downloadLink.href = compressedURL;
    downloadLink.download = `${baseName}-compressed.${ext}`;
    setDownloadEnabled(true);
}

function processSelectedFile(f) {
    if (!f) return;
    if (!/^image\/(png|jpeg)$/.test(f.type)) {
        alert('Please select a JPG or PNG image.');
        if (fileInput) fileInput.value = '';
        return;
    }
    originalFile = f;
    loadImage(f).then(img => {
        originalImg = img;
        // show original preview
        const url = URL.createObjectURL(f);
        showImageIn(origPreview, url, img.naturalWidth, img.naturalHeight);

        // set initial width/height inputs to the original image size
        maxWidthEl.value = String(img.naturalWidth);
        maxHeightEl.value = String(img.naturalHeight);
        // Fill initial info
        infoOriginal.textContent = `Original: ${img.naturalWidth}×${img.naturalHeight}, ${bytesToNice(f.size)}`;
        infoCompressed.textContent = 'Compressed: —';
        infoSavings.textContent = 'Savings: —';
        // Enable actions
        compressBtn.disabled = false;
        // Auto-run compression once
        compress();
    }).catch(() => {
        alert('Failed to load image.');
    });
}

function onFileChange() {
    const f = fileInput.files && fileInput.files[0];
    processSelectedFile(f);
}

function onQualityInput() {
    const v = Math.min(100, Math.max(1, parseInt(qualityRange.value, 10) || 80));
    qualityValue.value = v + '%';
}

function debounce(fn, ms) {
    let t;
    return function () {
        clearTimeout(t);
        const args = arguments;
        const ctx = this;
        t = setTimeout(() => fn.apply(ctx, args), ms);
    };
}

function syncResizableFromInputs() {
    if (!resizableComp || !originalImg) return;
    const cr = resizableComp.getBoundingClientRect();

    let w = parseInt(maxWidthEl.value, 10);
    let h = parseInt(maxHeightEl.value, 10);
    const hasW = Number.isFinite(w) && w > 0;
    const hasH = Number.isFinite(h) && h > 0;
    const keepAspect = !!(keepAspectEl && keepAspectEl.checked);

    if (keepAspect && originalImg) {
        const aspect = originalImg.naturalWidth / originalImg.naturalHeight;
        if (hasW && !hasH) h = Math.round(w / aspect);
        else if (hasH && !hasW) w = Math.round(h * aspect);
        else if (!hasW && !hasH) {
            w = originalImg.naturalWidth;
            h = originalImg.naturalHeight;
        } else {
            // both provided: ensure consistency
            h = Math.round(w / aspect);
        }
    } else {
        // no-aspect: respect only what the user set
        if (!hasW) w = Math.max(1, Math.round(cr.width));
        if (!hasH) h = Math.max(1, Math.round(cr.height));
    }

    isProgrammaticResize = true;
    resizableComp.style.width = w + 'px';
    resizableComp.style.height = h + 'px';
    // mirror to original preview size
    if (resizableOrig) {
        resizableOrig.style.width = w + 'px';
        resizableOrig.style.height = h + 'px';
    }
    lastBoxW = w;
    lastBoxH = h;
    // release the guard after layout flush
    requestAnimationFrame(() => {
        isProgrammaticResize = false;
    });
}

function updateResizableAspect() {
    if (!resizableComp) {
        return;
    }
    if (!originalImg) {
        resizableComp.style.aspectRatio = '';
        return;
    }
    const keep = keepAspectEl ? !!keepAspectEl.checked : true;
    resizableComp.style.aspectRatio = keep ? (originalImg.naturalWidth + ' / ' + originalImg.naturalHeight) : '';
}

const debouncedCompress = debounce(() => {
    if (originalFile) compress();
}, 200);

// Events
if (fileInput) fileInput.addEventListener('change', onFileChange);

// Prevent interaction when download link is disabled (accessibility)
if (downloadLink) {
    downloadLink.addEventListener('click', (e) => {
        if (downloadLink.hasAttribute('disabled') || downloadLink.getAttribute('aria-disabled') === 'true') {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// Use Original preview as uploader (click and drag-drop)
if (origPreview) {
    origPreview.addEventListener('click', () => {
        if (fileInput) fileInput.click();
    });
    origPreview.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (fileInput) fileInput.click();
        }
    });
    const setDrag = (on) => {
        if (on) origPreview.classList.add('dragover'); else origPreview.classList.remove('dragover');
    };
    ['dragenter','dragover'].forEach(type => {
        origPreview.addEventListener(type, (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDrag(true);
        });
    });
    ['dragleave','dragend','drop'].forEach(type => {
        origPreview.addEventListener(type, (e) => {
            if (type !== 'drop') setDrag(false);
        });
    });
    origPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDrag(false);
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || !files.length) return;
        const f = files[0];
        processSelectedFile(f);
    });
}

qualityRange.addEventListener('input', () => {
    onQualityInput();
});
qualityRange.addEventListener('change', debounce(() => {
    if (originalFile) compress();
}, 150));
formatSel.addEventListener('change', () => {
    if (originalFile) compress();
});
const onDimInput = () => {
    syncResizableFromInputs();
    debouncedCompress();
};
maxWidthEl.addEventListener('input', onDimInput);
maxWidthEl.addEventListener('change', onDimInput);
maxHeightEl.addEventListener('input', onDimInput);
maxHeightEl.addEventListener('change', onDimInput);
if (keepAspectEl) {
    keepAspectEl.addEventListener('change', () => {
        updateResizableAspect();
        syncResizableFromInputs();
        debouncedCompress();
    });
}
compressBtn.addEventListener('click', () => {
    compress();
});

// Initialize
onQualityInput();
setDownloadEnabled(false);
