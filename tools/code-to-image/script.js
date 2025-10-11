const input = document.getElementById('codeInput');
const previewCode = document.getElementById('previewCode');
const langSelect = document.getElementById('lang');
const renderBtn = document.getElementById('renderBtn');
const downloadBtn = document.getElementById('downloadBtn');

function updatePreview() {
  const lang = langSelect.value || 'javascript';
  previewCode.className = 'language-' + lang;
 
  previewCode.textContent = input.value || '// paste code and click "Render Preview"';
  
  if (window.Prism) {
    Prism.highlightElement(previewCode);
  }
}


input.addEventListener('input', () => {
 
  updatePreview();
});

langSelect.addEventListener('change', updatePreview);
renderBtn.addEventListener('click', updatePreview);


downloadBtn.addEventListener('click', async () => {
  
  updatePreview();

  const previewEl = document.getElementById('preview');

  try {
   
    const canvas = await html2canvas(previewEl, { scale: 2, useCORS: true, backgroundColor: null });
    const dataUrl = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'code.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error('Failed to capture preview:', err);
    alert('Could not capture image — check console for details.');
  }
});


updatePreview();
