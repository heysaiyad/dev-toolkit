document.addEventListener("DOMContentLoaded", () => {
  const columnsInput = document.getElementById("columns");
  const rowsInput = document.getElementById("rows");
  const colGapInput = document.getElementById("col-gap");
  const rowGapInput = document.getElementById("row-gap");
  const itemsInput = document.getElementById("items-input");
  const resultBox = document.getElementById("result");
  const generateBtn = document.getElementById("generate-btn");
  const clearBtn = document.getElementById("clear-btn");

  function showResult(content) {
    resultBox.textContent = content;
  }

  generateBtn.addEventListener("click", () => {
    const cols = parseInt(columnsInput.value) || 1;
    const rows = parseInt(rowsInput.value) || 1;
    const colGap = parseInt(colGapInput.value) || 0;
    const rowGap = parseInt(rowGapInput.value) || 0;

    const itemsText = itemsInput.value.trim();
    const itemsLines = itemsText.split("\n").filter(l => l.trim() !== "");

    let css = `.container {\n  display: grid;\n  grid-template-columns: repeat(${cols}, 1fr);\n  grid-template-rows: repeat(${rows}, 1fr);\n  column-gap: ${colGap}px;\n  row-gap: ${rowGap}px;\n}\n\n`;

    itemsLines.forEach(line => {
      const [name, startCol, startRow, colSpan, rowSpan] = line.split(",").map(s => s.trim());
      if (!name || !startCol || !startRow) return;

      css += `.${name} {\n  grid-column: ${startCol} / span ${colSpan || 1};\n  grid-row: ${startRow} / span ${rowSpan || 1};\n}\n\n`;
    });

    showResult(css);
  });

  clearBtn.addEventListener("click", () => {
    columnsInput.value = 3;
    rowsInput.value = 2;
    colGapInput.value = 10;
    rowGapInput.value = 10;
    itemsInput.value = "";
    resultBox.textContent = "";
  });
});
