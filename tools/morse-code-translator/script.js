// Morse translator logic

// Mapping table: letters, numbers and common punctuation -> Morse
const MORSE_MAP = {
  "A": ".-",    "B": "-...",  "C": "-.-.",  "D": "-..",
  "E": ".",     "F": "..-.",  "G": "--.",   "H": "....",
  "I": "..",    "J": ".---",  "K": "-.-",   "L": ".-..",
  "M": "--",    "N": "-.",    "O": "---",   "P": ".--.",
  "Q": "--.-",  "R": ".-.",   "S": "...",   "T": "-",
  "U": "..-",   "V": "...-",  "W": ".--",   "X": "-..-",
  "Y": "-.--",  "Z": "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
  "!": "-.-.--", "/": "-..-.",  "(": "-.--.",  ")": "-.--.-",
  "&": ".-...",  ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.",  "-": "-....-", "_": "..--.-", "\"": ".-..-.",
  "$": "...-..-","@": ".--.-.", "¿": "..-.-", "¡": "--...-"
};

// Create reverse map
const TEXT_MAP = {};
Object.keys(MORSE_MAP).forEach(k => { TEXT_MAP[MORSE_MAP[k]] = k; });

// DOM
const btnTextToMorse = document.getElementById('btnTextToMorse');
const btnMorseToText = document.getElementById('btnMorseToText');
const liveToggle = document.getElementById('liveToggle');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyBtn');
const clearInput = document.getElementById('clearInput');
const pasteBtn = document.getElementById('pasteBtn');
const downloadBtn = document.getElementById('downloadBtn');

let direction = 'text-to-morse'; // default

// Utilities
function setActiveButton() {
  if (direction === 'text-to-morse') {
    btnTextToMorse.classList.add('active');
    btnTextToMorse.setAttribute('aria-pressed','true');
    btnMorseToText.classList.remove('active');
    btnMorseToText.setAttribute('aria-pressed','false');
    inputText.placeholder = "Type plain text here (letters, digits, punctuation)...";
  } else {
    btnMorseToText.classList.add('active');
    btnMorseToText.setAttribute('aria-pressed','true');
    btnTextToMorse.classList.remove('active');
    btnTextToMorse.setAttribute('aria-pressed','false');
    inputText.placeholder = "Type Morse here (use . and -; separate letters by space, words by / )...";
  }
}
setActiveButton();

// Normalise spaces in Morse input
function normalizeMorse(morse) {
  // replace multiple spaces with single, trim, ensure words separated by slash
  return morse.replace(/\s+/g, ' ').trim();
}

// Convert text -> morse
function textToMorse(text) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  const outWords = words.map(word => {
    const letters = word.split('');
    const morseLetters = letters.map(ch => {
      const up = ch.toUpperCase();
      if (MORSE_MAP[up]) return MORSE_MAP[up];
      // If character not in map, return '?'
      return '?';
    });
    return morseLetters.join(' ');
  });
  return outWords.join(' / ');
}

// Convert morse -> text
function morseToText(morse) {
  if (!morse) return '';
  morse = normalizeMorse(morse);
  const words = morse.split(' / ');
  const outWords = words.map(word => {
    const letters = word.split(' ');
    const outLetters = letters.map(sym => {
      if (sym === '') return ''; // ignore empty
      if (TEXT_MAP[sym]) return TEXT_MAP[sym];
      return '?';
    });
    return outLetters.join('');
  });
  return outWords.join(' ');
}

// Handlers
function performConversion() {
  const input = inputText.value;
  if (direction === 'text-to-morse') {
    outputText.value = textToMorse(input);
  } else {
    outputText.value = morseToText(input);
  }
}

convertBtn.addEventListener('click', performConversion);

// Live translation
inputText.addEventListener('input', () => {
  if (liveToggle.checked) {
    performConversion();
  }
});

// Toggle direction buttons
btnTextToMorse.addEventListener('click', () => {
  direction = 'text-to-morse';
  setActiveButton();
  if (liveToggle.checked) performConversion();
});
btnMorseToText.addEventListener('click', () => {
  direction = 'morse-to-text';
  setActiveButton();
  if (liveToggle.checked) performConversion();
});

// Copy result
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputText.value);
    const old = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
    copyBtn.disabled = true;
    setTimeout(() => { copyBtn.innerHTML = old; copyBtn.disabled = false; }, 1500);
  } catch (e) {
    alert('Unable to copy. Use browser clipboard permissions.');
  }
});

// Clear input
clearInput.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
  inputText.focus();
});

// Paste from clipboard into input (best-effort)
pasteBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    if (liveToggle.checked) performConversion();
  } catch (e) {
    alert('Unable to read clipboard. Check permissions.');
  }
});

// Download output as text file
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([outputText.value], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = direction === 'text-to-morse' ? 'morse.txt' : 'text.txt';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Keyboard: Ctrl+Enter to convert
inputText.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    performConversion();
  }
});

// Initialize an example to help testers (optional)
if (!localStorage.getItem('morse-first-run-done')) {
  inputText.value = "Hello World";
  performConversion();
  localStorage.setItem('morse-first-run-done', '1');
}
