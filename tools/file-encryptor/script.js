const encFileInput = document.getElementById('encFile');
const encDrop = document.getElementById('encDrop');
const encBrowse = document.getElementById('encBrowse');
const encFileName = document.getElementById('encFileName');
const encPassword = document.getElementById('encPassword');
const toggleEncPass = document.getElementById('toggleEncPass');
const encryptBtn = document.getElementById('encryptBtn');
const clearEnc = document.getElementById('clearEnc');
const encStatus = document.getElementById('encStatus');
const encResult = document.getElementById('encResult');
const downloadEnc = document.getElementById('downloadEnc');

const decFileInput = document.getElementById('decFile');
const decDrop = document.getElementById('decDrop');
const decBrowse = document.getElementById('decBrowse');
const decFileName = document.getElementById('decFileName');
const decPassword = document.getElementById('decPassword');
const toggleDecPass = document.getElementById('toggleDecPass');
const decryptBtn = document.getElementById('decryptBtn');
const clearDec = document.getElementById('clearDec');
const decStatus = document.getElementById('decStatus');
const decResult = document.getElementById('decResult');
const downloadDec = document.getElementById('downloadDec');

// Advanced options (hidden menu)
const advIterationsEl = document.getElementById('advIterations');
const advKeyLenEl = document.getElementById('advKeyLen');
const advIvLenEl = document.getElementById('advIvLen');

const PBKDF2_ITERATIONS = 250000; // default iterations
const KEY_LENGTH = 256; // bits (default)
const GCM_IV_LENGTH = 12; // bytes (96 bits) recommended (default)

function toBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr.buffer;
}

async function deriveKey(password, salt, iterations = PBKDF2_ITERATIONS, keyLength = KEY_LENGTH) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        {name: 'PBKDF2'},
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256'
        },
        keyMaterial,
        {name: 'AES-GCM', length: keyLength},
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptFile(file, password, opts = {}) {
    const iterations = Number(opts.iterations) || PBKDF2_ITERATIONS;
    const keyLength = Number(opts.keyLength) || KEY_LENGTH;
    const ivLength = Number(opts.ivLength) || GCM_IV_LENGTH;

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(ivLength));
    const key = await deriveKey(password, salt, iterations, keyLength);
    const data = new Uint8Array(await file.arrayBuffer());

    const cipherBuf = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, data);

    const payload = {
        v: 1,
        algo: 'AES-GCM',
        kdf: 'PBKDF2-SHA256',
        iterations,
        keyLength,
        ivLength,
        salt: toBase64(salt),
        iv: toBase64(iv),
        mime: file.type || 'application/octet-stream',
        name: file.name || 'file',
        ciphertext: toBase64(new Uint8Array(cipherBuf))
    };
    const json = JSON.stringify(payload);
    const blob = new Blob([json], {type: 'application/json'});
    const outName = file.name + '.enc';
    return {blob, filename: outName};
}

async function decryptFile(file, password) {
// Read JSON
    let text;
    if (file.type.startsWith('application/') || file.type.startsWith('text/')) {
        text = await file.text();
    } else {
        // Still try to parse as text
        text = await file.text();
    }

    let payload;
    try {
        payload = JSON.parse(text);
    } catch (e) {
        throw new Error('Invalid encrypted file format (not JSON)');
    }

    if (!payload || payload.v !== 1 || payload.algo !== 'AES-GCM') {
        throw new Error('Unsupported encrypted file format');
    }

    const salt = new Uint8Array(fromBase64(payload.salt));
    const iv = new Uint8Array(fromBase64(payload.iv));
    const ciphertext = new Uint8Array(fromBase64(payload.ciphertext));
    const iterations = Number(payload.iterations) || PBKDF2_ITERATIONS;
    const keyLength = Number(payload.keyLength) || KEY_LENGTH;

    const key = await deriveKey(password, salt, iterations, keyLength);
    let plainBuf;
    try {
        plainBuf = await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, ciphertext);
    } catch (e) {
        throw new Error('Decryption failed. Wrong password or corrupted file.');
    }

    const blob = new Blob([plainBuf], {type: payload.mime || 'application/octet-stream'});
    const outName = payload.name || 'decrypted.bin';
    return {blob, filename: outName};
}

// UI helpers
function setupDrop(dropEl, inputEl, nameEl) {
    ['dragenter', 'dragover'].forEach(evt => dropEl.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropEl.classList.add('drag');
    }));
    ['dragleave', 'drop'].forEach(evt => dropEl.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropEl.classList.remove('drag');
    }));
    dropEl.addEventListener('drop', e => {
        const files = e.dataTransfer?.files;
        if (files && files.length) {
            inputEl.files = files;
            nameEl.textContent = files[0].name + ` (${(files[0].size / 1024).toFixed(1)} KB)`;
        }
    });
    dropEl.addEventListener('click', () => inputEl.click());
}

