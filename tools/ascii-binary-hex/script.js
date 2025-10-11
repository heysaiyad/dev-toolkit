document.addEventListener("DOMContentLoaded", () => {
    const inputText = document.getElementById("input-text");
    const outputText = document.getElementById("output-text");
    const swapBtn = document.getElementById("swap-btn");
    const clearBtn = document.getElementById("clear-btn");
    const copyBtn = document.getElementById("copy-btn");
    const asciiToModeBtn = document.getElementById("ascii-to-mode");
    const toAsciiModeBtn = document.getElementById("to-ascii-mode");
    const separatorOptions = document.getElementById("separator-options");
    const separatorInput = document.getElementById("separator-input");
  
    let currentMode = "ascii-to";
  
    const performConversion = () => {
      const text = inputText.value;
      if (!text) {
        outputText.value = "";
        return;
      }
  
      try {
        if (currentMode === "ascii-to") {
          outputText.value = convertAsciiTo(text);
        } else {
          outputText.value = convertToAscii(text, separatorInput.value);
        }
      } catch (err) {
        outputText.value = "Error: Invalid input for the selected mode.";
      }
    };
  
    inputText.addEventListener("input", performConversion);
    separatorInput.addEventListener("input", performConversion);
  
    asciiToModeBtn.addEventListener("click", () => {
      currentMode = "ascii-to";
      asciiToModeBtn.classList.add("active");
      toAsciiModeBtn.classList.remove("active");
      separatorOptions.classList.remove("visible");
      inputText.placeholder = "Enter ASCII text...";
      outputText.placeholder = "Binary or Hex output will appear here...";
      performConversion();
    });
  
    toAsciiModeBtn.addEventListener("click", () => {
      currentMode = "to-ascii";
      toAsciiModeBtn.classList.add("active");
      asciiToModeBtn.classList.remove("active");
      separatorOptions.classList.add("visible");
      inputText.placeholder = "Enter Binary (01001) or Hex (4A) string...";
      outputText.placeholder = "Decoded ASCII text will appear here...";
      performConversion();
    });
  
    swapBtn.addEventListener("click", () => {
      const temp = inputText.value;
      inputText.value = outputText.value;
      outputText.value = temp;
      performConversion();
    });
  
    clearBtn.addEventListener("click", () => {
      inputText.value = "";
      outputText.value = "";
      inputText.focus();
    });
  
    copyBtn.addEventListener("click", async () => {
      if (!outputText.value) return;
  
      try {
        await navigator.clipboard.writeText(outputText.value);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => (copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Output'), 2000);
      } catch (err) {
        outputText.select();
        document.execCommand("copy");
      }
    });
  
    function convertAsciiTo(str) {
      let binaryResult = "";
      let hexResult = "";
  
      for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        binaryResult += charCode.toString(2).padStart(8, "0") + " ";
        hexResult += charCode.toString(16).toUpperCase().padStart(2, "0") + " ";
      }
      return `Binary:\n${binaryResult.trim()}\n\nHex:\n${hexResult.trim()}`;
    }
  
    function convertToAscii(input, separator) {
      let parts;
      const trimmedInput = input.trim();
      
      if (separator) {
        parts = trimmedInput.split(separator);
      } else {
        const contiguousStr = trimmedInput.replace(/\s+/g, "");
        parts = [];
        
        if (/^[01]+$/.test(contiguousStr)) {
            for (let i = 0; i < contiguousStr.length; i += 8) {
                parts.push(contiguousStr.substring(i, i + 8));
            }
        } else { 
            for (let i = 0; i < contiguousStr.length; i += 2) {
                parts.push(contiguousStr.substring(i, i + 2));
            }
        }
      }
      
      let result = "";
      for (const part of parts) {
        if (!part) continue;
        
        let charCode;
        if (/^[01]+$/.test(part)) {
          charCode = parseInt(part, 2);
        } else if (/^[0-9a-fA-F]+$/.test(part)) {
          charCode = parseInt(part, 16);
        } else {
          throw new Error("Invalid format in one of the parts.");
        }
        
        result += String.fromCharCode(charCode);
      }
      return result;
    }
  });