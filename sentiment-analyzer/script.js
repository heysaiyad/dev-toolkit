(() => {
  const POSITIVE = new Set([
    "good",
    "great",
    "excellent",
    "love",
    "loved",
    "loving",
    "nice",
    "wonderful",
    "amazing",
    "awesome",
    "happy",
    "joy",
    "joyful",
    "awesome",
    "fantastic",
    "best",
    "best-ever",
    "yay",
    "like",
    "liked",
    "pleasant",
    "fortunate",
    "correct",
    "positive",
    "success",
    "win",
    "enjoy",
    "enjoyed",
  ]);

  const NEGATIVE = new Set([
    "bad",
    "terrible",
    "awful",
    "hate",
    "hated",
    "hating",
    "horrible",
    "worse",
    "worst",
    "sad",
    "angry",
    "angrily",
    "disappoint",
    "disappointed",
    "disappointing",
    "fail",
    "failed",
    "failure",
    "problem",
    "problems",
    "negative",
    "issue",
    "issues",
    "unhappy",
    "poor",
    "annoy",
    "annoyed",
  ]);

  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[“”"(){}\[\]|<>:;,.?\/\\@#\$%\^&\*\+=~`]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  const NEGATORS = new Set([
    "not",
    "no",
    "never",
    "none",
    "n't",
    "cannot",
    "cant",
    "neither",
    "nor",
  ]);

  function analyzeText(text) {
    const tokens = tokenize(text);
    let score = 0;
    let posCount = 0,
      negCount = 0,
      neutralCount = 0;
    let negateWindow = 0;

    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i];

      if (tk.length <= 1) {
        neutralCount++;
        continue;
      }

      if (NEGATORS.has(tk)) {
        negateWindow = 2;
        neutralCount++;
        continue;
      }

      let weight = 1;
      if (
        tk === "very" ||
        tk === "extremely" ||
        tk === "super" ||
        tk === "really" ||
        tk === "so"
      ) {
        neutralCount++;

        const next = tokens[i + 1];
        if (next && (POSITIVE.has(next) || NEGATIVE.has(next))) {
          weight = 2;
        }
      }

      let matched = false;
      if (POSITIVE.has(tk)) {
        matched = true;
        posCount++;
        score += negateWindow > 0 ? -1 * weight : 1 * weight;
      } else if (NEGATIVE.has(tk)) {
        matched = true;
        negCount++;
        score += negateWindow > 0 ? 1 * weight : -1 * weight;
      } else {
        neutralCount++;
      }

      if (negateWindow > 0) negateWindow--;
    }

    return {
      score,
      posCount,
      negCount,
      neutralCount,
      tokensCount: tokens.length,

      isPositive: score > 0,
      isNegative: score < 0,
      isNeutral: score === 0,
    };
  }

  // UI wiring
  window.addEventListener("load", () => {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const clearBtn = document.getElementById("clearBtn");
    const input = document.getElementById("textInput");
    const resultBox = document.getElementById("resultBox");
    const scoreBadge = document.getElementById("scoreBadge");
    const modeSelect = document.getElementById("modeSelect");

    function renderResult(text) {
      if (!text || text.trim().length === 0) {
        scoreBadge.textContent = "—";
        scoreBadge.className = "score-pill neutral";
        resultBox.textContent =
          "Please type some text in the left panel and click 'Analyze Sentiment'.";
        return;
      }

      const analysis = analyzeText(text);
      const { score, posCount, negCount, neutralCount, tokensCount } = analysis;
      let label = "Neutral";
      let cls = "neutral";
      if (score > 0) {
        label = "Positive";
        cls = "positive";
      } else if (score < 0) {
        label = "Negative";
        cls = "negative";
      }

      scoreBadge.textContent = `${label} (${score})`;
      scoreBadge.className = `score-pill ${cls}`;

      if (modeSelect.value === "detailed") {
        resultBox.textContent = [
          `Input length (tokens): ${tokensCount}`,
          `Positive hits: ${posCount}`,
          `Negative hits: ${negCount}`,
          `Neutral hits: ${neutralCount}`,
          `Overall score: ${score}`,
          "",
          "Full analysis note: this is a lightweight wordlist-based analyzer.",
          "",
          "Original Text:",
          text,
        ].join("\n");
      } else {
        const emoji = score > 0 ? "😊" : score < 0 ? "😡" : "😐";
        resultBox.textContent = `${emoji} ${label}\n\nScore: ${score}\n\n"${text}"`;
      }
    }

    analyzeBtn.addEventListener("click", () => {
      renderResult(input.value);
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      renderResult("");
    });

    let debounceTimer = 0;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (input.value.trim().length === 0) {
          renderResult("");
        } else {
          renderResult(input.value);
        }
      }, 450);
    });

    renderResult("");
  });
})();
