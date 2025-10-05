// Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewCanvas = document.getElementById('previewCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');
const noPreview = document.getElementById('noPreview');
const btnOcr = document.getElementById('btnOcr');
const btnClear = document.getElementById('btnClear');
const btnCamera = document.getElementById('btnCamera');
const langSelect = document.getElementById('langSelect');
const boxesCheck = document.getElementById('boxesCheck');
const progBar = document.getElementById('progBar');
const statusText = document.getElementById('statusText');
const statusPercent = document.getElementById('statusPercent');
const outText = document.getElementById('outText');
const btnDownloadTxt = document.getElementById('btnDownloadTxt');
const backToTop = document.getElementById('backToTop');

const pageControls = document.getElementById('pageControls');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageLabel = document.getElementById('currentPage');
const totalPagesLabel = document.getElementById('totalPages');

// Multi-page state
let currentImages = [];
let currentPageIndex = 0;
let currentOcrResults = [];

// Draw image to canvas
function drawImageToCanvas(img, canvas) {
  const ctx = canvas.getContext('2d');
  const maxW = 1200, maxH = 1200;
  let w = img.width || img.naturalWidth;
  let h = img.height || img.naturalHeight;
  const ratio = Math.min(maxW / w, maxH / h, 1);
  const cw = Math.round(w * ratio);
  const ch = Math.round(h * ratio);
  canvas.width = cw;
  canvas.height = ch;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, 0, 0, cw, ch);
}

// Show page in preview
function showPreviewFromDataUrl(dataUrl) {
  const img = new Image();
  img.onload = () => {
    drawImageToCanvas(img, previewCanvas);
    previewCanvas.style.display = 'block';
    overlayCanvas.style.display = 'block';
    overlayCanvas.width = previewCanvas.width;
    overlayCanvas.height = previewCanvas.height;
    noPreview.style.display = 'none';
  };
  img.src = dataUrl;
}

// Show specific page by index
function showPage(index) {
  if (!currentImages.length) return;
  currentPageIndex = index;
  showPreviewFromDataUrl(currentImages[index]);
  currentPageLabel.textContent = index + 1;
  totalPagesLabel.textContent = currentImages.length;
  pageControls.style.display = currentImages.length > 1 ? 'flex' : 'none';
  // Display OCR result if available
  if (currentOcrResults[index]) {
    outText.value = currentOcrResults[index].text;
    drawBoxes(currentOcrResults[index].words);
  } else {
    outText.value = '';
    overlayCanvas.getContext('2d').clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
}

// Draw OCR bounding boxes
function drawBoxes(words) {
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  if (!boxesCheck.checked || !words || !words.length) return;
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,0,80,0.75)';
  ctx.fillStyle = 'rgba(255,0,80,0.12)';
  words.forEach(w => {
    const x = w.bbox ? w.bbox.x0 : w.x0 || w.left || 0;
    const y = w.bbox ? w.bbox.y0 : w.y0 || w.top || 0;
    const wth = (w.bbox ? (w.bbox.x1 - w.bbox.x0) : (w.x1 ? (w.x1 - w.x0) : w.width || w.w)) || 0;
    const hth = (w.bbox ? (w.bbox.y1 - w.bbox.y0) : (w.y1 ? (w.y1 - w.y0) : w.height || w.h)) || 0;
    ctx.strokeRect(x, y, wth, hth);
    ctx.fillRect(x, y, wth, hth);
  });
}

// Drag and drop
['dragenter', 'dragover'].forEach(evt => {
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add('dragover') });
});
['dragleave', 'drop'].forEach(evt => {
  dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove('dragover') });
});

// dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('drop', async (e) => {
  const f = e.dataTransfer.files[0];
  if (f) await handleFile(f);
});
fileInput.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (f) await handleFile(f);
  fileInput.value = '';
});

// Clear everything
btnClear.addEventListener('click', () => {
  previewCanvas.style.display = 'none';
  overlayCanvas.style.display = 'none';
  noPreview.style.display = 'block';
  outText.value = '';
  currentImages = [];
  currentOcrResults = [];
  currentPageIndex = 0;
  pageControls.style.display = 'none';
  btnDownloadTxt.disabled = true;
  progBar.style.width = '0%';
  statusText.textContent = 'Idle';
  statusPercent.textContent = '0%';
});

