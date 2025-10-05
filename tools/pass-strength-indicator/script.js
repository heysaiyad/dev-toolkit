document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    const suggestionsList = document.getElementById('suggestions');

    function analyzePassword(password) {
        const analysis = {
            strength: 0,
            suggestions: []
        };

        // Length check
        if (password.length < 8) {
            analysis.suggestions.push('Add more characters (at least 8)');
        } else {
            analysis.strength += 25;
        }

        // Uppercase check
        if (!password.match(/[A-Z]/)) {
            analysis.suggestions.push('Add uppercase letters');
        } else {
            analysis.strength += 25;
        }

        // Numbers check
        if (!password.match(/[0-9]/)) {
            analysis.suggestions.push('Add numbers');
        } else {
            analysis.strength += 25;
        }

        // Special characters check
        if (!password.match(/[^A-Za-z0-9]/)) {
            analysis.suggestions.push('Add special characters (!@#$%^&*)');
        } else {
            analysis.strength += 25;
        }

        return analysis;
    }

    function updateUI(analysis) {
        // Update strength bar
        strengthFill.style.width = `${analysis.strength}%`;
        strengthFill.className = '';
        
        if (analysis.strength <= 25) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Strength: Weak';
        } else if (analysis.strength <= 50) {
            strengthFill.classList.add('fair');
            strengthText.textContent = 'Strength: Fair';
        } else if (analysis.strength <= 75) {
            strengthFill.classList.add('good');
            strengthText.textContent = 'Strength: Good';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strength: Strong';
        }

        // Update suggestions
        suggestionsList.innerHTML = analysis.suggestions
            .map(suggestion => `<li><i class="fas fa-info-circle"></i>${suggestion}</li>`)
            .join('');
    }

    // Event listener
    passwordInput.addEventListener('input', (e) => {
        const analysis = analyzePassword(e.target.value);
        updateUI(analysis);
    });
});
