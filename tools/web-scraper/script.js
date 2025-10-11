// Web Scraper Tool - Extract Links and Images from Websites
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('url-input');
    const scrapeButton = document.getElementById('scrape-button');
    const resultsSection = document.getElementById('results-section');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const errorText = document.getElementById('error-text');
    const successText = document.getElementById('success-text');

    // Options checkboxes
    const extractLinksCheckbox = document.getElementById('extract-links');
    const extractImagesCheckbox = document.getElementById('extract-images');
    const includeExternalCheckbox = document.getElementById('include-external');
    const includeInternalCheckbox = document.getElementById('include-internal');

    // Statistics elements
    const totalLinksSpan = document.getElementById('total-links');
    const totalImagesSpan = document.getElementById('total-images');
    const internalLinksSpan = document.getElementById('internal-links');
    const externalLinksSpan = document.getElementById('external-links');

    // Result containers
    const linksList = document.getElementById('links-list');
    const imagesList = document.getElementById('images-list');

    // Export buttons
    const exportLinksBtn = document.getElementById('export-links');
    const exportImagesBtn = document.getElementById('export-images');
    const exportAllBtn = document.getElementById('export-all');

    // Global variables for storing results
    let currentResults = {
        links: [],
        images: [],
        baseUrl: '',
        domain: ''
    };

    // CORS Proxy URLs (using public CORS proxies)
    const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://thingproxy.freeboard.io/fetch/'
    ];

    let currentProxyIndex = 0;

    // URL validation function
    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // Show error message
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.add('show');
        successMessage.classList.remove('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        successText.textContent = message;
        successMessage.classList.add('show');
        errorMessage.classList.remove('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    }

    // Set loading state
    function setLoadingState(loading) {
        scrapeButton.disabled = loading;
        if (loading) {
            scrapeButton.classList.add('loading');
        } else {
            scrapeButton.classList.remove('loading');
        }
    }

    // Extract domain from URL
    function extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            return '';
        }
    }

    // Check if URL is internal
    function isInternalUrl(url, baseDomain) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === baseDomain;
        } catch (e) {
            return false;
        }
    }

    // Parse HTML and extract links and images
    function parseHtml(html, baseUrl, domain) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const links = [];
        const images = [];

        // Extract links
        if (extractLinksCheckbox.checked) {
            const linkElements = doc.querySelectorAll('a[href]');
            linkElements.forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    let absoluteUrl;
                    try {
                        absoluteUrl = new URL(href, baseUrl).href;
                    } catch (e) {
                        return; // Skip invalid URLs
                    }

                    const isInternal = isInternalUrl(absoluteUrl, domain);
                    const text = link.textContent.trim() || absoluteUrl;

                    // Apply filters
                    if (isInternal && !includeInternalCheckbox.checked) return;
                    if (!isInternal && !includeExternalCheckbox.checked) return;

                    links.push({
                        url: absoluteUrl,
                        text: text,
                        isInternal: isInternal
                    });
                }
            });
        }

        // Extract images
        if (extractImagesCheckbox.checked) {
            const imgElements = doc.querySelectorAll('img[src]');
            imgElements.forEach(img => {
                const src = img.getAttribute('src');
                if (src) {
                    let absoluteUrl;
                    try {
                        absoluteUrl = new URL(src, baseUrl).href;
                    } catch (e) {
                        return; // Skip invalid URLs
                    }

                    const alt = img.getAttribute('alt') || '';
                    const width = img.getAttribute('width') || '';
                    const height = img.getAttribute('height') || '';

                    images.push({
                        url: absoluteUrl,
                        alt: alt,
                        width: width,
                        height: height
                    });
                }
            });
        }

        return { links, images };
    }

    // Fetch content using CORS proxy
    async function fetchWithProxy(url) {
        const proxyUrl = corsProxies[currentProxyIndex] + encodeURIComponent(url);
        
        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            return html;
        } catch (error) {
            // Try next proxy if available
            if (currentProxyIndex < corsProxies.length - 1) {
                currentProxyIndex++;
                console.log(`Trying next proxy: ${corsProxies[currentProxyIndex]}`);
                return await fetchWithProxy(url);
            } else {
                throw error;
            }
        }
    }

    // Main scraping function
    async function scrapeWebsite() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a valid URL');
            return;
        }

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL (must start with http:// or https://)');
            return;
        }

        setLoadingState(true);
        resultsSection.classList.remove('show');

        try {
            // Reset proxy index
            currentProxyIndex = 0;
            
            // Fetch the webpage
            const html = await fetchWithProxy(url);
            
            // Parse the HTML
            const domain = extractDomain(url);
            const { links, images } = parseHtml(html, url, domain);

            // Store results
            currentResults = {
                links: links,
                images: images,
                baseUrl: url,
                domain: domain
            };

            // Update statistics
            updateStatistics(links, images);

            // Display results
            displayResults(links, images);

            // Show success message
            showSuccess(`Successfully scraped ${links.length} links and ${images.length} images from ${domain}`);

        } catch (error) {
            console.error('Scraping error:', error);
            showError(`Failed to scrape website: ${error.message}`);
        } finally {
            setLoadingState(false);
        }
    }

    // Update statistics
    function updateStatistics(links, images) {
        const internalLinks = links.filter(link => link.isInternal).length;
        const externalLinks = links.filter(link => !link.isInternal).length;

        // Animate numbers
        animateNumber(totalLinksSpan, links.length);
        animateNumber(totalImagesSpan, images.length);
        animateNumber(internalLinksSpan, internalLinks);
        animateNumber(externalLinksSpan, externalLinks);
    }

    // Animate number changes
    function animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(startValue + (targetValue - startValue) * easeOutQuart(progress));
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }

        requestAnimationFrame(updateNumber);
    }

    // Easing function
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // Display results
    function displayResults(links, images) {
        // Clear previous results
        linksList.innerHTML = '';
        imagesList.innerHTML = '';

        // Display links
        if (links.length > 0) {
            links.forEach(link => {
                const linkItem = createLinkItem(link);
                linksList.appendChild(linkItem);
            });
        } else {
            linksList.innerHTML = '<div class="result-item">No links found</div>';
        }

        // Display images
        if (images.length > 0) {
            images.forEach(image => {
                const imageItem = createImageItem(image);
                imagesList.appendChild(imageItem);
            });
        } else {
            imagesList.innerHTML = '<div class="result-item">No images found</div>';
        }

        // Show results section
        resultsSection.classList.add('show');
    }

    // Create link item element
    function createLinkItem(link) {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        const icon = link.isInternal ? 'fas fa-home' : 'fas fa-external-link-alt';
        const typeClass = link.isInternal ? 'internal' : 'external';
        
        item.innerHTML = `
            <i class="${icon}"></i>
            <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>
            <button class="copy-button" onclick="copyToClipboard('${link.url}')">
                <i class="fas fa-copy"></i>
            </button>
        `;
        
        return item;
    }

    // Create image item element
    function createImageItem(image) {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        const dimensions = image.width && image.height ? `${image.width}x${image.height}` : '';
        const altText = image.alt || 'No alt text';
        
        item.innerHTML = `
            <img src="${image.url}" alt="${altText}" onerror="this.style.display='none'">
            <div style="flex: 1;">
                <a href="${image.url}" target="_blank" rel="noopener noreferrer">${altText}</a>
                ${dimensions ? `<small style="display: block; color: var(--text-muted);">${dimensions}</small>` : ''}
            </div>
            <button class="copy-button" onclick="copyToClipboard('${image.url}')">
                <i class="fas fa-copy"></i>
            </button>
        `;
        
        return item;
    }

    // Copy to clipboard function
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccess('Copied to clipboard!');
        });
    };

    // Export functions
    function exportLinks() {
        if (currentResults.links.length === 0) {
            showError('No links to export');
            return;
        }

        const csvContent = [
            'URL,Text,Type',
            ...currentResults.links.map(link => 
                `"${link.url}","${link.text}","${link.isInternal ? 'Internal' : 'External'}"`
            )
        ].join('\n');

        downloadFile(csvContent, 'links.csv', 'text/csv');
        showSuccess('Links exported successfully!');
    }

    function exportImages() {
        if (currentResults.images.length === 0) {
            showError('No images to export');
            return;
        }

        const csvContent = [
            'URL,Alt Text,Width,Height',
            ...currentResults.images.map(image => 
                `"${image.url}","${image.alt}","${image.width}","${image.height}"`
            )
        ].join('\n');

        downloadFile(csvContent, 'images.csv', 'text/csv');
        showSuccess('Images exported successfully!');
    }

    function exportAll() {
        if (currentResults.links.length === 0 && currentResults.images.length === 0) {
            showError('No data to export');
            return;
        }

        const content = {
            url: currentResults.baseUrl,
            domain: currentResults.domain,
            scrapedAt: new Date().toISOString(),
            links: currentResults.links,
            images: currentResults.images
        };

        const jsonContent = JSON.stringify(content, null, 2);
        downloadFile(jsonContent, 'scraped-data.json', 'application/json');
        showSuccess('All data exported successfully!');
    }

    // Download file function
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event listeners
    scrapeButton.addEventListener('click', scrapeWebsite);
    
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            scrapeWebsite();
        }
    });

    exportLinksBtn.addEventListener('click', exportLinks);
    exportImagesBtn.addEventListener('click', exportImages);
    exportAllBtn.addEventListener('click', exportAll);

    // Auto-focus on URL input
    urlInput.focus();

    // Add sample URLs for testing
    const sampleUrls = [
        'https://github.com',
        'https://stackoverflow.com',
        'https://developer.mozilla.org',
        'https://www.w3schools.com'
    ];

    // Add sample URL button
    const sampleButton = document.createElement('button');
    sampleButton.textContent = 'Try Sample URL';
    sampleButton.className = 'export-button';
    sampleButton.style.marginTop = '1rem';
    sampleButton.addEventListener('click', () => {
        const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
        urlInput.value = randomUrl;
        urlInput.focus();
    });

    // Add button to the tool header
    const toolHeader = document.querySelector('.tool-header');
    toolHeader.appendChild(sampleButton);

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to scrape
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            scrapeWebsite();
        }

        // Ctrl+Shift+C to clear
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            urlInput.value = '';
            resultsSection.classList.remove('show');
            errorMessage.classList.remove('show');
            successMessage.classList.remove('show');
        }
    });

    // Add URL validation on input
    urlInput.addEventListener('input', function() {
        const url = urlInput.value.trim();
        if (url && !isValidUrl(url)) {
            urlInput.style.borderColor = 'var(--error-color)';
        } else {
            urlInput.style.borderColor = '';
        }
    });

    // Add paste event listener
    urlInput.addEventListener('paste', function() {
        setTimeout(() => {
            const url = urlInput.value.trim();
            if (url && isValidUrl(url)) {
                urlInput.style.borderColor = 'var(--success-color)';
                setTimeout(() => {
                    urlInput.style.borderColor = '';
                }, 1000);
            }
        }, 10);
    });
});

// Add CSS for enhanced interactions
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
    .result-item.internal {
        border-left: 3px solid var(--success-color);
    }
    
    .result-item.external {
        border-left: 3px solid var(--primary-color);
    }
    
    .result-item:hover {
        background: rgba(255, 107, 53, 0.1);
        transform: translateX(5px);
    }
    
    .copy-button {
        opacity: 0.7;
        transition: all 0.3s ease;
    }
    
    .result-item:hover .copy-button {
        opacity: 1;
    }
    
    .copy-button:active {
        transform: scale(0.95);
    }
    
    .stat-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    
    .stat-card:active {
        transform: translateY(0);
    }
    
    .url-input-container input:invalid {
        border-color: var(--error-color);
    }
    
    .url-input-container input:valid {
        border-color: var(--success-color);
    }
    
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .loading-overlay.show {
        opacity: 1;
        visibility: visible;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(enhancedStyle);
