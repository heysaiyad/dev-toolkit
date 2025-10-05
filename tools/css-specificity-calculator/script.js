document.addEventListener("DOMContentLoaded", () => {
  const selectorInput = document.getElementById("selector-input");
  const resultBox = document.getElementById("result");
  const calculateBtn = document.getElementById("calculate-btn");
  const clearBtn = document.getElementById("clear-btn");

  // calculateSpecificity(selectorOrList) -> [a,b,c] or [[a,b,c], ...]
  // a = ID selectors
  // b = class/attribute/pseudo-class selectors
  // c = type selectors and pseudo-elements
  function calculateSpecificity(input) {
  // split a selector-list by top-level commas (not commas inside parentheses)
  function splitTopLevelCommas(s) {
    const parts = [];
    let depth = 0, cur = '';
    for (let ch of s) {
      if (ch === '(') { depth++; cur += ch; }
      else if (ch === ')') { depth = Math.max(0, depth - 1); cur += ch; }
      else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }

  // compare specificity arrays lexicographically (used for :not() multi-arg)
  function isMoreSpecific(x, y) {
    if (!y) return true;
    for (let i = 0; i < 3; i++) {
      if (x[i] > y[i]) return true;
      if (x[i] < y[i]) return false;
    }
    return false;
  }

  // compute specificity for a single selector (no top-level commas)
  function specForSingle(sel) {
    let a = 0, b = 0, c = 0;
    let s = sel;

    // 1) Count attribute selectors and remove them (so attribute values don't pollute later matches)
    const attrMatches = s.match(/\[[^\]]*\]/g) || [];
    b += attrMatches.length;
    s = s.replace(/\[[^\]]*\]/g, ' ');

    // 2) Extract :not(...) contents, handle separately (they contribute inner specificity)
    //    Replace each :not(...) with a space to avoid token merging.
    const notInners = [];
    let out = '';
    for (let i = 0; i < s.length; ) {
      if (s.startsWith(':not(', i)) {
        let j = i + 5; // after ':not('
        let depth = 1, start = j;
        for (; j < s.length; j++) {
          if (s[j] === '(') depth++;
          else if (s[j] === ')') {
            depth--;
            if (depth === 0) break;
          }
        }
        // if unbalanced, just skip parsing and append rest
        if (j >= s.length) { out += s.slice(i); break; }
        notInners.push(s.slice(start, j));
        out += ' ';
        i = j + 1;
      } else {
        out += s[i++];
      }
    }
    s = out;
    // process each :not inner (if inner is a selector-list pick the most specific argument)
    for (const inner of notInners) {
      const args = splitTopLevelCommas(inner);
      let best = null;
      for (const arg of args) {
        const sp = specForSingle(arg); // recursion (arg won't contain top-level commas after split)
        if (best === null || isMoreSpecific(sp, best)) best = sp;
      }
      if (best) { a += best[0]; b += best[1]; c += best[2]; }
    }

    // 3) Count ID selectors
    const idMatches = s.match(/#[A-Za-z0-9\-_]+/g) || [];
    a += idMatches.length;

    // 4) Count pseudo-elements:
    //    - modern syntax ::name
    //    - legacy single-colon pseudo-elements: :before, :after, :first-line, :first-letter, :selection
    const pseudoElementRegex = /::[A-Za-z0-9\-_]+|:(?:before|after|first-line|first-letter|selection)/gi;
    const pseudoElementMatches = s.match(pseudoElementRegex) || [];
    c += pseudoElementMatches.length;
    // remove them so they aren't double-counted as pseudo-classes or types
    s = s.replace(pseudoElementRegex, ' ');

    // 5) Count pseudo-classes (single-colon, including functional ones like :nth-child(...))
    const pseudoClassMatches = s.match(/:(?!:)[A-Za-z0-9\-_]+(?:\([^)]*\))?/g) || [];
    b += pseudoClassMatches.length;

    // 6) Count class selectors
    const classMatches = s.match(/\.[A-Za-z0-9\-_]+/g) || [];
    b += classMatches.length;

    // 7) Remove contents inside parentheses (functional pseudo-class args) to avoid counting tokens inside
    s = s.replace(/\([^)]*\)/g, ' ');

    // 8) Count type selectors (element names). Match element names preceded by start or combinator/whitespace
    //    Note: this will also match e.g. "svg|a" if present; we keep it simple for common cases.
    const typeMatches = s.match(/(^|[\s>+~,(])([A-Za-z][A-Za-z0-9\-_]*)/g) || [];
    c += typeMatches.length;

    return [a, b, c];
  }

  // top-level split (commas) and compute per-selector
  const list = splitTopLevelCommas(input);
  const results = list.map(l => specForSingle(l.trim()));

  return results.length === 1 ? results[0] : results;
  }


  calculateBtn.addEventListener("click", () => {
    const selector = selectorInput.value.trim();
    if (!selector) {
      resultBox.textContent = "❌ Please enter a CSS selector";
      return;
    }
    const specificity = calculateSpecificity(selector);
    resultBox.textContent = `[${specificity.join(", ")}]`;
  });

  clearBtn.addEventListener("click", () => {
    selectorInput.value = "";
    resultBox.textContent = "";
  });
});
