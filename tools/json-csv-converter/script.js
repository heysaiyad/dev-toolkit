document.addEventListener("DOMContentLoaded", () => {
  const jsonInput = document.getElementById("json-input");
  const resultBox = document.getElementById("result");
  const convertBtn = document.getElementById("convert-btn");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");

  function showResult(content, isError = false) {
    if (isError) {
      resultBox.innerHTML = `❌ ${content}`;
    } else {
      resultBox.textContent = content;
    }
  }

  function jsonToCsv(jsonArray) {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) return "";

    const headers = Object.keys(jsonArray[0]);
    const csvRows = [headers.join(",")];

    for (const obj of jsonArray) {
      const row = headers.map(h => {
        let val = obj[h] !== undefined ? obj[h] : "";
        val = String(val).replace(/"/g, '""'); // escape quotes
        return `"${val}"`;
      });
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  }

  convertBtn.addEventListener("click", () => {
    const text = jsonInput.value.trim();
    if (!text) return showResult("Input is empty", true);

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) return showResult("Input must be a JSON array", true);

      const csv = jsonToCsv(data);
      showResult(csv);
    } catch (e) {
      showResult(`Invalid JSON: ${e.message}`, true);
    }
  });

  copyBtn.addEventListener("click", () => {
    const text = resultBox.textContent.trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => alert("CSV copied to clipboard!"));
  });

  clearBtn.addEventListener("click", () => {
    jsonInput.value = "";
    resultBox.textContent = "";
  });
});
