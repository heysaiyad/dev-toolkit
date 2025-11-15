(() => {
  // Enhanced word lists with more comprehensive vocabulary
  const POSITIVE = new Set([
    "good", "great", "excellent", "love", "loved", "loving", "nice", "wonderful",
    "amazing", "awesome", "happy", "joy", "joyful", "fantastic", "best", "better",
    "yay", "like", "liked", "likes", "pleasant", "fortunate", "correct", "positive",
    "success", "successful", "win", "winner", "winning", "enjoy", "enjoyed", "enjoying",
    "beautiful", "brilliant", "superb", "perfect", "outstanding", "exceptional",
    "delightful", "marvelous", "fabulous", "splendid", "terrific", "impressive",
    "grateful", "thankful", "appreciate", "appreciated", "caring", "kind", "friendly",
    "helpful", "supportive", "encouraging", "inspiring", "motivated", "excited",
    "thrilled", "ecstatic", "cheerful", "pleased", "satisfied", "content", "comfortable",
    "relaxed", "peaceful", "calm", "serene", "hopeful", "optimistic", "confident",
    "proud", "accomplished", "achieving", "valuable", "worthy", "beneficial",
    "effective", "efficient", "productive", "innovative", "creative", "talent",
    "skilled", "capable", "competent", "reliable", "trustworthy", "honest"
  ]);

  const NEGATIVE = new Set([
    "bad", "terrible", "awful", "hate", "hated", "hating", "hates", "horrible",
    "worse", "worst", "sad", "angry", "angrily", "anger", "disappoint", "disappointed",
    "disappointing", "fail", "failed", "failure", "failing", "problem", "problems",
    "negative", "issue", "issues", "unhappy", "poor", "annoy", "annoyed", "annoying",
    "dislike", "disliked", "ugly", "disgusting", "revolting", "nasty", "dreadful",
    "pathetic", "useless", "worthless", "inadequate", "inferior", "wrong", "incorrect",
    "mistake", "error", "flawed", "defective", "broken", "damaged", "harmful",
    "painful", "suffering", "miserable", "depressed", "anxious", "worried", "scared",
    "afraid", "fearful", "terrified", "horrified", "shocked", "upset", "frustrated",
    "irritated", "furious", "outraged", "hostile", "aggressive", "cruel", "mean",
    "rude", "offensive", "insulting", "disrespectful", "unfair", "unjust", "biased",
    "dishonest", "untrustworthy", "unreliable", "incompetent", "lazy", "careless"
  ]);

  // Intensifiers that amplify sentiment
  const INTENSIFIERS = new Set([
    "very", "extremely", "super", "really", "so", "absolutely", "totally",
    "completely", "utterly", "highly", "incredibly", "exceptionally", "remarkably",
    "extraordinarily", "immensely", "hugely", "tremendously", "profoundly"
  ]);

  // Negators that flip sentiment
  const NEGATORS = new Set([
    "not", "no", "never", "none", "n't", "cannot", "cant", "can't",
    "neither", "nor", "nothing", "nobody", "nowhere", "hardly", "barely", "scarcely"
  ]);

  // Diminishers that reduce sentiment intensity
  const DIMINISHERS = new Set([
    "slightly", "somewhat", "kind", "kinda", "sort", "sorta", "little",
    "bit", "barely", "hardly", "scarcely", "rarely", "seldom"
  ]);

  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[""'(){}\[\]|<>:;,.?\/\\@#$%^&*+=~`]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function analyzeText(text) {
    const tokens = tokenize(text);
    let score = 0;
    let posCount = 0;
    let negCount = 0;
    let neutralCount = 0;
    let negateWindow = 0;
    let intensifyNext = false;
    let diminishNext = false;

    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i];

      // Skip very short tokens
      if (tk.length <= 1) {
        neutralCount++;
        continue;
      }

      // Handle negators
      if (NEGATORS.has(tk)) {
        negateWindow = 3; // Affect next 3 words
        neutralCount++;
        continue;
      }

      // Handle intensifiers
      if (INTENSIFIERS.has(tk)) {
        intensifyNext = true;
        neutralCount++;
        continue;
      }

      // Handle diminishers
      if (DIMINISHERS.has(tk)) {
        diminishNext = true;
        neutralCount++;
        continue;
      }

      // Calculate weight based on modifiers
      let weight = 1;
      if (intensifyNext) {
        weight = 2.5;
        intensifyNext = false;
      } else if (diminishNext) {
        weight = 0.5;
        diminishNext = false;
      }

      // Check for sentiment words
      let matched = false;
      if (POSITIVE.has(tk)) {
        matched = true;
        posCount++;
        if (negateWindow > 0) {
          score -= 1 * weight; // Negated positive becomes negative
        } else {
          score += 1 * weight;
        }
      } else if (NEGATIVE.has(tk)) {
        matched = true;
        negCount++;
        if (negateWindow > 0) {
          score += 1 * weight; // Negated negative becomes positive
        } else {
          score -= 1 * weight;
        }
      } else {
        neutralCount++;
      }

      // Decay negation window
      if (negateWindow > 0) negateWindow--;
    }

    // Normalize score based on text length for better categorization
    const normalizedScore = tokens.length > 0 ? score / Math.sqrt(tokens.length) : 0;

    return {
      score,
      normalizedScore,
      posCount,
      negCount,
      neutralCount,
      tokensCount: tokens.length,
      category: getCategory(normalizedScore, score),
    };
  }

  function getCategory(normalizedScore, rawScore) {
    // Use normalized score for categorization with adjusted thresholds
    if (normalizedScore >= 2.0 || rawScore >= 8) {
      return {
        name: "Highly Positive",
        class: "highly-positive",
        emoji: "🤩",
        icon: "fa-heart"
      };
    } else if (normalizedScore > 0.5 || rawScore > 2) {
      return {
        name: "Positive",
        class: "positive",
        emoji: "😊",
        icon: "fa-smile"
      };
    } else if (normalizedScore >= -0.5 && normalizedScore <= 0.5 && Math.abs(rawScore) <= 2) {
      return {
        name: "Neutral",
        class: "neutral",
        emoji: "😐",
        icon: "fa-circle"
      };
    } else if (normalizedScore < -0.5 || rawScore < -2) {
      return {
        name: "Negative",
        class: "negative",
        emoji: "😠",
        icon: "fa-frown"
      };
    } else if (normalizedScore <= -2.0 || rawScore <= -8) {
      return {
        name: "Highly Negative",
        class: "highly-negative",
        emoji: "😡",
        icon: "fa-angry"
      };
    }
    
    // Default to neutral
    return {
      name: "Neutral",
      class: "neutral",
      emoji: "😐",
      icon: "fa-circle"
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

    function updateScaleIndicator(category) {
      const scaleItems = document.querySelectorAll('.scale-item');
      scaleItems.forEach(item => item.classList.remove('active'));
      
      const categoryMap = {
        'highly-negative': 0,
        'negative': 1,
        'neutral': 2,
        'positive': 3,
        'highly-positive': 4
      };
      
      const index = categoryMap[category.class];
      if (index !== undefined && scaleItems[index]) {
        scaleItems[index].classList.add('active');
      }
    }

    function renderResult(text) {
      if (!text || text.trim().length === 0) {
        scoreBadge.innerHTML = '<i class="fas fa-circle"></i> Not Analyzed';
        scoreBadge.className = "score-pill neutral";
        resultBox.textContent =
          "Please type some text in the left panel. Analysis happens automatically as you type!";
        
        // Reset scale
        const scaleItems = document.querySelectorAll('.scale-item');
        scaleItems.forEach(item => item.classList.remove('active'));
        return;
      }

      const analysis = analyzeText(text);
      const { score, normalizedScore, posCount, negCount, neutralCount, tokensCount, category } = analysis;

      scoreBadge.innerHTML = `<i class="fas ${category.icon}"></i> ${category.name} (${score.toFixed(1)})`;
      scoreBadge.className = `score-pill ${category.class}`;

      // Update scale indicator
      updateScaleIndicator(category);

      if (modeSelect.value === "detailed") {
        const percentage = tokensCount > 0 ? {
          pos: ((posCount / tokensCount) * 100).toFixed(1),
          neg: ((negCount / tokensCount) * 100).toFixed(1),
          neu: ((neutralCount / tokensCount) * 100).toFixed(1)
        } : { pos: 0, neg: 0, neu: 0 };

        resultBox.textContent = [
          `═══════════════════════════════════════════`,
          `  DETAILED SENTIMENT ANALYSIS REPORT`,
          `═══════════════════════════════════════════`,
          ``,
          `Overall Sentiment: ${category.emoji} ${category.name}`,
          ``,
          `Scores:`,
          `  • Raw Score: ${score.toFixed(2)}`,
          `  • Normalized Score: ${normalizedScore.toFixed(2)}`,
          ``,
          `Word Analysis:`,
          `  • Total Tokens: ${tokensCount}`,
          `  • Positive Words: ${posCount} (${percentage.pos}%)`,
          `  • Negative Words: ${negCount} (${percentage.neg}%)`,
          `  • Neutral Words: ${neutralCount} (${percentage.neu}%)`,
          ``,
          `Sentiment Distribution:`,
          `  Positive: ${'█'.repeat(Math.round(percentage.pos / 5))} ${percentage.pos}%`,
          `  Negative: ${'█'.repeat(Math.round(percentage.neg / 5))} ${percentage.neg}%`,
          `  Neutral:  ${'█'.repeat(Math.round(percentage.neu / 5))} ${percentage.neu}%`,
          ``,
          `═══════════════════════════════════════════`,
          `Original Text:`,
          `───────────────────────────────────────────`,
          text,
        ].join("\n");
      } else {
        const confidenceBar = '█'.repeat(Math.min(20, Math.round(Math.abs(normalizedScore) * 5)));
        resultBox.textContent = [
          `${category.emoji} ${category.name}`,
          ``,
          `Sentiment Score: ${score.toFixed(1)}`,
          `Confidence: ${confidenceBar}`,
          ``,
          `Words Analyzed: ${tokensCount}`,
          `Positive: ${posCount} | Negative: ${negCount} | Neutral: ${neutralCount}`,
          ``,
          `─────────────────────────────────────`,
          `"${text}"`,
        ].join("\n");
      }
    }

    // Manual analyze button (kept for explicit action)
    analyzeBtn.addEventListener("click", () => {
      renderResult(input.value);
    });

    // Clear button
    clearBtn.addEventListener("click", () => {
      input.value = "";
      renderResult("");
    });

    // Auto-analyze on input with debouncing
    let debounceTimer = 0;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderResult(input.value);
      }, 300); // Reduced delay for more responsive feel
    });

    // Initialize
    renderResult("");
  });
})();