// Camera capture
btnCamera.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.createElement('video');
    video.style.display = 'none';
    document.body.appendChild(video);
    video.autoplay = true;
    video.playsInline = true;
    video.srcObject = stream;
    await new Promise(r => video.onloadedmetadata = r);
    video.play();
    const ok = confirm('Position the camera then press OK to capture (camera will stop after capture).');
    if (!ok) {
      stream.getTracks().forEach(t => t.stop());
      document.body.removeChild(video);
      return;
    }
    const w = video.videoWidth, h = video.videoHeight;
    previewCanvas.width = w;
    previewCanvas.height = h;
    overlayCanvas.width = w;
    overlayCanvas.height = h;
    const ctx = previewCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    previewCanvas.style.display = 'block';
    overlayCanvas.style.display = 'block';
    noPreview.style.display = 'none';
    currentImages = [previewCanvas.toDataURL('image/png')];
    currentPageIndex = 0;
    currentOcrResults = [];
    pageControls.style.display = 'none';
    stream.getTracks().forEach(t => t.stop());
    document.body.removeChild(video);
  } catch (err) { alert('Camera capture failed: ' + err.message); }
});

// Handle files (image or PDF)
async function handleFile(file) {
  const type = file.type;
  currentImages = [];
  currentOcrResults = [];
  if (type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const ctx = tempCanvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        currentImages.push(tempCanvas.toDataURL('image/png'));
      }
      showPage(0);
    } catch (err) { alert('PDF rendering failed: ' + err.message); }
  } else {
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentImages = [ev.target.result];
      showPage(0);
    };
    reader.readAsDataURL(file);
  }
}

// Run OCR on current page
async function runOcr() {
  if (!currentImages.length) { alert('Please upload or capture an image/PDF first.'); return; }
  btnOcr.disabled = true;
  statusText.textContent = 'Initializing OCR...'; progBar.style.width = '2%'; statusPercent.textContent = '0%';
  const lang = langSelect.value || 'eng';
  const worker = Tesseract.createWorker({
    logger: m => {
      if (m.status) statusText.textContent = m.status;
      const pct = Math.round((m.progress || 0) * 100);
      progBar.style.width = pct + '%';
      statusPercent.textContent = pct + '%';
    }
  });

  try {
    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);

    statusText.textContent = `Recognizing page ${currentPageIndex + 1}...`;
    const { data } = await worker.recognize(currentImages[currentPageIndex]);
    currentOcrResults[currentPageIndex] = { text: data.text, words: data.words };
    outText.value = data.text;

    drawBoxes(data.words);
    btnDownloadTxt.disabled = false;

  } catch (err) { console.error(err); alert('OCR failed: ' + err.message); }
  finally {
    await worker.terminate();
    btnOcr.disabled = false;
    statusText.textContent = 'Done';
    progBar.style.width = '100%';
    statusPercent.textContent = '100%';
  }
}

// Page navigation
prevPageBtn.addEventListener('click', () => { if (currentPageIndex > 0) showPage(currentPageIndex - 1); });
nextPageBtn.addEventListener('click', () => { if (currentPageIndex < currentImages.length - 1) showPage(currentPageIndex + 1); });

btnOcr.addEventListener('click', runOcr);

btnDownloadTxt.addEventListener('click', () => {
  const blob = new Blob([outText.value], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ocr-text.txt';
  a.click();
});

// Back to top button
window.addEventListener('scroll', () => {
  if (window.scrollY > 160) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
});
backToTop.addEventListener('click', () => { document.documentElement.scrollTo({ top: 0, behavior: 'smooth' }); });

dropZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

// Update boxes when toggled
boxesCheck.addEventListener('change', () => {
  if (currentOcrResults[currentPageIndex]) drawBoxes(currentOcrResults[currentPageIndex].words);
});

progBar.style.width = '0%';
statusPercent.textContent = '0%';

// Initial pageControls UI fix
pageControls.style.display = 'none';