function setStatus(el, msg, type) {
    el.textContent = msg || '';
    el.classList.remove('success', 'error');
    if (type) el.classList.add(type);
}

function togglePassword(buttonEl, inputEl) {
    if (inputEl.type === 'password') {
        inputEl.type = 'text';
        buttonEl.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        inputEl.type = 'password';
        buttonEl.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
}

function blobDownloadLink(blob, filename, anchor) {
    const url = URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = filename;
    anchor.addEventListener('click', () => {
        // revoke shortly after click
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, {once: true});
}

function readAdvancedOptions() {
    const iterations = advIterationsEl ? Number(advIterationsEl.value) : PBKDF2_ITERATIONS;
    const keyLength = advKeyLenEl ? Number(advKeyLenEl.value) : KEY_LENGTH;
    const ivLength = advIvLenEl ? Number(advIvLenEl.value) : GCM_IV_LENGTH;

// Validation
    if (!Number.isFinite(iterations) || iterations < 10000) {
        throw new Error('PBKDF2 iterations must be a number of at least 10,000.');
    }
    if (![128, 192, 256].includes(keyLength)) {
        throw new Error('Key length must be 128, 192, or 256 bits.');
    }
    if (!Number.isFinite(ivLength) || ivLength < 12 || ivLength > 32) {
        throw new Error('GCM IV length must be between 12 and 32 bytes.');
    }
    return {iterations: Math.round(iterations), keyLength, ivLength: Math.round(ivLength)};
}

// Wire up Encrypt panel
setupDrop(encDrop, encFileInput, encFileName);
encBrowse.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    encFileInput.click();
});
encFileInput.addEventListener('change', () => {
    const f = encFileInput.files?.[0];
    encFileName.textContent = f ? `${f.name} (${(f.size / 1024).toFixed(1)} KB)` : 'No file selected';
});

toggleEncPass.addEventListener('click', () => togglePassword(toggleEncPass, encPassword));

encryptBtn.addEventListener('click', async () => {
    encResult.style.display = 'none';
    const file = encFileInput.files?.[0];
    if (!file) {
        setStatus(encStatus, 'Please select a file to encrypt.', 'error');
        return;
    }
    const pwd = encPassword.value || '';
    if (pwd.length < 6) {
        setStatus(encStatus, 'Please enter a longer password (at least 6 characters).', 'error');
        return;
    }

    let opts;
    try {
        opts = readAdvancedOptions();
    } catch (e) {
        setStatus(encStatus, e.message || 'Invalid advanced options.', 'error');
        return;
    }

    encryptBtn.disabled = true;
    clearEnc.disabled = true;
    setStatus(encStatus, 'Encrypting... this may take a moment for large files.');
    try {
        const {blob, filename} = await encryptFile(file, pwd, opts);
        blobDownloadLink(blob, filename, downloadEnc);
        encResult.style.display = 'block';
        setStatus(encStatus, 'Encryption successful!', 'success');
    } catch (e) {
        console.error(e);
        setStatus(encStatus, e.message || 'Encryption failed.', 'error');
    } finally {
        encryptBtn.disabled = false;
        clearEnc.disabled = false;
    }
});

clearEnc.addEventListener('click', () => {
    encFileInput.value = '';
    encPassword.value = '';
    encFileName.textContent = 'No file selected';
    encResult.style.display = 'none';
    setStatus(encStatus, '');
});

// Wire up Decrypt panel
setupDrop(decDrop, decFileInput, decFileName);
decBrowse.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    decFileInput.click();
});
decFileInput.addEventListener('change', () => {
    const f = decFileInput.files?.[0];
    decFileName.textContent = f ? `${f.name} (${(f.size / 1024).toFixed(1)} KB)` : 'No file selected';
});

toggleDecPass.addEventListener('click', () => togglePassword(toggleDecPass, decPassword));

decryptBtn.addEventListener('click', async () => {
    decResult.style.display = 'none';
    const file = decFileInput.files?.[0];
    if (!file) {
        setStatus(decStatus, 'Please select an encrypted file (.enc).', 'error');
        return;
    }
    const pwd = decPassword.value || '';
    if (!pwd) {
        setStatus(decStatus, 'Please enter the password.', 'error');
        return;
    }

    decryptBtn.disabled = true;
    clearDec.disabled = true;
    setStatus(decStatus, 'Decrypting...');
    try {
        const {blob, filename} = await decryptFile(file, pwd);
        blobDownloadLink(blob, filename, downloadDec);
        decResult.style.display = 'block';
        setStatus(decStatus, 'Decryption successful!', 'success');
    } catch (e) {
        console.error(e);
        setStatus(decStatus, e.message || 'Decryption failed.', 'error');
    } finally {
        decryptBtn.disabled = false;
        clearDec.disabled = false;
    }
});

clearDec.addEventListener('click', () => {
    decFileInput.value = '';
    decPassword.value = '';
    decFileName.textContent = 'No file selected';
    decResult.style.display = 'none';
    setStatus(decStatus, '');
});
