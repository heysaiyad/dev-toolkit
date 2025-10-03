// Modern Dev Toolkit JavaScript
// Interactive elements and animations

// Global error handling
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
});





document.addEventListener("DOMContentLoaded", function () {
  try {
    // Show loading screen
    initLoadingScreen();
    
    // Initialize all features
    initTypingEffect();
    initCounterAnimation();
    initToolsFilter();
    initScrollAnimations();
    initNavbarScroll();
    initSmoothScrolling();
    initParallaxEffect();
    initAdvancedSearch();
    initThemeSystem();
    initPerformanceMonitoring();
    initMobileMenu();
    initSidebar();
    initEnhancedNavigation();
    initMicroAnimations();
    initSectionAnimations();
    
    // Hide loading screen after initialization
    setTimeout(hideLoadingScreen, 1500);
  } catch (error) {
    console.error('Error during initialization:', error);
    hideLoadingScreen();
  }
});

// Advanced Loading Screen
function initLoadingScreen() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    // Add random loading messages
    const messages = [
      'Loading DevToolkit...',
      'Preparing tools...',
      'Setting up workspace...',
      'Almost ready...'
    ];
    const textElement = loadingOverlay.querySelector('.loading-text');
    let messageIndex = 0;
    
    const messageInterval = setInterval(() => {
      if (textElement) {
        textElement.textContent = messages[messageIndex];
        messageIndex = (messageIndex + 1) % messages.length;
      }
    }, 400);
    
    // Store interval to clear it later
    loadingOverlay.messageInterval = messageInterval;
  }
}

function hideLoadingScreen() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    // Clear message interval
    if (loadingOverlay.messageInterval) {
      clearInterval(loadingOverlay.messageInterval);
    }
    
    // Fade out with advanced animation
    loadingOverlay.classList.add('fade-out');
    
    setTimeout(() => {
      loadingOverlay.remove();
    }, 800);
  }
}

// Typing Effect Animation with performance optimization
function initTypingEffect() {
  const typingText = document.querySelector(".typing-text");
  if (!typingText) return;

  const messages = [
    "Build Amazing Tools",
    "Join Open Source",
    "Code Something Great",
    "Make a Difference",
    "Create & Contribute",
  ];

  let messageIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let animationId;

  function typeMessage() {
    const currentMessage = messages[messageIndex];

    if (isDeleting) {
      typingText.textContent = currentMessage.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typingText.textContent = currentMessage.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentMessage.length) {
      setTimeout(() => (isDeleting = true), 2000);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      messageIndex = (messageIndex + 1) % messages.length;
    }

    animationId = setTimeout(typeMessage, typingSpeed);
  }

  typeMessage();
  
  // Cleanup function for better memory management
  return () => {
    if (animationId) {
      clearTimeout(animationId);
    }
  };
}

// Animated Counter
function initCounterAnimation() {
  const counters = document.querySelectorAll(".stat-number");
  const toolCards = document.querySelectorAll(".tool-card");
  const toolCounter = document.querySelector('[data-stat="tools"]');
  if (toolCounter) {
    toolCounter.setAttribute("data-target", toolCards.length- 1);
  }
  const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute("data-target"));
    const count = parseInt(counter.innerText);
    const increment = target / 200;

    if (count < target) {
      counter.innerText = Math.ceil(count + increment);
      setTimeout(() => animateCounter(counter), 30);
    } else {
      counter.innerText = target;
    }
  };

  // Intersection Observer for counter animation
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          animateCounter(counter);
          counterObserver.unobserve(counter);
        }
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => {
    counter.innerText = "0";
    counterObserver.observe(counter);
  });
}

// Tools Filter System
function initToolsFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const toolCards = document.querySelectorAll(".tool-card:not(.add-tool-card)");
  const resultCount = document.getElementById("resultCount");
  
  // Filter system ready

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");

      const filterValue = button.getAttribute("data-filter");
      let visibleCount = 0;

      toolCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        
        if (filterValue === "all" || cardCategory === filterValue) {
          card.style.display = "flex";
          card.style.animation = "fadeInUp 0.5s ease-out";
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.style.display = "none";
          card.classList.add('hidden');
        }
      });
      
      // Update result count
      if (resultCount) {
        resultCount.textContent = visibleCount;
      }
    });
  });
}

