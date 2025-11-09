document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('commitForm');
    const commitType = document.getElementById('commitType');
    const scope = document.getElementById('scope');
    const description = document.getElementById('description');
    const body = document.getElementById('body');
    const footer = document.getElementById('footer');
    const preview = document.getElementById('preview');
    const copyBtn = document.getElementById('copyBtn');
    const copySuccess = document.getElementById('copySuccess');

    // Load last used commit type from localStorage
    const lastUsedType = localStorage.getItem('lastCommitType');
    if (lastUsedType && commitType.querySelector(`option[value="${lastUsedType}"]`)) {
        commitType.value = lastUsedType;
    }

    // Update preview when any input changes
    const updatePreview = () => {
        // Get the selected option's text to extract emoji
        const selectedOption = commitType.options[commitType.selectedIndex];
        const emoji = selectedOption.textContent.split(' ')[0];
        
        // Build the commit message
        let message = '';
        
        // Header
        const scopeText = scope.value ? `(${scope.value})` : '';
        message += `${emoji} ${commitType.value}${scopeText}: ${description.value}\n`;
        
        // Body
        if (body.value) {
            message += `\n${body.value}\n`;
        }
        
        // Footer
        if (footer.value) {
            message += `\n${footer.value}`;
        }
        
        // Update preview
        preview.textContent = message;
        
        // Save commit type preference
        localStorage.setItem('lastCommitType', commitType.value);
    };

    // Add input event listeners
    [commitType, scope, description, body, footer].forEach(element => {
        element.addEventListener('input', updatePreview);
    });

    // Copy to clipboard functionality
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(preview.textContent);
            copySuccess.classList.add('show');
            setTimeout(() => {
                copySuccess.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });

    // Initialize preview
    updatePreview();

    // Auto-focus description input
    description.focus();
});