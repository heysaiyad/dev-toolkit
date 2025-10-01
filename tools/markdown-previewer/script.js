// Markdown Previewer - Enhanced Edition
document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdown-input');
    const preview = document.getElementById('preview');
    const copyMarkdownBtn = document.getElementById('copy-markdown');
    const copyHtmlBtn = document.getElementById('copy-html');
    const downloadBtn = document.getElementById('download-md');

    // Initialize with placeholder content
    setTimeout(() => {
        updatePreview();
    }, 100);

    // Real-time preview update
    markdownInput.addEventListener('input', updatePreview);
    markdownInput.addEventListener('keyup', updatePreview);
    markdownInput.addEventListener('change', updatePreview);

    function updatePreview() {
        const markdown = markdownInput.value;

        if (!markdown || !markdown.trim()) {
            preview.innerHTML = '<p style="color: rgba(255, 255, 255, 0.3); text-align: center; padding: 3rem;">Start typing to see the preview...</p>';
            return;
        }

        const html = parseMarkdown(markdown);
        preview.innerHTML = html;
    }

    function parseMarkdown(md) {
        let html = md;

        // Code blocks FIRST (to protect content)
        html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
            return '<pre><code>' + escapeHtml(code.trim()) + '</code></pre>';
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        // Unordered lists
        html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
        html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
        html = html.replace(/^\+ (.+)$/gim, '<li>$1</li>');

        // Wrap list items in ul
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

        // Blockquotes
        html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

        // Horizontal rules
        html = html.replace(/^---$/gim, '<hr>');

        // Line breaks
        html = html.replace(/\n$/gim, '<br>');

        // Paragraphs
        html = html.split('\n\n').map(block => {
            if (block.match(/^<(h\d|ul|ol|li|blockquote|pre|hr)/)) {
                return block;
            }
            return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        }).join('\n');

        return html;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Copy Markdown button
    copyMarkdownBtn.addEventListener('click', async function() {
        const markdown = markdownInput.value;

        if (!markdown.trim()) {
            showFeedback(this, 'Nothing to copy!', false);
            return;
        }

        try {
            await navigator.clipboard.writeText(markdown);
            showFeedback(this, 'Markdown Copied!', true);
        } catch (error) {
            // Fallback
            markdownInput.select();
            document.execCommand('copy');
            showFeedback(this, 'Markdown Copied!', true);
        }
    });

    // Copy HTML button
    copyHtmlBtn.addEventListener('click', async function() {
        const html = preview.innerHTML;

        if (!html || html.includes('Start typing')) {
            showFeedback(this, 'Nothing to copy!', false);
            return;
        }

        try {
            await navigator.clipboard.writeText(html);
            showFeedback(this, 'HTML Copied!', true);
        } catch (error) {
            // Fallback
            const temp = document.createElement('textarea');
            temp.value = html;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showFeedback(this, 'HTML Copied!', true);
        }
    });

    // Download Markdown button
    downloadBtn.addEventListener('click', function() {
        const markdown = markdownInput.value;

        if (!markdown.trim()) {
            showFeedback(this, 'Nothing to download!', false);
            return;
        }

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document_' + Date.now() + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showFeedback(this, 'Downloaded!', true);
    });

    // Show feedback on buttons
    function showFeedback(button, message, success) {
        const originalHTML = button.innerHTML;
        const originalClass = button.className;

        if (success) {
            button.classList.add('success');
            button.innerHTML = '<i class="fas fa-check"></i> ' + message;
        } else {
            button.innerHTML = '<i class="fas fa-times"></i> ' + message;
        }

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.className = originalClass;
        }, 2000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadBtn.click();
        }

        // Ctrl/Cmd + Shift + C to copy markdown
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyMarkdownBtn.click();
        }

        // Ctrl/Cmd + Shift + H to copy HTML
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
            e.preventDefault();
            copyHtmlBtn.click();
        }

        // Tab support in textarea
        if (e.key === 'Tab' && e.target === markdownInput) {
            e.preventDefault();
            const start = markdownInput.selectionStart;
            const end = markdownInput.selectionEnd;
            const value = markdownInput.value;
            markdownInput.value = value.substring(0, start) + '  ' + value.substring(end);
            markdownInput.selectionStart = markdownInput.selectionEnd = start + 2;
            updatePreview();
        }
    });

    // Auto-save to localStorage
    markdownInput.addEventListener('input', function() {
        localStorage.setItem('markdown-content', markdownInput.value);
    });

    // Load from localStorage on page load
    const savedContent = localStorage.getItem('markdown-content');
    if (savedContent) {
        const useSaved = confirm('Found saved content. Do you want to load it?');
        if (useSaved) {
            markdownInput.value = savedContent;
            updatePreview();
        }
    }
});
