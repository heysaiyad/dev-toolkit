const container = document.querySelector(".container");
const originalHTML = container.innerHTML;

document.getElementById("runBtn").addEventListener("click", () => {
  const text1 = document.getElementById("text1").value.trim()
  const text2 = document.getElementById("text2").value.trim()

  let output1 = "";
  let output2 = "";

  let maxLen = Math.max(text1.length, text2.length);

  for (let i = 0; i < maxLen; i++) {
    if (text1[i] === text2[i]) {
      output1 += text1[i];
      output2 += text2[i];
    } else {
      if (text1[i]) output1 += `<span class="removed">${text1[i]}</span>`;
      if (text2[i]) output2 += `<span class="added">${text2[i]}</span>`;
    }
  }

  // Replace textareas with rendered diff blocks
  document.querySelector(".container").innerHTML = `
    <div class="snippet"><label>Original Text</label><pre class="rendered">${output1}</pre></div>
    <div class="snippet"><label>Modified Text</label><pre class="rendered">${output2}</pre></div>
  `;

  document.getElementById("runBtn").style.display = "none";
  document.getElementById("clearBtn").style.display = "block";

});

document.getElementById("clearBtn").addEventListener("click", () => {
  document.querySelector(".container").innerHTML = originalHTML;
  document.getElementById("runBtn").style.display = "block";
  document.getElementById("clearBtn").style.display = "none";
});
