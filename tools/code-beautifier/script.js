// script.js
document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("code-input");
  const outputEl = document.getElementById("code-output");
  const beautifyBtn = document.getElementById("beautify-btn");
  const copyBtn = document.getElementById("copy-btn");

  // Beautify function
  function beautifyCode() {
    const messyCode = inputEl.value.trim();

    if (!messyCode) {
      outputEl.value = "⚠️ Please paste some HTML code first.";
      return;
    }

    try {
      // Check if html_beautify is available
      if (typeof html_beautify === 'undefined') {
        outputEl.value = "❌ Error: Code beautifier library not loaded. Please refresh the page.";
        return;
      }

      const prettyCode = html_beautify(messyCode, {
        indent_size: 2,
        space_in_empty_paren: true,
        wrap_line_length: 120,
        preserve_newlines: true,
      });

      outputEl.value = prettyCode;
    } catch (error) {
      outputEl.value = "❌ Error formatting code:\n" + error.message;
    }
  }

  // Copy function with better error handling
  function copyOutput() {
    if (!outputEl.value.trim()) {
      copyBtn.innerHTML = "⚠️ Nothing to copy";
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Output';
      }, 1500);
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(outputEl.value)
        .then(() => {
          copyBtn.innerHTML = "✅ Copied!";
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Output';
          }, 1500);
        })
        .catch((err) => {
          console.error("Clipboard copy failed:", err);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  }

  // Fallback copy method for older browsers
  function fallbackCopy() {
    outputEl.select();
    outputEl.setSelectionRange(0, 99999); // For mobile devices
    
    try {
      document.execCommand('copy');
      copyBtn.innerHTML = "✅ Copied!";
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Output';
      }, 1500);
    } catch (err) {
      copyBtn.innerHTML = "❌ Copy failed";
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Output';
      }, 1500);
    }
  }

  // Event listeners
  beautifyBtn.addEventListener("click", beautifyCode);
  copyBtn.addEventListener("click", copyOutput);
});
