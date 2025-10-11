const textInput = document.getElementById("textInput");
const charCount = document.getElementById("charCount");
const charNoSpace = document.getElementById("charNoSpace");
const wordCount = document.getElementById("wordCount");

textInput.addEventListener("input", () => {
  const text = textInput.value;
  charCount.textContent = text.length;
  charNoSpace.textContent = text.replace(/\s+/g, '').length;

  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  wordCount.textContent = words.length;
});
