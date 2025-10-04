const txt = document.getElementById('qrText');
const sizeSel = document.getElementById('qrSize');
const eccSel = document.getElementById('qrEcc');
const marginSel = document.getElementById('qrMargin');
const darkInput = document.getElementById('qrDark');
const lightInput = document.getElementById('qrLight');
const canvas = document.getElementById('qrCanvas');
const genBtn = document.getElementById('generateBtn');
const dlBtn = document.getElementById('downloadBtn');
const clrBtn = document.getElementById('clearBtn');
const metaVersion = document.getElementById('metaVersion');
const metaModules = document.getElementById('metaModules');
const metaEcc = document.getElementById('metaEcc');
const metaSize = document.getElementById('metaSize');

let qrRetryScheduled = false;

function clampText(s){
if(!s) return '';
const max = 2953; // approx max bytes for QR 40-L for alphanumeric
return s.length > max ? s.slice(0,max) : s;
}

function blankCanvas(size, message){
const ctx = canvas.getContext('2d');
canvas.width = size; canvas.height = size;
ctx.fillStyle = '#222'; ctx.fillRect(0,0,size,size);
ctx.fillStyle = '#999';
ctx.font = '14px Poppins, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(message || 'Enter text and click Generate', size/2, size/2);
}

function estimateFromOffscreen(off){
let modules = '—';
try {
  const offCtx = off.getContext('2d');
  const data = offCtx.getImageData(0,0,off.width, off.height).data;
  let firstDarkAt = -1;
  for(let x=0;x<off.width;x++){
    const i = (x*4);
    const r = data[i], g = data[i+1], b = data[i+2];
    const isDark = (r+g+b) < 384; // threshold
    if(isDark){ firstDarkAt = x; break; }
  }
  if(firstDarkAt>=0){
    let w = 0;
    for(let x=firstDarkAt;x<off.width;x++){
      const i = (x*4);
      const r = data[i], g = data[i+1], b = data[i+2];
      const isDark = (r+g+b) < 384;
      if(isDark) w++; else break;
    }
    if(w>0){ modules = Math.round(off.width / w); }
  }
} catch(e){ /* ignore */ }
return modules;
}

function drawQRCode(text, size, innerSize, margin, dark, light, eccKey){
const QR = window.QRCode;
// Create offscreen container and generate QR using qrcodejs
const holder = document.createElement('div');
// Not adding to DOM avoids reflow; qrcodejs still renders into the element
const level = (QR.CorrectLevel && QR.CorrectLevel[eccKey]) || (QR.CorrectLevel && QR.CorrectLevel.M) || 1;
try {
  new QR(holder, {
    text: text,
    width: innerSize,
    height: innerSize,
    colorDark: dark,
    colorLight: light,
    correctLevel: level
  });
} catch(e){
  // Fallback error rendering
  const ctx = canvas.getContext('2d');
  canvas.width = size; canvas.height = size;
  ctx.fillStyle = '#330000'; ctx.fillRect(0,0,size,size);
  ctx.fillStyle = '#ffb3b3';
  ctx.font = '14px Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Failed to generate QR code', size/2, size/2);
  if(dlBtn) dlBtn.disabled = true;
  if(metaVersion) metaVersion.textContent = 'Version: —';
  if(metaModules) metaModules.textContent = 'Modules: —';
  if(metaEcc) metaEcc.textContent = 'ECC: ' + eccKey;
  if(metaSize) metaSize.textContent = `Size: ${size}×${size}`;
  return;
}