// Scroll Animations
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".tool-card, .contribute-content, .footer-content"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  animatedElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    observer.observe(element);
  });
}

// Navbar Scroll Effect
function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
      navbar.style.background = "rgba(15, 15, 35, 0.98)";
      navbar.style.backdropFilter = "blur(30px)";
    } else {
      navbar.style.background = "rgba(15, 15, 35, 0.95)";
      navbar.style.backdropFilter = "blur(20px)";
    }

    // Hide navbar on scroll down, show on scroll up
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      navbar.style.transform = "translateY(-100%)";
    } else {
      navbar.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop;
  });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
}

// Parallax Effect for Background Shapes
function initParallaxEffect() {
  const shapes = document.querySelectorAll(".shape");

  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    shapes.forEach((shape, index) => {
      const speed = 0.2 + index * 0.1;
      shape.style.transform = `translateY(${scrolled * speed}px) rotate(${
        scrolled * 0.1
      }deg)`;
    });
  });
}

// Tool Card Hover Effects
document.addEventListener("DOMContentLoaded", function () {
  const toolCards = document.querySelectorAll(".tool-card:not(.add-tool-card)");

  toolCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-15px) scale(1.02)";
      this.style.boxShadow = "0 25px 50px rgba(255, 107, 53, 0.15)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
      this.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.2)";
    });
  });
});

// Add Tool Card Click Handler
document.addEventListener("DOMContentLoaded", function () {
  const addToolCard = document.querySelector(".add-tool-card");

  if (addToolCard) {
    addToolCard.addEventListener("click", function () {
      window.open("https://github.com/heysaiyad/dev-toolkit", "_blank");
    });
  }
});

// Button Ripple Effect
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

// Add ripple effect to buttons
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", createRipple);
  });
});

// Add CSS for ripple effect
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Loading Animation for Page
window.addEventListener("load", function () {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease-out";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
});

// Easter Egg: Konami Code
let konamiCode = [];
const correctCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A

document.addEventListener("keydown", function (e) {
  konamiCode.push(e.keyCode);

  if (konamiCode.length > correctCode.length) {
    konamiCode.shift();
  }

  if (JSON.stringify(konamiCode) === JSON.stringify(correctCode)) {
    // Easter egg animation
    document.body.style.animation = "rainbow 2s infinite";

    setTimeout(() => {
      document.body.style.animation = "";
    }, 10000);
  }
});

