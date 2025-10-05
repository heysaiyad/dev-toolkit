document.addEventListener("DOMContentLoaded", () => {
  const columnsInput = document.getElementById("columns");
  const rowsInput = document.getElementById("rows");
  const colGapInput = document.getElementById("col-gap");
  const rowGapInput = document.getElementById("row-gap");
  const itemsInput = document.getElementById("items-input");
  const resultBox = document.getElementById("result");
  const generateBtn = document.getElementById("generate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const gridPreview = document.getElementById("grid-preview");

  function showResult(content) {
    resultBox.textContent = content;
  }

  function renderPreview(cols, rows, colGap, rowGap, items) {
    gridPreview.innerHTML = "";
    gridPreview.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridPreview.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridPreview.style.columnGap = `${colGap}px`;
    gridPreview.style.rowGap = `${rowGap}px`;

    items.forEach(line => {
      const [name, startCol, startRow, colSpan, rowSpan] = line.split(",").map(s => s.trim());
      if (!name || !startCol || !startRow) return;

      const div = document.createElement("div");
      div.textContent = name;
      div.style.gridColumn = `${startCol} / span ${colSpan || 1}`;
      div.style.gridRow = `${startRow} / span ${rowSpan || 1}`;
      div.style.background = "rgba(255,255,255,0.1)";
      div.style.border = "1px solid rgba(255,255,255,0.2)";
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      div.style.borderRadius = "6px";
      div.style.fontSize = "0.9rem";
      div.style.color = "#fff";
      gridPreview.appendChild(div);
    });
  }

  generateBtn.addEventListener("click", () => {
    const cols = parseInt(columnsInput.value) || 1;
    const rows = parseInt(rowsInput.value) || 1;
    const colGap = parseInt(colGapInput.value) || 0;
    const rowGap = parseInt(rowGapInput.value) || 0;
    const itemsText = itemsInput.value.trim();
    const itemsLines = itemsText.split("\n").filter(l => l.trim() !== "");

    // Generate CSS code
    let css = `.container {\n  display: grid;\n  grid-template-columns: repeat(${cols}, 1fr);\n  grid-template-rows: repeat(${rows}, 1fr);\n  column-gap: ${colGap}px;\n  row-gap: ${rowGap}px;\n}\n\n`;
    itemsLines.forEach(line => {
      const [name, startCol, startRow, colSpan, rowSpan] = line.split(",").map(s => s.trim());
      if (!name || !startCol || !startRow) return;
      css += `.${name} {\n  grid-column: ${startCol} / span ${colSpan || 1};\n  grid-row: ${startRow} / span ${rowSpan || 1};\n}\n\n`;
    });
    showResult(css);

    // Render the visual grid preview
    renderPreview(cols, rows, colGap, rowGap, itemsLines);
  });

  clearBtn.addEventListener("click", () => {
    columnsInput.value = 3;
    rowsInput.value = 2;
    colGapInput.value = 10;
    rowGapInput.value = 10;
    itemsInput.value = "";
    resultBox.textContent = "";
    gridPreview.innerHTML = "";
  });
});
