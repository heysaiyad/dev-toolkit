// Word Frequency Analyzer - Enhanced version with additional features
(function(){
  const input = document.getElementById('inputText');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resultsEl = document.getElementById('results');
  const totalWordsEl = document.getElementById('totalWords');
  const uniqueWordsEl = document.getElementById('uniqueWords');
  const avgLengthEl = document.getElementById('avgLength');
  const longestWordEl = document.getElementById('longestWord');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const minLengthInput = document.getElementById('minLength');
  const stopwordMode = document.getElementById('stopwordMode');
  const topNInput = document.getElementById('topN');
  const caseInsensitiveCheck = document.getElementById('caseInsensitive');
  const includeNumbersCheck = document.getElementById('includeNumbers');
  const showChartCheck = document.getElementById('showChart');
  const chartContainer = document.getElementById('chartContainer');
  const chartEl = document.getElementById('chart');

  const BASIC_STOPWORDS = new Set(['the','and','is','in','to','a','of','that','it','for','on','with','as','this','by','an','be','are','or','from','at','which','was','but','have','has','will','would','could','should','can','may','been','were','their','there','these','those','then','than','them','they','what','when','where','who','why','how','all','each','every','some','any','more','most','much','many','few','very','just','only','such','both','even','also','too','so','about','into','through','during','before','after','above','below','between','under','again','further','once','here','while','up','down','out','over','off','if','no','not','do','does','did','doing','get','got','give','given','go','going','gone','make','made','making','say','said','saying','see','seen','seem','take','taken','use','used','using','find','found','know','known','think','thought','come','came','want','wanted','look','looked','need','needed','feel','felt','try','tried','ask','asked','work','worked','call','called','back','new','first','last','long','great','little','own','other','old','right','big','high','different','small','large','next','early','young','important','public','bad','same','able']);

  let currentData = null;

  function tokenize(text, caseInsensitive, includeNumbers){
    let processedText = text;
    if(caseInsensitive){
      processedText = processedText.toLowerCase();
    }
    processedText = processedText
      .replace(/[\u2018\u2019\u201c\u201d]/g,'')
      .replace(/[^a-zA-Z0-9\s'-]/g,' ');
    
    return processedText
      .split(/\s+/)
      .map(s=>s.replace(/^'+|'+$/g,''))
      .filter(w=>{
        if(!w) return false;
        if(!includeNumbers && /^\d+$/.test(w)) return false;
        return true;
      });
  }

  function analyze(){
    const text = input.value || '';
    if(!text.trim()){
      clearResults();
      return null;
    }

    const minLen = Math.max(1, parseInt(minLengthInput.value) || 1);
    const topN = Math.max(1, parseInt(topNInput.value) || 20);
    const stopMode = stopwordMode.value;
    const caseInsensitive = caseInsensitiveCheck.checked;
    const includeNumbers = includeNumbersCheck.checked;

    const tokens = tokenize(text, caseInsensitive, includeNumbers).filter(w=>w.length>=minLen);
    const freq = new Map();
    let totalLength = 0;
    let longest = '';

    for(const w of tokens){
      const checkWord = caseInsensitive ? w.toLowerCase() : w;
      if(stopMode==='basic' && BASIC_STOPWORDS.has(checkWord)) continue;
      
      freq.set(w, (freq.get(w)||0)+1);
      totalLength += w.length;
      if(w.length > longest.length){
        longest = w;
      }
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

    const avgLen = tokens.length > 0 ? (totalLength / tokens.length).toFixed(2) : 0;
    totalWordsEl.textContent = tokens.length;
    uniqueWordsEl.textContent = freq.size;
    avgLengthEl.textContent = avgLen;
    longestWordEl.textContent = longest || '-';

    currentData = {arr, top, tokens, freq};

    if(showChartCheck.checked){
      renderChart(top);
    } else {
      chartContainer.style.display = 'none';
    }

    return currentData;
  }

  function renderChart(top){
    if(!top || top.length === 0){
      chartContainer.style.display = 'none';
      return;
    }

    const chartTop = top.slice(0, 10);
    const maxCount = chartTop[0][1];
    
    chartEl.innerHTML = '';
    for(const [word, count] of chartTop){
      const barDiv = document.createElement('div');
      barDiv.className = 'wfa-bar';
      
      const widthPercent = (count / maxCount) * 100;
      
      barDiv.innerHTML = `
        <div class="wfa-bar-label">${escapeHtml(word)}</div>
        <div class="wfa-bar-container">
          <div class="wfa-bar-fill" style="width:${widthPercent}%">${count}</div>
        </div>
      `;
      chartEl.appendChild(barDiv);
    }
    
    chartContainer.style.display = 'block';
  }

  function clearResults(){
    resultsEl.innerHTML = '';
    totalWordsEl.textContent = '0';
    uniqueWordsEl.textContent = '0';
    avgLengthEl.textContent = '0';
    longestWordEl.textContent = '-';
    chartContainer.style.display = 'none';
    currentData = null;
  }

  function escapeHtml(s){ 
    return String(s).replace(/[&<>\"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]); 
  }

  analyzeBtn.addEventListener('click', analyze);
  input.addEventListener('keydown', function(e){ 
    if(e.ctrlKey && e.key==='Enter') analyze(); 
  });

  showChartCheck.addEventListener('change', function(){
    if(currentData && currentData.top.length > 0){
      if(this.checked){
        renderChart(currentData.top);
      } else {
        chartContainer.style.display = 'none';
      }
    }
  });

  caseInsensitiveCheck.addEventListener('change', function(){
    if(input.value.trim()) analyze();
  });

  includeNumbersCheck.addEventListener('change', function(){
    if(input.value.trim()) analyze();
  });

  copyBtn.addEventListener('click', function(){
    if(!currentData || !currentData.arr || currentData.arr.length===0){
      alert('No data to copy. Please analyze text first.');
      return;
    }
    const csv = ['word,count', ...currentData.arr.map(([w,c])=>`${w},${c}`)].join('\n');
    navigator.clipboard.writeText(csv).then(()=>{
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(()=>copyBtn.textContent=originalText,1200);
    }).catch(()=>alert('Copy failed. Please try again.'));
  });

  downloadBtn.addEventListener('click', function(){
    if(!currentData || !currentData.arr || currentData.arr.length===0){
      alert('No data to download. Please analyze text first.');
      return;
    }
    const csv = ['word,count', ...currentData.arr.map(([w,c])=>`${w},${c}`)].join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word-frequency-analysis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener('click', ()=>{ 
    input.value=''; 
    clearResults();
  });

})();