// Rainbow animation for easter egg
const rainbowStyle = document.createElement("style");
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// Advanced Search System
function initAdvancedSearch() {
  const searchInput = document.getElementById("toolSearch");
  const searchSuggestions = document.getElementById("searchSuggestions");
  const resultCount = document.getElementById("resultCount");
  const toolCards = document.querySelectorAll(".tool-card:not(.add-tool-card)");

  // Tool database for search
  const toolsDatabase = [
    {
      name: "Word Counter",
      description: "Advanced text analysis tool with real-time word, character, and paragraph counting",
      category: "text",
      keywords: ["word", "count", "text", "character", "paragraph", "analysis"],
      icon: "fas fa-font",
      url: "tools/word-counter/index.html",
    },
    {
      name: "Line Sorter & Unique",
      description: "Sort text lines alphabetically and remove duplicates",
      category: "text",
      keywords: ["sort", "unique", "lines", "text", "alphabetical", "duplicate"],
      icon: "fas fa-sort-alpha-down",
      url: "tools/line-sorter-unique/index.html",
    },
    {
      name: "Lorem Ipsum Generator",
      description: "Generate placeholder text for your designs and mockups",
      category: "text",
      keywords: ["lorem", "ipsum", "placeholder", "text", "generator"],
      icon: "fas fa-paragraph",
      url: "tools/lorem-ipsum-generator/index.html",
    },
    {
      name: "String Reverser",
      description: "Reverse any string or text instantly",
      category: "text",
      keywords: ["string", "reverse", "text", "flip"],
      icon: "fas fa-exchange-alt",
      url: "tools/string-reverser/index.html",
    },
    {
      name: "Base64 Encoder",
      description: "Encode and decode Base64 strings easily",
      category: "utility",
      keywords: ["base64", "encode", "decode", "string"],
      icon: "fas fa-code",
      url: "tools/base64-encoder/index.html",
    },
    {
      name: "Code Beautifier",
      description: "Format and beautify your code with syntax highlighting",
      category: "code",
      keywords: ["code", "format", "beautify", "syntax", "html", "css", "js"],
      icon: "fas fa-code",
      url: "tools/code-beautifier/index.html",
    },
    {
      name: "Even Odd Checker",
      description: "Check if a number is even or odd",
      category: "utility",
      keywords: ["even", "odd", "number", "check", "math"],
      icon: "fas fa-calculator",
      url: "tools/even-odd-checker/index.html",
    },
    {
      name: "Image Base64 Converter",
      description: "Convert images to Base64 and vice versa",
      category: "utility",
      keywords: ["image", "base64", "convert", "encode", "decode"],
      icon: "fas fa-image",
      url: "tools/image-base64-converter/index.html",
    },
    {
      name: "Markdown Previewer",
      description: "Preview markdown text with live rendering",
      category: "code",
      keywords: ["markdown", "preview", "md", "render", "text"],
      icon: "fab fa-markdown",
      url: "tools/markdown-previewer/index.html",
    },
    {
      name: "Password Generator",
      description: "Generate secure passwords with customizable options",
      category: "utility",
      keywords: ["password", "generate", "secure", "random"],
      icon: "fas fa-key",
      url: "tools/password-generator/index.html",
    },
    {
      name: "Percentage Calculator",
      description: "Calculate percentages, increase, and decrease",
      category: "utility",
      keywords: ["percentage", "calculate", "math", "percent"],
      icon: "fas fa-percentage",
      url: "tools/percentage-calculator/index.html",
    },
    {
      name: "Timer & Stopwatch",
      description: "Count down or count up with precision timing",
      category: "utility",
      keywords: ["timer", "stopwatch", "countdown", "time"],
      icon: "fas fa-stopwatch",
      url: "tools/timer-stopwatch/index.html",
    },
    {
      name: "Unix Timestamp Converter",
      description: "Convert between Unix timestamp and human-readable date",
      category: "utility",
      keywords: ["unix", "timestamp", "date", "convert", "time"],
      icon: "fas fa-clock",
      url: "tools/unix-timestamp-converter/index.html",
    },
    {
      name: "URL Encoder/Decoder",
      description: "Encode and decode URLs and URI components",
      category: "utility",
      keywords: ["url", "encode", "decode", "uri", "component"],
      icon: "fas fa-link",
      url: "tools/url-encoder-decoder/index.html",
    },
    {
      name: "UUID Generator",
      description: "Generate unique identifiers (UUID) in various formats",
      category: "utility",
      keywords: ["uuid", "generate", "unique", "identifier", "guid"],
      icon: "fas fa-fingerprint",
      url: "tools/uuid-generator/index.html",
    },
  ];

  let searchTimeout;

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch(this.value);
    }, 300);
  });

  searchInput.addEventListener("focus", function () {
    if (this.value.length > 0) {
      showSuggestions(this.value);
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-wrapper")) {
      hideSuggestions();
    }
  });

  function handleSearch(query) {
    const results = fuzzySearch(query, toolsDatabase);
    updateToolDisplay(results, query);
    updateResultCount(results.length);

    if (query.length > 0) {
      showSuggestions(query, results);
    } else {
      hideSuggestions();
      showAllTools();
    }
  }

  function fuzzySearch(query, tools) {
    if (!query) return tools;

    query = query.toLowerCase();
    return tools.filter((tool) => {
      const searchText = `${tool.name} ${tool.description} ${tool.keywords.join(
        " "
      )}`.toLowerCase();

      // Exact match gets highest priority
      if (searchText.includes(query)) return true;

      // Fuzzy matching for typos
      const words = query.split(" ");
      return words.some((word) => {
        return tool.keywords.some((keyword) => {
          return levenshteinDistance(word, keyword) <= 2;
        });
      });
    });
  }

  function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  function showSuggestions(query, results = null) {
    if (!results) results = fuzzySearch(query, toolsDatabase);

    if (results.length === 0) {
      hideSuggestions();
      return;
    }

    const suggestionsHTML = results
      .slice(0, 5)
      .map(
        (tool) => `
            <div class="suggestion-item" data-url="${tool.url}">
                <div class="suggestion-icon">
                    <i class="${tool.icon}"></i>
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${highlightText(
                      tool.name,
                      query
                    )}</div>
                    <div class="suggestion-description">${highlightText(
                      tool.description,
                      query
                    )}</div>
                </div>
            </div>
        `
      )
      .join("");

    searchSuggestions.innerHTML = suggestionsHTML;
    searchSuggestions.classList.add("show");

    // Add click handlers
    searchSuggestions.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", function () {
        const url = this.getAttribute("data-url");
        if (url !== "#") {
          window.location.href = url;
        }
      });
    });
  }

  function hideSuggestions() {
    searchSuggestions.classList.remove("show");
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(
      regex,
      '<mark style="background: var(--primary-color); color: white; padding: 0 2px; border-radius: 2px;">$1</mark>'
    );
  }

  function updateToolDisplay(results, query) {
    let visibleCount = 0;
    
    toolCards.forEach((card) => {
      const toolName = card.querySelector(".tool-title")?.textContent || "";
      const toolDesc = card.querySelector(".tool-description")?.textContent || "";

      let isMatch = false;
      
      if (query.length === 0) {
        isMatch = true;
      } else {
        // Check exact matches from search results
        isMatch = results.some((result) => 
          result.name.toLowerCase() === toolName.toLowerCase()
        );
        
        // Also check direct text matching as fallback
        if (!isMatch) {
          const searchTerm = query.toLowerCase();
          isMatch = toolName.toLowerCase().includes(searchTerm) ||
                   toolDesc.toLowerCase().includes(searchTerm);
        }
      }

      if (isMatch) {
        card.style.display = "flex";
        card.style.animation = "fadeInUp 0.5s ease-out";
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.style.display = "none";
        card.classList.add('hidden');
      }
    });
    
    updateResultCount(visibleCount);
  }

  function showAllTools() {
    let visibleCount = 0;
    toolCards.forEach((card) => {
      card.style.display = "flex";
      card.style.animation = "fadeInUp 0.5s ease-out";
      card.classList.remove('hidden');
      visibleCount++;
    });
    updateResultCount(visibleCount);
  }

  function updateResultCount(count) {
    resultCount.textContent = count;
  }

  // Initialize count
  updateResultCount(toolCards.length);
  
  // Search system initialized successfully
}

