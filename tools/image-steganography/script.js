(function(){
  const fileInput = document.getElementById('fileInput');
  const dropArea = document.getElementById('dropArea');
  const stegCard = document.getElementById('stegCard');
  const originalPreview = document.getElementById('originalPreview');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const messageEl = document.getElementById('message');
  const outputEl = document.getElementById('output');
  const imgMeta = document.getElementById('imgMeta');
  const capacityInfo = document.getElementById('capacityInfo');

  const encodeBtn = document.getElementById('encodeBtn');
  const decodeBtn = document.getElementById('decodeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');

  let img = new Image();
  let imgLoaded = false;
  let lastEncoded = false;

  function bytesToBits(bytes){
    const bits = [];
    for(let i=0;i<bytes.length;i++){
      for(let b=7;b>=0;b--){
        bits.push((bytes[i] >> b) & 1);
      }
    }
    return bits;
  }

  function bitsToBytes(bits){
    const len = Math.ceil(bits.length/8);
    const out = new Uint8Array(len);
    for(let i=0;i<len;i++){
      let val = 0;
      for(let b=0;b<8;b++){
        const bit = bits[i*8+b] ?? 0;
        val = (val<<1) | (bit & 1);
      }
      out[i]=val;
    }
    return out;
  }

  function updateCapacityInfo(){
    if(!imgLoaded){ capacityInfo.textContent = ""; return; }
    const width = canvas.width;
    const height = canvas.height;
    const totalPixels = width * height;
    const capacityBits = totalPixels * 3; // using R,G,B channels
    const headerBits = 32; // message length header in bits

    const enc = new TextEncoder();
    const msgBytes = enc.encode(messageEl.value || "");
    const neededBits = headerBits + msgBytes.length * 8;

    const capacityChars = Math.floor((capacityBits - headerBits)/8);

    let note = `Capacity: ${capacityChars.toLocaleString()} characters (UTF-8), Image ${width}×${height}.`;
    if(neededBits <= capacityBits){
      capacityInfo.innerHTML = `<span class="capacity-ok">OK</span> • ${note}`;
      encodeBtn.disabled = false;
    } else {
      const deficit = Math.ceil((neededBits - capacityBits)/8);
      capacityInfo.innerHTML = `<span class="capacity-bad">Message too large</span> • Reduce by ~${deficit.toLocaleString()} chars or use a larger image. ${note}`;
      encodeBtn.disabled = true;
    }
  }

  function resetAll(){
    // Remove src attribute entirely to avoid browser broken-image icon
    originalPreview.removeAttribute('src');
    imgMeta.textContent = '';
    canvas.width = 0; canvas.height = 0;
    capacityInfo.textContent = '';
    messageEl.value = '';
    outputEl.value = '';
    encodeBtn.disabled = true;
    decodeBtn.disabled = true;
    downloadBtn.disabled = true;
    fileInput.value = '';
    imgLoaded = false;
    lastEncoded = false;
    if(stegCard) stegCard.classList.add('no-image');
  }

  function handleFiles(files){
    if(!files || !files.length) return;
    const file = files[0];
    if(!file.type.startsWith('image/')){
      alert('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      img = new Image();
      img.onload = () => {
        imgLoaded = true;
        originalPreview.src = e.target.result;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imgMeta.textContent = `${file.name} • ${(file.size/1024).toFixed(1)} KB • ${img.width}×${img.height}`;
        decodeBtn.disabled = false;
        downloadBtn.disabled = false; // allow downloading original drawn as PNG too
        lastEncoded = false;
        if(stegCard) stegCard.classList.remove('no-image');
        updateCapacityInfo();
      };
      img.onerror = () => alert('Failed to load image.');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Drag & drop
  dropArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => handleFiles(e.target.files));
  ;['dragenter','dragover'].forEach(evt => dropArea.addEventListener(evt, e=>{ e.preventDefault(); e.stopPropagation(); dropArea.classList.add('drag-over'); }));
  ;['dragleave','drop'].forEach(evt => dropArea.addEventListener(evt, e=>{ e.preventDefault(); e.stopPropagation(); dropArea.classList.remove('drag-over'); }));
  dropArea.addEventListener('drop', e => handleFiles(e.dataTransfer.files));

  messageEl.addEventListener('input', updateCapacityInfo);

  function encode(){
    if(!imgLoaded){ alert('Load an image first.'); return; }
    const enc = new TextEncoder();
    const msgBytes = enc.encode(messageEl.value || '');

    // Build payload: 4-byte big-endian length + data
    const header = new Uint8Array(4);
    const len = msgBytes.length >>> 0;
    header[0] = (len >>> 24) & 0xFF;
    header[1] = (len >>> 16) & 0xFF;
    header[2] = (len >>> 8) & 0xFF;
    header[3] = (len) & 0xFF;

    const payload = new Uint8Array(4 + msgBytes.length);
    payload.set(header, 0);
    payload.set(msgBytes, 4);

    const bits = bytesToBits(payload);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data; // [r,g,b,a,...]

    const capacityBits = Math.floor(data.length / 4) * 3; // per pixel 3 bits
    if(bits.length > capacityBits){
      alert('Message too large for this image.');
      return;
    }

    for (let a = 3; a < data.length; a += 4) data[a] = 255;

    // write bits into R,G,B LSBs in sequence
    let bi = 0;
    for(let i=0;i<data.length && bi<bits.length;i+=4){
      // R
      data[i] = (data[i] & 0xFE) | (bits[bi++] ?? 0);
      // G
      if(bi<bits.length) data[i+1] = (data[i+1] & 0xFE) | (bits[bi++] ?? 0);
      // B
      if(bi<bits.length) data[i+2] = (data[i+2] & 0xFE) | (bits[bi++] ?? 0);
      // A untouched
    }

    ctx.putImageData(imgData, 0, 0);
    lastEncoded = true;
    downloadBtn.disabled = false;
    alert('Message encoded into image. You can now download the PNG.');
  }

  function decode(){
    if(!imgLoaded){ alert('Load an image first.'); return; }
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // First read 32 bits for length
    const headerBits = [];
    let bi = 0;
    for(let i=0;i<data.length && headerBits.length<32;i+=4){
      headerBits.push(data[i] & 1);
      if(headerBits.length<32) headerBits.push(data[i+1] & 1);
      if(headerBits.length<32) headerBits.push(data[i+2] & 1);
    }
    if(headerBits.length < 32){ alert('Not enough data to read header.'); return; }
    const headerBytes = bitsToBytes(headerBits);
    const msgLen = ((headerBytes[0]<<24) | (headerBytes[1]<<16) | (headerBytes[2]<<8) | (headerBytes[3])) >>> 0;

    const totalMsgBits = msgLen * 8;
    const bits = [];

    // Continue reading bits right after header
    let bitsToSkip = 32; // header bits already consumed
    bi = 0;
    for(let i=0;i<data.length && bits.length<totalMsgBits;i+=4){
      // for each of R,G,B
      const channels = [data[i] & 1, data[i+1] & 1, data[i+2] & 1];
      for(let c=0;c<3;c++){
        if(bitsToSkip>0){ bitsToSkip--; continue; }
        if(bits.length<totalMsgBits){ bits.push(channels[c]); }
      }
    }

    if(bits.length < totalMsgBits){
      alert('Encoded message appears incomplete or image does not contain a valid message.');
      return;
    }

    const msgBytes = bitsToBytes(bits).slice(0, msgLen);
    try{
      const dec = new TextDecoder();
      const text = dec.decode(msgBytes);
      outputEl.value = text;
      if(!text){ alert('Decoded an empty message.'); }
    }catch(err){
      alert('Failed to decode message as UTF-8. Data may be corrupted.');
    }
  }

  function download(){
    if(canvas.width === 0){ alert('Nothing to download.'); return; }
    const link = document.createElement('a');
    link.download = lastEncoded ? 'steganography.png' : 'image.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  encodeBtn.addEventListener('click', encode);
  decodeBtn.addEventListener('click', decode);
  downloadBtn.addEventListener('click', download);
  clearBtn.addEventListener('click', resetAll);
})();