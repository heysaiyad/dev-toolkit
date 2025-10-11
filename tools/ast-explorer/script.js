// AST Explorer JavaScript functionality
class ASTExplorer {
  constructor() {
    this.astData = null;
    this.selectedNode = null;
    this.codeLines = [];
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.codeInput = document.getElementById("code-input");
    this.parseBtn = document.getElementById("parse-btn");
    this.astOutput = document.getElementById("ast-output");
    this.copyBtn = document.getElementById("copy-ast-btn");
    this.expandAllBtn = document.getElementById("expand-all-btn");
    this.collapseAllBtn = document.getElementById("collapse-all-btn");
    this.tolerantParsing = document.getElementById("tolerant-parsing");
    this.includeComments = document.getElementById("include-comments");
    this.includeLocations = document.getElementById("include-locations");
  }

  attachEventListeners() {
    this.parseBtn.addEventListener("click", () => this.parseCode());
    this.copyBtn.addEventListener("click", () => this.copyAST());
    this.expandAllBtn.addEventListener("click", () => this.expandAll());
    this.collapseAllBtn.addEventListener("click", () => this.collapseAll());

    // Parse on Enter key (Ctrl+Enter)
    this.codeInput.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.parseCode();
      }
    });

    // Code highlighting on input change
    this.codeInput.addEventListener("input", () => {
      this.updateCodeLines();
    });
  }

  updateCodeLines() {
    this.codeLines = this.codeInput.value.split("\n");
  }

  parseCode() {
    const code = this.codeInput.value.trim();

    if (!code) {
      this.showError("Please enter some JavaScript code to parse.");
      return;
    }

    // Check if Esprima is available
    if (typeof esprima === "undefined") {
      this.showError(
        "Esprima parser library is not loaded. Please refresh the page and try again."
      );
      return;
    }

    try {
      // Show loading state
      this.astOutput.innerHTML = `
                <div class="ast-placeholder">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Parsing JavaScript code...</p>
                </div>
            `;

      // Configure parser options
      const options = {
        tolerant: this.tolerantParsing.checked,
        comment: this.includeComments.checked,
        loc: this.includeLocations.checked,
        range: this.includeLocations.checked,
      };

      // Parse the code using Esprima
      this.astData = esprima.parseScript(code, options);

      // Display the AST
      this.displayAST(this.astData);

      // Enable copy button
      this.copyBtn.disabled = false;
    } catch (error) {
      this.showError(`Parse Error: ${error.message}`);
    }
  }

  displayAST(ast) {
    this.astOutput.innerHTML = "";
    const treeContainer = document.createElement("div");
    treeContainer.className = "ast-tree";

    this.renderNode(ast, treeContainer, "Program", 0);
    this.astOutput.appendChild(treeContainer);

    // Add interactions after rendering
    setTimeout(() => {
      this.addNodeInteractions();
    }, 100);
  }

  renderNode(node, container, key = null, depth = 0) {
    const nodeElement = document.createElement("div");
    nodeElement.className = "ast-node";
    nodeElement.setAttribute("data-depth", depth);

    if (node === null || node === undefined) {
      nodeElement.innerHTML = `
                <div class="ast-node-header">
                    <span class="ast-node-type null">null</span>
                </div>
            `;
      container.appendChild(nodeElement);
      return;
    }

    if (
      typeof node === "string" ||
      typeof node === "number" ||
      typeof node === "boolean"
    ) {
      const valueClass =
        typeof node === "string"
          ? "string"
          : typeof node === "number"
          ? "number"
          : typeof node === "boolean"
          ? "boolean"
          : "null";

      nodeElement.innerHTML = `
                <div class="ast-node-header literal-node" data-node-type="Literal">
                    <span class="ast-node-key">${key ? key + ":" : ""}</span>
                    <span class="ast-node-value ${valueClass}">${this.formatValue(
        node
      )}</span>
                </div>
            `;
      container.appendChild(nodeElement);
      return;
    }

    if (Array.isArray(node)) {
      if (node.length === 0) {
        nodeElement.innerHTML = `
                    <div class="ast-node-header">
                        <span class="ast-node-key">${
                          key ? key + ":" : ""
                        }</span>
                        <span class="ast-node-value">[]</span>
                    </div>
                `;
        container.appendChild(nodeElement);
        return;
      }

      nodeElement.innerHTML = `
                <div class="ast-node-header collapsible" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span class="ast-node-toggle">▼</span>
                    <span class="ast-node-key">${key ? key + ":" : ""}</span>
                    <span class="ast-node-type array">Array</span>
                    <span class="ast-node-value">(${node.length} items)</span>
                </div>
                <div class="ast-node-children">
                </div>
            `;

      const childrenContainer = nodeElement.querySelector(".ast-node-children");
      node.forEach((item, index) => {
        this.renderNode(item, childrenContainer, `[${index}]`, depth + 1);
      });

      container.appendChild(nodeElement);
      return;
    }

    if (typeof node === "object") {
      const keys = Object.keys(node);
      if (keys.length === 0) {
        nodeElement.innerHTML = `
                    <div class="ast-node-header">
                        <span class="ast-node-key">${
                          key ? key + ":" : ""
                        }</span>
                        <span class="ast-node-value">{}</span>
                    </div>
                `;
        container.appendChild(nodeElement);
        return;
      }

      const nodeType = node.type || "Object";
      const nodeClass = this.getNodeClass(nodeType);
      const hasChildren = this.hasRelevantChildren(node);

      nodeElement.innerHTML = `
                <div class="ast-node-header ${
                  hasChildren ? "collapsible" : ""
                }" 
                     onclick="${
                       hasChildren
                         ? "this.parentElement.classList.toggle('collapsed')"
                         : ""
                     }"
                     data-node-type="${nodeType}"
                     data-loc="${node.loc ? JSON.stringify(node.loc) : ""}"
                     data-range="${
                       node.range ? JSON.stringify(node.range) : ""
                     }">
                    ${
                      hasChildren
                        ? '<span class="ast-node-toggle">▼</span>'
                        : '<span class="ast-node-spacer"></span>'
                    }
                    <span class="ast-node-key">${key ? key + ":" : ""}</span>
                    <span class="ast-node-type ${nodeClass}">${nodeType}</span>
                    <span class="ast-node-info">${this.getNodeInfo(node)}</span>
                </div>
                ${hasChildren ? '<div class="ast-node-children"></div>' : ""}
            `;

      if (hasChildren) {
        const childrenContainer =
          nodeElement.querySelector(".ast-node-children");
        this.renderRelevantChildren(node, childrenContainer, depth + 1);
      }

      container.appendChild(nodeElement);
    }
  }

  getNodeClass(nodeType) {
    const typeMap = {
      Program: "program",
      VariableDeclaration: "declaration",
      FunctionDeclaration: "declaration",
      ClassDeclaration: "declaration",
      ImportDeclaration: "declaration",
      ExportDeclaration: "declaration",
      Identifier: "identifier",
      Literal: "literal",
      StringLiteral: "literal",
      NumericLiteral: "literal",
      BooleanLiteral: "literal",
      NullLiteral: "literal",
      BinaryExpression: "expression",
      UnaryExpression: "expression",
      CallExpression: "expression",
      MemberExpression: "expression",
      AssignmentExpression: "expression",
      ConditionalExpression: "expression",
      LogicalExpression: "expression",
      ArrayExpression: "expression",
      ObjectExpression: "expression",
      ArrowFunctionExpression: "expression",
      FunctionExpression: "expression",
      BlockStatement: "statement",
      ExpressionStatement: "statement",
      IfStatement: "statement",
      ForStatement: "statement",
      WhileStatement: "statement",
      ReturnStatement: "statement",
      ThrowStatement: "statement",
      TryStatement: "statement",
      CatchClause: "statement",
      SwitchStatement: "statement",
      CaseClause: "statement",
      DefaultClause: "statement",
    };
    return typeMap[nodeType] || "default";
  }

  hasRelevantChildren(node) {
    const relevantKeys = [
      "body",
      "declarations",
      "declaration",
      "init",
      "test",
      "consequent",
      "alternate",
      "left",
      "right",
      "argument",
      "callee",
      "arguments",
      "object",
      "property",
      "elements",
      "properties",
      "key",
      "value",
      "expression",
      "statements",
      "handler",
    ];
    return relevantKeys.some(
      (key) => node[key] !== undefined && node[key] !== null
    );
  }

  renderRelevantChildren(node, container, depth) {
    const relevantKeys = [
      "body",
      "declarations",
      "declaration",
      "init",
      "test",
      "consequent",
      "alternate",
      "left",
      "right",
      "argument",
      "callee",
      "arguments",
      "object",
      "property",
      "elements",
      "properties",
      "key",
      "value",
      "expression",
      "statements",
      "handler",
    ];

    relevantKeys.forEach((key) => {
      if (node[key] !== undefined && node[key] !== null) {
        this.renderNode(node[key], container, key, depth);
      }
    });
  }

  getNodeInfo(node) {
    if (node.type === "Identifier") {
      return `"${node.name}"`;
    }
    if (node.type === "Literal") {
      return this.formatValue(node.value);
    }
    if (node.type === "BinaryExpression" || node.type === "LogicalExpression") {
      return `(${node.operator})`;
    }
    if (node.type === "CallExpression") {
      return `(${node.arguments ? node.arguments.length : 0} args)`;
    }
    if (node.type === "MemberExpression") {
      return `(${node.computed ? "computed" : "dot"})`;
    }
    if (node.type === "VariableDeclaration") {
      return `(${node.kind})`;
    }
    if (
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression"
    ) {
      return `(${node.params ? node.params.length : 0} params)`;
    }
    if (node.type === "ArrayExpression") {
      return `(${node.elements ? node.elements.length : 0} elements)`;
    }
    if (node.type === "ObjectExpression") {
      return `(${node.properties ? node.properties.length : 0} properties)`;
    }
    if (node.loc) {
      return `(${node.loc.start.line}:${node.loc.start.column})`;
    }
    return "";
  }

  formatValue(value) {
    if (typeof value === "string") {
      return `"${value}"`;
    }
    return String(value);
  }

  showError(message) {
    this.astOutput.innerHTML = `
            <div class="ast-error">
                <strong>Error:</strong> ${message}
            </div>
        `;
    this.copyBtn.disabled = true;
  }

  copyAST() {
    if (!this.astData) return;

    const jsonString = JSON.stringify(this.astData, null, 2);

    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        this.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        this.copyBtn.classList.add("copied");

        setTimeout(() => {
          this.copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy JSON';
          this.copyBtn.classList.remove("copied");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  expandAll() {
    const collapsedNodes = this.astOutput.querySelectorAll(
      ".ast-node.collapsed"
    );
    collapsedNodes.forEach((node) => {
      node.classList.remove("collapsed");
      const toggle = node.querySelector(".ast-node-toggle");
      if (toggle) toggle.textContent = "▼";
    });
  }

  collapseAll() {
    const expandedNodes = this.astOutput.querySelectorAll(
      ".ast-node:not(.collapsed)"
    );
    expandedNodes.forEach((node) => {
      if (node.querySelector(".ast-node-children")) {
        node.classList.add("collapsed");
        const toggle = node.querySelector(".ast-node-toggle");
        if (toggle) toggle.textContent = "▶";
      }
    });
  }

  // Add tooltip and code highlighting functionality
  addNodeInteractions() {
    const nodes = this.astOutput.querySelectorAll(".ast-node-header");
    nodes.forEach((node) => {
      // Add tooltip on hover
      node.addEventListener("mouseenter", (e) => {
        this.showTooltip(e, node);
      });

      node.addEventListener("mouseleave", () => {
        this.hideTooltip();
      });

      // Add click handler for code highlighting
      node.addEventListener("click", (e) => {
        if (node.classList.contains("collapsible")) {
          return; // Let the collapse/expand work
        }
        this.highlightCode(node);
      });
    });
  }

  showTooltip(event, node) {
    const nodeType = node.getAttribute("data-node-type");
    const loc = node.getAttribute("data-loc");
    const range = node.getAttribute("data-range");

    if (!nodeType) return;

    let tooltipContent = `<strong>${nodeType}</strong>`;

    if (loc) {
      try {
        const location = JSON.parse(loc);
        tooltipContent += `<br>Location: Line ${location.start.line}, Column ${location.start.column}`;
        tooltipContent += `<br>End: Line ${location.end.line}, Column ${location.end.column}`;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    if (range) {
      try {
        const rangeData = JSON.parse(range);
        tooltipContent += `<br>Range: ${rangeData[0]}-${rangeData[1]}`;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "ast-tooltip";
    tooltip.innerHTML = tooltipContent;
    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + "px";
    tooltip.style.top = rect.bottom + 5 + "px";
  }

  hideTooltip() {
    const tooltip = document.querySelector(".ast-tooltip");
    if (tooltip) {
      tooltip.remove();
    }
  }

  highlightCode(node) {
    // Remove previous highlighting
    this.clearCodeHighlighting();

    const loc = node.getAttribute("data-loc");
    const range = node.getAttribute("data-range");

    if (!loc && !range) return;

    try {
      let startLine, endLine, startCol, endCol;

      if (loc) {
        const location = JSON.parse(loc);
        startLine = location.start.line - 1; // Convert to 0-based
        endLine = location.end.line - 1;
        startCol = location.start.column;
        endCol = location.end.column;
      } else if (range) {
        // Calculate line/column from range
        const rangeData = JSON.parse(range);
        const startPos = rangeData[0];
        const endPos = rangeData[1];

        let currentPos = 0;
        startLine = 0;
        endLine = 0;

        for (let i = 0; i < this.codeLines.length; i++) {
          const lineLength = this.codeLines[i].length + 1; // +1 for newline
          if (currentPos + lineLength > startPos) {
            startLine = i;
            startCol = startPos - currentPos;
            break;
          }
          currentPos += lineLength;
        }

        currentPos = 0;
        for (let i = 0; i < this.codeLines.length; i++) {
          const lineLength = this.codeLines[i].length + 1;
          if (currentPos + lineLength > endPos) {
            endLine = i;
            endCol = endPos - currentPos;
            break;
          }
          currentPos += lineLength;
        }
      }

      // Highlight the code
      this.highlightCodeRange(startLine, endLine, startCol, endCol);

      // Scroll to the highlighted code
      this.scrollToCode(startLine);
    } catch (e) {
      console.error("Error highlighting code:", e);
    }
  }

  highlightCodeRange(startLine, endLine, startCol, endCol) {
    // This is a simplified version - in a real implementation,
    // you'd want to use a proper syntax highlighter
    const codeInput = this.codeInput;
    const start = this.getTextPosition(startLine, startCol);
    const end = this.getTextPosition(endLine, endCol);

    // Store selection for visual feedback
    codeInput.setSelectionRange(start, end);
    codeInput.focus();

    // Add visual highlighting class
    codeInput.classList.add("code-highlighted");
    setTimeout(() => {
      codeInput.classList.remove("code-highlighted");
    }, 2000);
  }

  getTextPosition(line, col) {
    let position = 0;
    for (let i = 0; i < line; i++) {
      position += this.codeLines[i].length + 1; // +1 for newline
    }
    return position + col;
  }

  scrollToCode(line) {
    const codeInput = this.codeInput;
    const lineHeight = 20; // Approximate line height
    const scrollTop = line * lineHeight;
    codeInput.scrollTop = scrollTop;
  }

  clearCodeHighlighting() {
    this.codeInput.classList.remove("code-highlighted");
  }
}

// Initialize the AST Explorer when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Check if Esprima is loaded
  if (typeof esprima === "undefined") {
    console.error("Esprima library not loaded. Please check the CDN link.");
    document.getElementById("ast-output").innerHTML = `
            <div class="ast-error">
                <strong>Error:</strong> Esprima parser library failed to load. Please check your internet connection and try refreshing the page.
            </div>
        `;
    return;
  }

  new ASTExplorer();
});