// Advanced Theme System
function initThemeSystem() {
  const themes = {
    hacktoberfest: {
      name: "Hacktoberfest",
      primary: "#ff6b35",
      secondary: "#0081b4",
      accent: "#ff8c42",
      bgPrimary: "#0f0f23",
      bgSecondary: "#1a1a2e",
    },
    midnight: {
      name: "Midnight Blue",
      primary: "#4a90e2",
      secondary: "#2c5aa0",
      accent: "#7bb3f0",
      bgPrimary: "#0a0e27",
      bgSecondary: "#1a1f3a",
    },
    neon: {
      name: "Neon Dreams",
      primary: "#00ff9f",
      secondary: "#00d4ff",
      accent: "#ff0090",
      bgPrimary: "#0d0208",
      bgSecondary: "#1a0f1a",
    },
    sunset: {
      name: "Sunset Vibes",
      primary: "#ff6b9d",
      secondary: "#ff8c42",
      accent: "#ffd23f",
      bgPrimary: "#2d1b1e",
      bgSecondary: "#3d2b2e",
    },
  };

  let currentTheme =
    localStorage.getItem("devtoolkit-theme") || "hacktoberfest";

  // Create theme selector (hidden by default, can be triggered with Ctrl+T)
  function createThemeSelector() {
    const themeSelector = document.createElement("div");
    themeSelector.className = "theme-selector";
    themeSelector.innerHTML = `
            <div class="theme-selector-content">
                <h3>Choose Theme</h3>
                <div class="theme-options">
                    ${Object.keys(themes)
                      .map(
                        (key) => `
                        <div class="theme-option ${
                          key === currentTheme ? "active" : ""
                        }" data-theme="${key}">
                            <div class="theme-preview">
                                <div class="color-primary" style="background: ${
                                  themes[key].primary
                                }"></div>
                                <div class="color-secondary" style="background: ${
                                  themes[key].secondary
                                }"></div>
                                <div class="color-accent" style="background: ${
                                  themes[key].accent
                                }"></div>
                            </div>
                            <span>${themes[key].name}</span>
                        </div>
                    `
                      )
                      .join("")}
                </div>
                <button class="close-theme-selector">×</button>
            </div>
        `;

    document.body.appendChild(themeSelector);

    // Add event listeners
    themeSelector.querySelectorAll(".theme-option").forEach((option) => {
      option.addEventListener("click", function () {
        const themeName = this.getAttribute("data-theme");
        applyTheme(themeName);

        // Update active state
        themeSelector
          .querySelectorAll(".theme-option")
          .forEach((opt) => opt.classList.remove("active"));
        this.classList.add("active");

        // Save preference
        localStorage.setItem("devtoolkit-theme", themeName);
        currentTheme = themeName;
      });
    });

    themeSelector
      .querySelector(".close-theme-selector")
      .addEventListener("click", function () {
        themeSelector.remove();
      });

    return themeSelector;
  }

  function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty("--primary-color", theme.primary);
    root.style.setProperty("--secondary-color", theme.secondary);
    root.style.setProperty("--accent-color", theme.accent);
    root.style.setProperty("--bg-primary", theme.bgPrimary);
    root.style.setProperty("--bg-secondary", theme.bgSecondary);

    // Update gradients
    root.style.setProperty(
      "--gradient-primary",
      `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
    );
    root.style.setProperty(
      "--gradient-secondary",
      `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`
    );

    // Add theme transition effect
    document.body.style.transition = "all 0.5s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 500);
  }

  // Keyboard shortcut to open theme selector (Ctrl+T)
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "t") {
      e.preventDefault();
      if (!document.querySelector(".theme-selector")) {
        createThemeSelector();
      }
    }
  });

  // Apply saved theme on load
  applyTheme(currentTheme);

  // Add theme selector styles
  const themeStyles = document.createElement("style");
  themeStyles.textContent = `
        .theme-selector {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        }

        .theme-selector-content {
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            padding: 2rem;
            position: relative;
            max-width: 500px;
            width: 90%;
        }

        .theme-selector h3 {
            margin-bottom: 1.5rem;
            text-align: center;
            color: var(--text-primary);
        }

        .theme-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .theme-option {
            background: var(--bg-primary);
            border: 2px solid transparent;
            border-radius: var(--radius-md);
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .theme-option:hover,
        .theme-option.active {
            border-color: var(--primary-color);
            transform: translateY(-5px);
        }

        .theme-preview {
            display: flex;
            gap: 4px;
            margin-bottom: 0.5rem;
            justify-content: center;
        }

        .theme-preview div {
            width: 20px;
            height: 20px;
            border-radius: 50%;
        }

        .close-theme-selector {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-muted);
            cursor: pointer;
        }
    `;
  document.head.appendChild(themeStyles);
}

// Performance Monitoring
function initPerformanceMonitoring() {
  // Monitor load times
  window.addEventListener("load", function () {
    const loadTime = performance.now();
    // DevToolkit loaded successfully

    // Track Core Web Vitals
    if ("web-vital" in window) {
      // This would integrate with web-vitals library if available
      // Web Vitals monitoring enabled
    }
  });

  // Monitor long tasks
  if ("PerformanceObserver" in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      // Browser doesn't support longtask API
    }
  }

  // Image lazy loading optimization
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove("lazy");
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Mobile Menu Functionality
function initMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navLinksItems = document.querySelectorAll(".nav-link");

  if (!mobileMenuToggle || !navLinks) return;

  // Toggle mobile menu
  mobileMenuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");

    // Toggle hamburger icon
    const icon = this.querySelector("i");
    if (navLinks.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });

  // Close menu when clicking on nav links
  navLinksItems.forEach((link) => {
    link.addEventListener("click", function () {
      navLinks.classList.remove("active");
      const icon = mobileMenuToggle.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    const isClickInsideNav =
      navLinks.contains(event.target) ||
      mobileMenuToggle.contains(event.target);

    if (!isClickInsideNav && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      const icon = mobileMenuToggle.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1025) {
      navLinks.classList.remove("active");
      const icon = mobileMenuToggle.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });
}

// Sidebar Navigation Functionality
function initSidebar() {
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebar = document.querySelector(".tools-sidebar");
  const sidebarClose = document.querySelector(".sidebar-close");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");
  const sidebarSearch = document.querySelector(".sidebar-search-input");
  const sidebarToolLinks = document.querySelectorAll(".sidebar-tool-link");

  if (!sidebarToggle || !sidebar) return;

  // Toggle sidebar
  function toggleSidebar() {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    document.body.style.overflow = sidebar.classList.contains("active")
      ? "hidden"
      : "";
  }

  // Open sidebar
  sidebarToggle.addEventListener("click", toggleSidebar);

  // Close sidebar
  if (sidebarClose) {
    sidebarClose.addEventListener("click", toggleSidebar);
  }

  // Close sidebar when clicking overlay
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", toggleSidebar);
  }

  // Close sidebar when pressing Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && sidebar.classList.contains("active")) {
      toggleSidebar();
    }
  });

  // Sidebar search functionality
  if (sidebarSearch) {
    sidebarSearch.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      const toolLinks = document.querySelectorAll(".sidebar-tool-link");
      const sections = document.querySelectorAll(".sidebar-section");

      toolLinks.forEach((link) => {
        const toolName =
          link.querySelector("span")?.textContent.toLowerCase() || "";
        const isMatch = toolName.includes(searchTerm);

        link.style.display = isMatch ? "flex" : "none";
      });

      // Hide sections that have no visible tools
      sections.forEach((section) => {
        const visibleTools = section.querySelectorAll(
          '.sidebar-tool-link[style="display: flex"], .sidebar-tool-link:not([style])'
        );
        const hasVisibleTools = Array.from(visibleTools).some(
          (tool) => !tool.style.display || tool.style.display === "flex"
        );
        section.style.display = hasVisibleTools ? "block" : "none";
      });
    });
  }

  // Handle tool link clicks
  sidebarToolLinks.forEach((link) => {
    if (!link.classList.contains("disabled")) {
      link.addEventListener("click", function () {
        // Close sidebar on tool selection (mobile/tablet)
        if (window.innerWidth <= 1024) {
          toggleSidebar();
        }
      });
    }
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
}

// Enhanced Navigation Features
function initEnhancedNavigation() {
  const navbar = document.querySelector(".navbar");
  let lastScrollTop = 0;

  // Enhanced scroll behavior for navbar
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add enhanced class when scrolled
    if (scrollTop > 100) {
      navbar.classList.add("enhanced");
    } else {
      navbar.classList.remove("enhanced");
    }

    // Auto-hide navbar on scroll down (mobile only)
    if (window.innerWidth <= 768) {
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.style.transform = "translateY(-100%)";
      } else {
        navbar.style.transform = "translateY(0)";
      }
    } else {
      navbar.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  // Throttled scroll handler
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(function () {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick);

  // Quick tool access shortcuts (keyboard)
  document.addEventListener("keydown", function (event) {
    // Alt + T to toggle sidebar
    if (event.altKey && event.key === "t") {
      event.preventDefault();
      const sidebarToggle = document.querySelector(".sidebar-toggle");
      if (sidebarToggle && window.innerWidth >= 769) {
        sidebarToggle.click();
      }
    }

    // Alt + S to focus sidebar search
    if (event.altKey && event.key === "s") {
      event.preventDefault();
      const sidebarSearch = document.querySelector(".sidebar-search-input");
      const sidebar = document.querySelector(".tools-sidebar");

      if (sidebarSearch && sidebar) {
        if (!sidebar.classList.contains("active")) {
          const sidebarToggle = document.querySelector(".sidebar-toggle");
          if (sidebarToggle) sidebarToggle.click();
        }
        setTimeout(() => sidebarSearch.focus(), 300);
      }
    }
  });

  // Add keyboard navigation indicators
  const keyboardHints = document.createElement("div");
  keyboardHints.className = "keyboard-hints";
  keyboardHints.innerHTML = `
        <div class="hint">Alt + T: Toggle Tools Sidebar</div>
        <div class="hint">Alt + S: Search Tools</div>
    `;
  keyboardHints.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(26, 26, 46, 0.9);
        backdrop-filter: blur(10px);
        padding: 0.5rem;
        border-radius: 8px;
        font-size: 0.8rem;
        color: var(--text-secondary);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        pointer-events: none;
    `;

  // Show keyboard hints on Alt key press
  document.addEventListener("keydown", function (event) {
    if (event.key === "Alt" && window.innerWidth >= 1025) {
      keyboardHints.style.opacity = "1";
      keyboardHints.style.visibility = "visible";
    }
  });

  document.addEventListener("keyup", function (event) {
    if (event.key === "Alt") {
      keyboardHints.style.opacity = "0";
      keyboardHints.style.visibility = "hidden";
    }
  });

  // Add hints to page
  document.body.appendChild(keyboardHints);
}

