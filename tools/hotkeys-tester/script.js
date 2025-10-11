// Hotkeys tester - captures and displays complex shortcuts
const shortcutEl = document.getElementById('shortcut');
const recentEl = document.getElementById('recent');
const clearBtn = document.getElementById('clear');
const copyBtn = document.getElementById('copy');

let recent = [];

function formatCombo(e) {
  const keys = [];
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.altKey) keys.push('Alt');
  if (e.shiftKey) keys.push('Shift');
  if (e.metaKey) keys.push('Meta');

  // Use key if it's not a modifier
  const k = e.key;
  if (!['Control','Shift','Alt','Meta'].includes(k)) {
    // Normalize single char to uppercase
    keys.push(k.length === 1 ? k.toUpperCase() : k);
  }
  return keys.join('+');
}

window.addEventListener('keydown', (e) => {
  // Prevent browser's default actions for some combos during testing (but keep common ones)
  // We'll not prevent default broadly to avoid breaking browser shortcuts in normal use.

  const combo = formatCombo(e);
  if (!combo) return;

  // show
  shortcutEl.textContent = combo;

  // push to recent (deduplicate if same as last)
  if (recent[0] !== combo) {
    recent.unshift(combo);
    if (recent.length > 20) recent.pop();
    renderRecent();
  }
});

function renderRecent(){
  recentEl.innerHTML = '';
  recent.forEach((c,i)=>{
    const div = document.createElement('div');
    div.className = 'recent-item';
    div.innerHTML = `<span>${c}</span><button class="btn btn-secondary" data-copy="${c}">Copy</button>`;
    recentEl.appendChild(div);
  });
}

clearBtn.addEventListener('click', ()=>{ recent = []; renderRecent(); shortcutEl.textContent = 'Press any keys...'; });

copyBtn.addEventListener('click', ()=>{ navigator.clipboard.writeText(shortcutEl.textContent).catch(()=>{}); });

recentEl.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-copy]');
  if (!btn) return;
  const txt = btn.getAttribute('data-copy');
  navigator.clipboard.writeText(txt).catch(()=>{});
});

// init
renderRecent();
