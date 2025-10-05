const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");
const suggestionsList = document.getElementById("suggestions");
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn.addEventListener("click", () => {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  toggleBtn.textContent = type === "password" ? "Show" : "Hide";
});

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  updateStrength(password);
});

function updateStrength(password) {
  const score = calculateStrength(password);
  const { level, color, suggestions } = score;
  const width = score.percent;

  strengthBar.style.width = width + "%";
  strengthBar.style.backgroundColor = color;
  strengthText.textContent = `Strength: ${level}`;

  suggestionsList.innerHTML = "";
  suggestions.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    suggestionsList.appendChild(li);
  });
}

function calculateStrength(password) {
  let score = 0;
  const suggestions = [];

  if (!password)
    return { percent: 0, level: "None", color: "#ddd", suggestions };

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (length >= 12) score += 30;
  else if (length >= 8) score += 20;
  else score += 10;

  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasNumber) score += 10;
  if (hasSymbol) score += 10;

  if (length > 14 && hasUpper && hasLower && hasNumber && hasSymbol)
    score += 20;

  if (/1234|abcd|qwerty|password/i.test(password)) {
    score -= 20;
    suggestions.push("Avoid common words or patterns");
  }

  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    suggestions.push("Avoid repeating characters");
  }

  if (length < 12) suggestions.push("Increase length to 12+ characters");
  if (!hasUpper) suggestions.push("Add uppercase letters (A–Z)");
  if (!hasLower) suggestions.push("Add lowercase letters (a–z)");
  if (!hasNumber) suggestions.push("Include numbers (0–9)");
  if (!hasSymbol) suggestions.push("Add symbols (!@#$ etc.)");

  let level = "Weak";
  let color = "#e74c3c";
  const percent = Math.max(0, Math.min(100, score));

  if (percent >= 80) {
    level = "Strong";
    color = "#2ecc71";
  } else if (percent >= 60) {
    level = "Good";
    color = "#f1c40f";
  } else if (percent >= 40) {
    level = "Fair";
    color = "#e67e22";
  }

  return { percent, level, color, suggestions };
}