// Retrieve generated node (canvas or img)
let node = holder.querySelector('canvas') || holder.querySelector('img');
const finalize = (imgOrCanvas)=>{
  const ctx = canvas.getContext('2d');
  canvas.width = size; canvas.height = size;
  ctx.fillStyle = light; ctx.fillRect(0,0,size,size);
  ctx.drawImage(imgOrCanvas, margin, margin, innerSize, innerSize);
  if(dlBtn) dlBtn.disabled = false;
  // For modules estimation, ensure we have a canvas
  let off = imgOrCanvas;
  if(off.tagName && off.tagName.toLowerCase() === 'img'){
    const temp = document.createElement('canvas');
    temp.width = innerSize; temp.height = innerSize;
    const tctx = temp.getContext('2d');
    tctx.drawImage(imgOrCanvas, 0, 0, innerSize, innerSize);
    off = temp;
  }
  const modules = estimateFromOffscreen(off);
  if(metaVersion) metaVersion.textContent = 'Version: ' + (modules !== '—' ? estimateVersion(modules) : '—');
  if(metaModules) metaModules.textContent = 'Modules: ' + modules;
  if(metaEcc) metaEcc.textContent = 'ECC: ' + eccKey;
  if(metaSize) metaSize.textContent = `Size: ${size}×${size}`;
};

if(node){
  if(node.tagName.toLowerCase() === 'img'){
    if(node.complete){
      finalize(node);
    } else {
      node.onload = function(){ finalize(node); };
      node.onerror = function(){
        blankCanvas(size, 'Failed to render QR image');
        if(dlBtn) dlBtn.disabled = true;
      };
    }
  } else {
    finalize(node);
  }
} else {
  blankCanvas(size, 'QR generation failed');
  if(dlBtn) dlBtn.disabled = true;
}
}

function drawQR(){
const text = clampText((txt && txt.value ? txt.value : '').trim());
const size = parseInt(sizeSel && sizeSel.value ? sizeSel.value : '256',10);
const eccKey = (eccSel && eccSel.value) || 'M';
const margin = parseInt(marginSel && marginSel.value ? marginSel.value : '4',10);
const dark = (darkInput && darkInput.value) || '#000000';
const light = (lightInput && lightInput.value) || '#ffffff';

if(!window.QRCode){
  blankCanvas(size, 'QR code library not loaded');
  if(dlBtn) dlBtn.disabled = true;
  if(metaVersion) metaVersion.textContent = 'Version: —';
  if(metaModules) metaModules.textContent = 'Modules: —';
  if(metaEcc) metaEcc.textContent = 'ECC: ' + eccKey;
  if(metaSize) metaSize.textContent = `Size: ${size}×${size}`;
  if(!qrRetryScheduled){
    window.addEventListener('load', function(){ qrRetryScheduled=false; drawQR(); }, { once: true });
    qrRetryScheduled = true;
  }
  return;
}

if(!text){
  blankCanvas(size);
  if(dlBtn) dlBtn.disabled = true;
  if(metaVersion) metaVersion.textContent = 'Version: —';
  if(metaModules) metaModules.textContent = 'Modules: —';
  if(metaEcc) metaEcc.textContent = 'ECC: ' + eccKey;
  if(metaSize) metaSize.textContent = `Size: ${size}×${size}`;
  return;
}

const innerSize = Math.max(0, size - (margin*2));

if (typeof window.QRCode === 'function' && window.QRCode.CorrectLevel){
  drawQRCode(text, size, innerSize, margin, dark, light, eccKey);
} else {
  blankCanvas(size, 'Unsupported QR library');
  if(dlBtn) dlBtn.disabled = true;
}
}

function estimateVersion(modules){
// modules = 21 + 4*(version-1)
if(typeof modules !== 'number') return '—';
const v = Math.round((modules - 21)/4 + 1);
if(v >= 1 && v <= 40) return v;
return '—';
}

function downloadPNG(){
const url = canvas.toDataURL('image/png');
const a = document.createElement('a');
a.href = url;
a.download = 'qr-code.png';
document.body.appendChild(a);
a.click();
a.remove();
}

function clearAll(){
if(txt) txt.value = '';
drawQR();
}

if(genBtn) genBtn.addEventListener('click', drawQR);
if(dlBtn) dlBtn.addEventListener('click', downloadPNG);
if(clrBtn) clrBtn.addEventListener('click', clearAll);
if(sizeSel) sizeSel.addEventListener('change', drawQR);
if(eccSel) eccSel.addEventListener('change', drawQR);
if(marginSel) marginSel.addEventListener('change', drawQR);
if(darkInput) darkInput.addEventListener('change', drawQR);
if(lightInput) lightInput.addEventListener('change', drawQR);

// initial state
drawQR();