const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const generateBtn = document.getElementById('generateMemeBtn');
const downloadBtn = document.getElementById('downloadMemeBtn');

let uploadedImage = null;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    uploadedImage = img;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
});

generateBtn.addEventListener('click', () => {
  if (!uploadedImage) {
    alert('Please upload an image first!');
    return;
  }

  ctx.drawImage(uploadedImage, 0, 0);

  ctx.font = '48px Impact';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 6;
  ctx.textAlign = 'center';

  ctx.fillText(topTextInput.value.toUpperCase(), canvas.width / 2, 60);
  ctx.strokeText(topTextInput.value.toUpperCase(), canvas.width / 2, 60);

  ctx.fillText(bottomTextInput.value.toUpperCase(), canvas.width / 2, canvas.height - 20);
  ctx.strokeText(bottomTextInput.value.toUpperCase(), canvas.width / 2, canvas.height - 20);

  downloadBtn.style.display = 'inline-block';
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'meme.png';
  link.href = canvas.toDataURL();
  link.click();
});
