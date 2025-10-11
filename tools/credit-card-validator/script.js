// Credit Card Validator using Luhn Algorithm
document.addEventListener('DOMContentLoaded', function() {
    const cardInput = document.getElementById('card-number');
    const cardInputContainer = document.getElementById('card-input-container');
    const cardIcon = document.getElementById('card-icon');
    const validationResult = document.getElementById('validation-result');
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultDescription = document.getElementById('result-description');
    const cardInfo = document.getElementById('card-info');
    const sampleCards = document.querySelectorAll('.sample-card');

    // Card type patterns
    const cardTypes = {
        visa: {
            pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
            name: 'Visa',
            icon: 'fab fa-cc-visa'
        },
        mastercard: {
            pattern: /^5[1-5][0-9]{14}$/,
            name: 'Mastercard',
            icon: 'fab fa-cc-mastercard'
        },
        amex: {
            pattern: /^3[47][0-9]{13}$/,
            name: 'American Express',
            icon: 'fab fa-cc-amex'
        },
        discover: {
            pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            name: 'Discover',
            icon: 'fab fa-cc-discover'
        },
        diners: {
            pattern: /^3[0689][0-9]{11}$/,
            name: 'Diners Club',
            icon: 'fas fa-credit-card'
        },
        jcb: {
            pattern: /^(?:2131|1800|35\d{3})\d{11}$/,
            name: 'JCB',
            icon: 'fas fa-credit-card'
        }
    };

    // Luhn Algorithm Implementation
    function luhnCheck(cardNumber) {
        // Remove all non-digit characters
        const cleanNumber = cardNumber.replace(/\D/g, '');
        
        if (cleanNumber.length < 13 || cleanNumber.length > 19) {
            return false;
        }

        let sum = 0;
        let isEven = false;

        // Process digits from right to left
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    // Identify card type
    function identifyCardType(cardNumber) {
        const cleanNumber = cardNumber.replace(/\D/g, '');
        
        for (const [type, config] of Object.entries(cardTypes)) {
            if (config.pattern.test(cleanNumber)) {
                return { type, ...config };
            }
        }
        
        return { type: 'unknown', name: 'Unknown', icon: 'fas fa-credit-card' };
    }

    // Format card number with spaces
    function formatCardNumber(value) {
        const cleanValue = value.replace(/\D/g, '');
        const formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
        return formatted;
    }

    // Validate and display result
    function validateCard() {
        const cardNumber = cardInput.value.replace(/\D/g, '');
        
        if (cardNumber.length === 0) {
            hideResult();
            return;
        }

        const isValid = luhnCheck(cardNumber);
        const cardType = identifyCardType(cardNumber);
        
        // Update input container styling
        cardInputContainer.className = 'card-input-container';
        if (cardNumber.length >= 13) {
            cardInputContainer.classList.add(isValid ? 'valid' : 'invalid');
        }

        // Update card icon
        cardIcon.innerHTML = `<i class="${cardType.icon}"></i>`;

        // Show validation result
        showValidationResult(isValid, cardType, cardNumber);
    }

    // Show validation result
    function showValidationResult(isValid, cardType, cardNumber) {
        validationResult.style.display = 'block';
        validationResult.className = `validation-result ${isValid ? 'valid' : 'invalid'}`;
        
        // Update result icon and title
        const iconElement = resultIcon.querySelector('i');
        iconElement.className = isValid ? 'fas fa-check-circle' : 'fas fa-times-circle';
        resultIcon.className = `result-icon ${isValid ? 'valid' : 'invalid'}`;
        
        resultTitle.textContent = isValid ? 'Valid Card Number' : 'Invalid Card Number';
        resultTitle.className = `result-title ${isValid ? 'valid' : 'invalid'}`;
        
        resultDescription.textContent = isValid 
            ? 'This credit card number passes the Luhn algorithm validation.'
            : 'This credit card number does not pass the Luhn algorithm validation.';

        // Update card info
        updateCardInfo(cardType, cardNumber, isValid);
        
        // Animate result
        setTimeout(() => {
            validationResult.style.transform = 'scale(1.02)';
            setTimeout(() => {
                validationResult.style.transform = 'scale(1)';
            }, 200);
        }, 50);
    }

    // Update card information
    function updateCardInfo(cardType, cardNumber, isValid) {
        const formattedNumber = formatCardNumber(cardNumber);
        const maskedNumber = formattedNumber.replace(/\d(?=\d{4})/g, '*');
        
        cardInfo.innerHTML = `
            <div class="info-item">
                <div class="info-label">Card Type</div>
                <div class="info-value">${cardType.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Card Number</div>
                <div class="info-value">${maskedNumber}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Length</div>
                <div class="info-value">${cardNumber.length} digits</div>
            </div>
            <div class="info-item">
                <div class="info-label">Validation</div>
                <div class="info-value" style="color: ${isValid ? 'var(--success-color)' : 'var(--error-color)'}">
                    ${isValid ? 'Valid' : 'Invalid'}
                </div>
            </div>
        `;
    }

    // Hide validation result
    function hideResult() {
        validationResult.style.display = 'none';
        cardInputContainer.className = 'card-input-container';
        cardIcon.innerHTML = '<i class="fas fa-credit-card"></i>';
    }

    // Debounced validation for better performance
    let validationTimeout;
    function debouncedValidation() {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(validateCard, 150);
    }

    // Event listeners
    cardInput.addEventListener('input', function(e) {
        // Format the input as user types
        const cursorPosition = e.target.selectionStart;
        const formatted = formatCardNumber(e.target.value);
        
        e.target.value = formatted;
        
        // Restore cursor position
        const newCursorPosition = cursorPosition + (formatted.length - e.target.value.length);
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
        
        debouncedValidation();
    });

    cardInput.addEventListener('paste', function(e) {
        setTimeout(() => {
            const formatted = formatCardNumber(e.target.value);
            e.target.value = formatted;
            validateCard();
        }, 10);
    });

    cardInput.addEventListener('keydown', function(e) {
        // Allow: backspace, delete, tab, escape, enter, home, end, left, right, up, down
        if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    // Sample card click handlers
    sampleCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardNumber = this.getAttribute('data-card');
            cardInput.value = formatCardNumber(cardNumber);
            validateCard();
            
            // Scroll to input
            cardInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardInput.focus();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Auto-focus on load
    cardInput.focus();

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+L to clear input
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            cardInput.value = '';
            hideResult();
            cardInput.focus();
        }
        
        // Enter to validate (if input has focus)
        if (e.key === 'Enter' && document.activeElement === cardInput) {
            e.preventDefault();
            validateCard();
        }
    });

    // Add visual feedback for typing
    cardInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.3)';
    });

    cardInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
        this.parentElement.style.boxShadow = '';
    });

    // Add loading animation for validation
    function showValidationLoading() {
        const icon = cardIcon.querySelector('i');
        icon.style.animation = 'spin 1s linear infinite';
    }

    function hideValidationLoading() {
        const icon = cardIcon.querySelector('i');
        icon.style.animation = '';
    }

    // Enhanced validation with loading animation
    function enhancedValidateCard() {
        const cardNumber = cardInput.value.replace(/\D/g, '');
        
        if (cardNumber.length === 0) {
            hideResult();
            return;
        }

        showValidationLoading();
        
        // Simulate processing time for better UX
        setTimeout(() => {
            hideValidationLoading();
            validateCard();
        }, 300);
    }

    // Replace debounced validation with enhanced version
    cardInput.removeEventListener('input', debouncedValidation);
    cardInput.addEventListener('input', function(e) {
        // Format the input as user types
        const cursorPosition = e.target.selectionStart;
        const formatted = formatCardNumber(e.target.value);
        
        e.target.value = formatted;
        
        // Restore cursor position
        const newCursorPosition = cursorPosition + (formatted.length - e.target.value.length);
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Clear timeout and set new one
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(enhancedValidateCard, 300);
    });

    // Add CSS for animations
    const enhancedStyle = document.createElement('style');
    enhancedStyle.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .card-input-container {
            transition: all 0.3s ease;
        }
        
        .validation-result {
            transition: all 0.3s ease;
        }
        
        .sample-card {
            transition: all 0.2s ease;
        }
        
        .sample-card:active {
            transform: scale(0.95);
        }
        
        .info-item {
            transition: all 0.3s ease;
        }
        
        .info-item:hover {
            background: rgba(255, 255, 255, 0.02);
            transform: translateY(-2px);
        }
        
        #card-number::-webkit-input-placeholder {
            transition: all 0.3s ease;
        }
        
        #card-number:focus::-webkit-input-placeholder {
            opacity: 0.5;
        }
    `;
    document.head.appendChild(enhancedStyle);

    // Initialize tool
    console.log('Credit Card Validator initialized successfully!');
});
