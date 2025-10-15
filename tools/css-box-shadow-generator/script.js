const hOffset = document.getElementById('hOffset');
const vOffset = document.getElementById('vOffset');
const blur = document.getElementById('blur');
const spread = document.getElementById('spread');
const color = document.getElementById('color');
const previewBox = document.getElementById('previewBox');
const cssCode = document.getElementById('cssCode');
const copyBtn = document.getElementById('copyBtn');

const hVal = document.getElementById('hVal');
const vVal = document.getElementById('vVal');
const bVal = document.getElementById('bVal');
const sVal = document.getElementById('sVal');

function updateShadow() {
  const h = hOffset.value;
  const v = vOffset.value;
  const b = blur.value;
  const s = spread.value;
  const c = color.value;

  hVal.textContent = h;
  vVal.textContent = v;
  bVal.textContent = b;
  sVal.textContent = s;

  const shadow = `${h}px ${v}px ${b}px ${s}px ${c}`;
  previewBox.style.boxShadow = shadow;
  cssCode.value = `box-shadow: ${shadow};`;
}

[hOffset, vOffset, blur, spread, color].forEach(input =>
  input.addEventListener('input', updateShadow)
);

updateShadow();

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(cssCode.value);
  copyBtn.textContent = "✅ Copied!";
  setTimeout(() => copyBtn.textContent = "📋 Copy CSS", 1500);
});