// Micro-animations and Enhanced Interactions
function initMicroAnimations() {
  // Add enhanced hover effects to all tool cards
  const toolCards = document.querySelectorAll(".tool-card");

  toolCards.forEach((card) => {
    // Add ripple effect on click
    card.addEventListener("click", function (e) {
      const ripple = document.createElement("div");
      const rect = card.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 107, 53, 0.3);
                border-radius: 50%;
                transform: scale(0);
                pointer-events: none;
                z-index: 10;
            `;

      card.style.position = "relative";
      card.appendChild(ripple);

      // Animate ripple
      ripple.animate(
        [
          { transform: "scale(0)", opacity: 1 },
          { transform: "scale(1)", opacity: 0 },
        ],
        {
          duration: 600,
          easing: "ease-out",
        }
      ).onfinish = () => ripple.remove();
    });

    // Add magnetic effect on mouse move
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      const moveX = deltaX * 5;
      const moveY = deltaY * 5;

      card.style.transform = `translateY(-12px) scale(1.02) translate(${moveX}px, ${moveY}px)`;
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });

  // Enhanced filter button animations
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    // remove pulsing class from all buttons and force reflow
    filterButtons.forEach((b) => {
      b.classList.remove("pulse");
      void b.offsetWidth;
    });

    // add class to clicked button
    this.classList.add("filter-btn-active");

    // remove class after animation ends (so it can be re-added next click)
    const onEnd = () => {
      this.classList.remove("filter-btn-active");
      this.removeEventListener("animationend", onEnd);
    };
    this.addEventListener("animationend", onEnd);
  });
});

  // Add loading shimmer to cards initially
  setTimeout(() => {
    toolCards.forEach((card, index) => {
      if (card.style.animationDelay) {
        card.addEventListener(
          "animationend",
          function () {
            this.classList.add("loaded");
          },
          { once: true }
        );
      }
    });
  }, 100);
}

// Section-based scroll animations
function initSectionAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const section = entry.target;

        // Trigger section title animation
        const title = section.querySelector(".section-title");
        if (title && !title.classList.contains("visible")) {
          title.classList.add("visible");
        }

        // Stagger tool card animations if they haven't been animated yet
        const cards = section.querySelectorAll(".tool-card:not(.animated)");
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add("animated");
          }, index * 50);
        });

        // Animate filter buttons if in tools section
        if (section.classList.contains("tools-section")) {
          const filterContainer = section.querySelector(".tools-filter");
          if (
            filterContainer &&
            !filterContainer.classList.contains("animated")
          ) {
            filterContainer.classList.add("animated");

            const buttons = filterContainer.querySelectorAll(".filter-btn");
            buttons.forEach((btn, index) => {
              setTimeout(() => {
                btn.style.animationDelay = `${index * 0.1}s`;
              }, index * 50);
            });
          }
        }
      }
    });
  }, observerOptions);

  // Observe all major sections
  const sections = document.querySelectorAll(
    ".tools-section, .contribute-section, .creator-section"
  );
  sections.forEach((section) => sectionObserver.observe(section));

  // Add smooth scroll reveal for any element with data-reveal attribute
  const revealElements = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = element.dataset.delay || 0;

          setTimeout(() => {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
          }, delay);

          revealObserver.unobserve(element);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    revealObserver.observe(element);
  });
}
