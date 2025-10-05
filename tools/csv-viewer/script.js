document.addEventListener("DOMContentLoaded", () => {
  const csvInput = document.getElementById("csv-input");
  const parseBtn = document.getElementById("parse-btn");
  const exportBtn = document.getElementById("export-btn");
  const clearBtn = document.getElementById("clear-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const tableWrapper = document.getElementById("table-wrapper");

  // Robust CSV parser (handles quoted fields, escaped quotes)
  function parseCSV(text) {
    const rows = [];
    let cur = "";
    let row = [];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        // escaped quote inside quoted field -> add one quote and skip next
        cur += '"';
        i++; // skip next
        continue;
      }

      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (ch === "," && !inQuotes) {
        row.push(cur);
        cur = "";
        continue;
      }

      if ((ch === "\n" || ch === "\r") && !inQuotes) {
        // handle CRLF and LF
        if (cur !== "" || row.length > 0) {
          row.push(cur);
          cur = "";
          rows.push(row);
          row = [];
        }
        // skip possible \n after \r
        if (ch === "\r" && next === "\n") i++;
        continue;
      }

      cur += ch;
    }

    // push last field/row
    if (cur !== "" || row.length > 0) {
      row.push(cur);
      rows.push(row);
    }

    // normalize rows: fill missing columns with empty string
    const maxLen = rows.reduce((m, r) => Math.max(m, r.length), 0);
    return rows.map(r => {
      const copy = r.slice();
      while (copy.length < maxLen) copy.push("");
      return copy;
    });
  }

  // Render table (first row treated as header)
  function renderTable(rows) {
    if (!rows || rows.length === 0) {
      tableWrapper.innerHTML = "No data to display.";
      return;
    }
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // header
    const headerRow = document.createElement("tr");
    rows[0].forEach((h, i) => {
      const th = document.createElement("th");
      th.textContent = h || `col${i + 1}`;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // body rows
    for (let r = 1; r < rows.length; r++) {
      const tr = document.createElement("tr");
      rows[r].forEach((cell, ci) => {
        const td = document.createElement("td");
        td.contentEditable = "true";
        td.spellcheck = false;
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    // attach table to wrapper
    tableWrapper.innerHTML = "";
    tableWrapper.appendChild(table);
  }

  // Export current table to CSV (reads header from table)
  function exportTableToCSV() {
    const table = tableWrapper.querySelector("table");
    if (!table) {
      alert("No table to export. Parse CSV first.");
      return;
    }

    const rows = [];
    const ths = Array.from(table.querySelectorAll("thead th"));
    const headers = ths.map(th => th.textContent.trim());
    rows.push(headers);

    const trs = Array.from(table.querySelectorAll("tbody tr"));
    trs.forEach(tr => {
      const tds = Array.from(tr.querySelectorAll("td"));
      rows.push(tds.map(td => td.textContent));
    });

    // convert rows -> CSV string with proper escaping
    const csvLines = rows.map(cols =>
      cols
        .map(val => {
          const needsQuotes = val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("\r");
          const escaped = val.replace(/"/g, '""');
          return needsQuotes ? `"${escaped}"` : escaped;
        })
        .join(",")
    );

    const csvContent = csvLines.join("\n");
    // download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Handlers
  parseBtn.addEventListener("click", () => {
    const text = csvInput.value;
    if (!text.trim()) {
      tableWrapper.innerHTML = "Input is empty. Paste CSV and click Parse CSV.";
      return;
    }
    try {
      const rows = parseCSV(text);
      renderTable(rows);
    } catch (e) {
      tableWrapper.innerHTML = `❌ Failed to parse CSV: ${e.message}`;
      console.error(e);
    }
  });

  exportBtn.addEventListener("click", exportTableToCSV);

  clearBtn.addEventListener("click", () => {
    csvInput.value = "";
    tableWrapper.innerHTML = "No data — paste CSV and click Parse CSV.";
  });

  sampleBtn.addEventListener("click", () => {
    csvInput.value = `name,age,city
John Doe,30,"New York, NY"
Jane Smith,25,Los Angeles
"Last, Person",40,"Some ""quoted"" place"`;
  });
});
