// Word Frequency Analyzer - simple, dependency-free
(function(){
  const input = document.getElementById('inputText');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultsEl = document.getElementById('results');
  const totalWordsEl = document.getElementById('totalWords');
  const uniqueWordsEl = document.getElementById('uniqueWords');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const minLengthInput = document.getElementById('minLength');
  const stopwordMode = document.getElementById('stopwordMode');
  const topNInput = document.getElementById('topN');

  const BASIC_STOPWORDS = new Set(['the','and','is','in','to','a','of','that','it','for','on','with','as','this','by','an','be','are','or','from','at','which','was','but','have','has']);

  function tokenize(text){
    return text
      .toLowerCase()
      .replace(/[\u2018\u2019\u201c\u201d]/g,'')
      .replace(/[^a-z0-9\s'-]/g,' ')
      .split(/\s+/)
      .map(s=>s.replace(/^'+|'+$/g,''))
      .filter(Boolean);
  }

  function analyze(){
    const text = input.value || '';
    const minLen = Math.max(1, parseInt(minLengthInput.value) || 1);
    const topN = Math.max(1, parseInt(topNInput.value) || 20);
    const stopMode = stopwordMode.value;

    const tokens = tokenize(text).filter(w=>w.length>=minLen);
    const freq = new Map();

    for(const w of tokens){
      if(stopMode==='basic' && BASIC_STOPWORDS.has(w)) continue;
      freq.set(w, (freq.get(w)||0)+1);
    }

    const arr = Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const top = arr.slice(0, topN);

    resultsEl.innerHTML = '';
    for(const [word,count] of top){
      const row = document.createElement('div');
      row.className = 'wfa-row';
      row.innerHTML = `<div>${escapeHtml(word)}</div><div>${count}</div>`;
      resultsEl.appendChild(row);
    }

    totalWordsEl.textContent = tokens.length;
    uniqueWordsEl.textContent = freq.size;

    return {arr, top};
  }

  function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]); }

  analyzeBtn.addEventListener('click', analyze);
  input.addEventListener('keydown', function(e){ if(e.ctrlKey && e.key==='Enter') analyze(); });

  copyBtn.addEventListener('click', function(){
    const {arr} = analyze();
    if(!arr || arr.length===0) return;
    const csv = ['word,count', ...arr.map(([w,c])=>`${w},${c}`)].join('\n');
    navigator.clipboard.writeText(csv).then(()=>{
      copyBtn.textContent = 'Copied!';
      setTimeout(()=>copyBtn.textContent='Copy CSV',1200);
    }).catch(()=>alert('Copy failed'));
  });

  clearBtn.addEventListener('click', ()=>{ input.value=''; resultsEl.innerHTML=''; totalWordsEl.textContent='0'; uniqueWordsEl.textContent='0'; });

})();
