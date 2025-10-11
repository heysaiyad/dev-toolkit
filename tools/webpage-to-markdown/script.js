document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const urlInput = document.getElementById('url-input');
    const convertBtn = document.getElementById('convert-btn');
    const outputSection = document.getElementById('output-section');
    const output = document.getElementById('output');
    const copyBtn = document.getElementById('copy-btn');
    const errorMessage = document.getElementById('error-message');

    // Auto-focus on URL input
    urlInput.focus();

    /**
     * Initialize TurndownService with custom configuration
     */
    function createTurndownService() {
        const service = new TurndownService({
            headingStyle: 'atx',
            hr: '---',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
            emDelimiter: '_'
        });

        // Custom rule to remove empty paragraphs
        service.addRule('removeEmptyParagraphs', {
            filter: node => {
                return (
                    node.nodeName === 'P' &&
                    node.textContent.trim() === '' &&
                    !node.querySelector('img')
                );
            },
            replacement: () => ''
        });

        // Custom rule to handle code blocks better
        service.addRule('fencedCodeBlock', {
            filter: node => (
                node.nodeName === 'PRE' &&
                node.querySelector('code')
            ),
            replacement: (content, node) => {
                const code = node.querySelector('code');
                const language = code.className.replace('language-', '');
                const fence = '```';
                return `\n\n${fence}${language}\n${code.textContent}\n${fence}\n\n`;
            }
        });

        // Custom rule to handle tables better
        service.addRule('table', {
            filter: 'table',
            replacement: function(content, node) {
                const rows = Array.from(node.rows);
                const headers = rows.shift();
                const headerCells = Array.from(headers?.cells || []).map(cell => cell.textContent.trim());
                const separator = headerCells.map(() => '---');
                const bodyCells = rows.map(row => 
                    Array.from(row.cells).map(cell => cell.textContent.trim())
                );

                return [
                    `\n| ${headerCells.join(' | ')} |`,
                    `| ${separator.join(' | ')} |`,
                    ...bodyCells.map(row => `| ${row.join(' | ')} |`)
                ].join('\n') + '\n\n';
            }
        });

        return service;
    }

    /**
     * Clean up HTML content before conversion
     * @param {Document} doc - The parsed HTML document
     * @returns {Element} - The cleaned main content element
     */
    function cleanupContent(doc) {
        // Remove unwanted elements
        const elementsToRemove = doc.querySelectorAll('script, style, iframe, noscript, nav, footer, header, aside, .ad, .advertisement, .social-share, .comments');
        elementsToRemove.forEach(el => el.remove());

        // Find main content area
        const contentSelectors = [
            'main',
            'article',
            '[role="main"]',
            '.main-content',
            '.post-content',
            '.article-content',
            '#content',
            '.content'
        ];

        let mainContent;
        for (const selector of contentSelectors) {
            mainContent = doc.querySelector(selector);
            if (mainContent) break;
        }

        // If no main content found, use body but try to clean it up
        if (!mainContent) {
            mainContent = doc.body;
            // Remove common navigation and footer areas if using body
            const navFooterSelectors = ['nav', 'footer', 'header', '.navigation', '.footer', '.header'];
            navFooterSelectors.forEach(selector => {
                const elements = mainContent.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
        }

        // Clean up links
        const links = mainContent.getElementsByTagName('a');
        Array.from(links).forEach(link => {
            if (!link.getAttribute('href')) {
                link.remove();
            }
        });

        return mainContent;
    }

    // Convert button click handler
    convertBtn.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('Please enter a valid URL');
            return;
        }

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL starting with http:// or https://');
            return;
        }

        try {
            // Show loading state
            convertBtn.disabled = true;
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
            hideError();

            // Fetch webpage content using proxy API with fallbacks
            const proxies = [
                {
                    url: (targetUrl) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
                    handler: async (response) => {
                        const data = await response.json();
                        return data.contents;
                    }
                },
                {
                    url: (targetUrl) => `https://api.scraperapi.com/scrape?url=${encodeURIComponent(targetUrl)}`,
                    handler: async (response) => await response.text()
                },
                {
                    url: (targetUrl) => `https://proxy.scrapeops.io/v1/?api_key=free-trial&url=${encodeURIComponent(targetUrl)}`,
                    handler: async (response) => await response.text()
                }
            ];

            let content = null;
            let lastError = null;

            for (const proxy of proxies) {
                try {
                    const proxyUrl = proxy.url(url);
                    const response = await fetch(proxyUrl);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const rawContent = await proxy.handler(response);
                    if (!rawContent) {
                        throw new Error('No content received');
                    }

                    content = rawContent;
                    break; // Successfully got content, exit loop
                } catch (error) {
                    console.warn(`Proxy attempt failed:`, error);
                    lastError = error;
                    continue; // Try next proxy
                }
            }

            if (!content) {
                throw new Error(
                    'Unable to fetch webpage content. This might be because:\n' +
                    '1. The website blocks proxy access\n' +
                    '2. The website requires authentication\n' +
                    '3. The website has strict security policies\n\n' +
                    'Try with a different webpage or check if the URL is accessible directly.\n\n' +
                    'Last error: ' + (lastError?.message || 'Unknown error')
                );
            }

            // Parse and clean HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const mainContent = cleanupContent(doc);

            // Get page title
            const pageTitle = doc.title || 'Converted Webpage';

            // Convert to Markdown
            const turndownService = createTurndownService();
            let markdown = `# ${pageTitle}\n\n`;
            markdown += turndownService.turndown(mainContent);

            // Clean up the markdown
            markdown = cleanupMarkdown(markdown);

            // Show the result
            output.value = markdown;
            outputSection.style.display = 'block';

        } catch (err) {
            showError('Error converting webpage: ' + err.message);
        } finally {
            // Reset button state
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Convert to Markdown';
        }
    });

    /**
     * Clean up and format the markdown content
     * @param {string} markdown - The markdown content to clean
     * @returns {string} - The cleaned markdown content
     */
    function cleanupMarkdown(markdown) {
        return markdown
            // Remove multiple consecutive blank lines
            .replace(/\n{3,}/g, '\n\n')
            // Remove spaces before newlines
            .replace(/[ \t]+\n/g, '\n')
            // Remove empty list items
            .replace(/^- ?\n/gm, '')
            // Fix ordered list numbering
            .replace(/^\d+\./gm, '1.')
            // Add space after list markers if missing
            .replace(/^([*-])([^\s])/gm, '$1 $2')
            // Fix heading levels (ensure space after #)
            .replace(/^(#{1,6})([^#\s])/gm, '$1 $2')
            .trim();
    }

    /**
     * Validate URL format
     * @param {string} url - The URL to validate
     * @returns {boolean} - Whether the URL is valid
     */
    function isValidUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    // Copy button click handler
    copyBtn.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(output.value);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            showError('Failed to copy to clipboard');
        }
    });

    // Error handling
    function showError(message) {
        errorMessage.innerHTML = message.replace(/\n/g, '<br>');
        errorMessage.style.display = 'block';
        errorMessage.style.whiteSpace = 'pre-line';
        errorMessage.style.textAlign = 'left';
        errorMessage.style.padding = '1rem';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Convert on Ctrl/Cmd + Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            convertBtn.click();
        }
        // Copy on Ctrl/Cmd + C when output is focused
        else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === output) {
            copyBtn.click();
        }
    });

    // Handle URL input on paste
    urlInput.addEventListener('paste', function(e) {
        // Small delay to get the pasted content
        setTimeout(() => {
            const url = this.value.trim();
            if (url && isValidUrl(url)) {
                convertBtn.click();
            }
        }, 100);
    });
});