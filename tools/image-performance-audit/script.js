// Image Performance Audit Tool
// Analyzes webpage images for performance issues, missing alt tags, and optimization opportunities

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('urlInput');
    const auditBtn = document.getElementById('auditBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const auditIcon = document.getElementById('auditIcon');
    const auditText = document.getElementById('auditText');
    const errorMessage = document.getElementById('errorMessage');
    const resultsSection = document.getElementById('resultsSection');
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreText = document.getElementById('scoreText');
    const scoreDescription = document.getElementById('scoreDescription');
    const statsGrid = document.getElementById('statsGrid');
    const issuesList = document.getElementById('issuesList');
    const imageList = document.getElementById('imageList');

    // Auto-focus on URL input
    urlInput.focus();

    // Event Listeners
    auditBtn.addEventListener('click', performAudit);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performAudit();
        }
    });

    // CORS Proxy - Using a public CORS proxy for demonstration
    // In production, you'd want to use your own proxy server
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

    async function performAudit() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a valid URL');
            return;
        }

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL (include http:// or https://)');
            return;
        }

        setLoading(true);
        hideError();
        hideResults();

        try {
            // Fetch the webpage content
            const response = await fetch(CORS_PROXY + encodeURIComponent(url));
            
            if (!response.ok) {
                throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            
            // Parse HTML and analyze images
            const analysis = analyzeImages(html, url);
            
            // Display results
            displayResults(analysis);
            
        } catch (error) {
            console.error('Audit error:', error);
            showError(`Failed to analyze webpage: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function analyzeImages(html, baseUrl) {
        // Create a temporary DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find all image elements
        const images = doc.querySelectorAll('img');
        const imageData = [];
        const issues = [];
        let totalSize = 0;
        let totalImages = images.length;
        let missingAltCount = 0;
        let largeImagesCount = 0;
        let nonModernFormatCount = 0;
        let brokenImagesCount = 0;

        // Analyze each image
        images.forEach((img, index) => {
            const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
            const alt = img.alt || '';
            const width = img.width || img.getAttribute('width') || '';
            const height = img.height || img.getAttribute('height') || '';
            
            // Resolve relative URLs
            const fullSrc = resolveUrl(src, baseUrl);
            
            const imageInfo = {
                src: fullSrc,
                alt: alt,
                width: width,
                height: height,
                index: index + 1,
                issues: []
            };

            // Check for missing alt text
            if (!alt || alt.trim() === '') {
                missingAltCount++;
                imageInfo.issues.push({
                    type: 'error',
                    message: 'Missing alt text',
                    suggestion: 'Add descriptive alt text for accessibility'
                });
                issues.push({
                    type: 'error',
                    image: fullSrc,
                    message: 'Missing alt text',
                    suggestion: 'Add descriptive alt text for accessibility'
                });
            }

            // Check image format
            const extension = getFileExtension(fullSrc);
            const isModernFormat = ['webp', 'avif', 'svg'].includes(extension.toLowerCase());
            
            if (!isModernFormat && extension) {
                nonModernFormatCount++;
                imageInfo.issues.push({
                    type: 'warning',
                    message: 'Not using modern format',
                    suggestion: 'Consider using WebP or AVIF for better compression'
                });
                issues.push({
                    type: 'warning',
                    image: fullSrc,
                    message: 'Not using modern format (WebP/AVIF)',
                    suggestion: 'Consider converting to WebP or AVIF for better compression'
                });
            }

            // Estimate file size based on dimensions and format
            const estimatedSize = estimateImageSize(width, height, extension);
            totalSize += estimatedSize;

            if (estimatedSize > 500000) { // 500KB threshold
                largeImagesCount++;
                imageInfo.issues.push({
                    type: 'warning',
                    message: 'Large file size',
                    suggestion: 'Optimize image or use responsive images'
                });
                issues.push({
                    type: 'warning',
                    image: fullSrc,
                    message: `Large file size (${formatBytes(estimatedSize)})`,
                    suggestion: 'Optimize image or use responsive images'
                });
            }

            // Check for missing dimensions
            if (!width || !height) {
                imageInfo.issues.push({
                    type: 'info',
                    message: 'Missing dimensions',
                    suggestion: 'Specify width and height to prevent layout shift'
                });
            }

            imageData.push(imageInfo);
        });

        // Calculate performance score
        const score = calculatePerformanceScore({
            totalImages,
            missingAltCount,
            largeImagesCount,
            nonModernFormatCount,
            totalSize
        });

        return {
            url: baseUrl,
            totalImages,
            totalSize,
            missingAltCount,
            largeImagesCount,
            nonModernFormatCount,
            brokenImagesCount,
            score,
            issues,
            images: imageData
        };
    }

    function resolveUrl(src, baseUrl) {
        if (!src) return '';
        
        try {
            // If it's already an absolute URL, return as is
            if (src.startsWith('http://') || src.startsWith('https://')) {
                return src;
            }
            
            // If it's a data URL, return as is
            if (src.startsWith('data:')) {
                return src;
            }
            
            // Resolve relative URL
            const base = new URL(baseUrl);
            return new URL(src, base).href;
        } catch (error) {
            return src;
        }
    }

    function getFileExtension(url) {
        try {
            const pathname = new URL(url).pathname;
            return pathname.split('.').pop().split('?')[0];
        } catch (error) {
            return '';
        }
    }

    function estimateImageSize(width, height, format) {
        // Rough estimation based on dimensions and format
        const pixels = parseInt(width) * parseInt(height);
        
        if (!pixels || isNaN(pixels)) {
            return 50000; // Default estimate for unknown size
        }

        const formatMultipliers = {
            'jpg': 0.1,
            'jpeg': 0.1,
            'png': 0.3,
            'gif': 0.2,
            'webp': 0.08,
            'avif': 0.05,
            'svg': 0.001
        };

        const multiplier = formatMultipliers[format?.toLowerCase()] || 0.1;
        return Math.round(pixels * multiplier);
    }

    function calculatePerformanceScore(metrics) {
        let score = 100;
        
        // Deduct points for issues
        score -= (metrics.missingAltCount / metrics.totalImages) * 30; // 30% for accessibility
        score -= (metrics.largeImagesCount / metrics.totalImages) * 25; // 25% for large images
        score -= (metrics.nonModernFormatCount / metrics.totalImages) * 20; // 20% for format
        score -= Math.min(metrics.totalSize / (metrics.totalImages * 100000), 25); // 25% for total size
        
        return Math.max(0, Math.round(score));
    }

    function displayResults(analysis) {
        // Show results section
        resultsSection.classList.add('show');
        
        // Update performance score
        updatePerformanceScore(analysis.score);
        
        // Update stats grid
        updateStatsGrid(analysis);
        
        // Update issues list
        updateIssuesList(analysis.issues);
        
        // Update image list
        updateImageList(analysis.images);
    }

    function updatePerformanceScore(score) {
        scoreText.textContent = score;
        
        // Update score circle with animation
        const percentage = score;
        const circumference = 2 * Math.PI * 50; // radius = 50
        const offset = circumference - (percentage / 100) * circumference;
        
        scoreCircle.style.background = `conic-gradient(
            var(--primary-color) 0deg, 
            var(--primary-color) ${percentage * 3.6}deg, 
            rgba(255, 255, 255, 0.1) ${percentage * 3.6}deg
        )`;
        
        // Update description based on score
        let description = '';
        if (score >= 90) {
            description = 'Excellent! Your images are well optimized.';
        } else if (score >= 70) {
            description = 'Good performance with room for improvement.';
        } else if (score >= 50) {
            description = 'Fair performance. Consider optimizing your images.';
        } else {
            description = 'Poor performance. Significant optimization needed.';
        }
        
        scoreDescription.textContent = description;
    }

    function updateStatsGrid(analysis) {
        const stats = [
            {
                icon: 'fas fa-images',
                value: analysis.totalImages,
                label: 'Total Images',
                color: 'var(--primary-color)'
            },
            {
                icon: 'fas fa-weight-hanging',
                value: formatBytes(analysis.totalSize),
                label: 'Total Size',
                color: 'var(--warning-color)'
            },
            {
                icon: 'fas fa-exclamation-triangle',
                value: analysis.missingAltCount,
                label: 'Missing Alt Text',
                color: 'var(--error-color)'
            },
            {
                icon: 'fas fa-compress',
                value: analysis.largeImagesCount,
                label: 'Large Images',
                color: 'var(--warning-color)'
            },
            {
                icon: 'fas fa-file-image',
                value: analysis.nonModernFormatCount,
                label: 'Non-Modern Format',
                color: 'var(--secondary-color)'
            },
            {
                icon: 'fas fa-chart-line',
                value: `${analysis.score}/100`,
                label: 'Performance Score',
                color: analysis.score >= 70 ? 'var(--success-color)' : 'var(--error-color)'
            }
        ];

        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-icon" style="color: ${stat.color}">
                    <i class="${stat.icon}"></i>
                </div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    function updateIssuesList(issues) {
        if (issues.length === 0) {
            issuesList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
                    <p>No performance issues found! Your images are well optimized.</p>
                </div>
            `;
            return;
        }

        issuesList.innerHTML = issues.map(issue => `
            <div class="issue-item">
                <div class="issue-header">
                    <span class="issue-type ${issue.type}">${issue.type}</span>
                    <span class="issue-image">${truncateUrl(issue.image)}</span>
                </div>
                <div class="issue-description">${issue.message}</div>
                <div class="issue-suggestion">💡 ${issue.suggestion}</div>
            </div>
        `).join('');
    }

    function updateImageList(images) {
        if (images.length === 0) {
            imageList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>No images found on this page.</p>
                </div>
            `;
            return;
        }

        imageList.innerHTML = images.map(image => {
            const statusClass = image.issues.length === 0 ? 'good' : 
                              image.issues.some(i => i.type === 'error') ? 'error' : 'warning';
            const statusText = image.issues.length === 0 ? 'Good' : 
                              image.issues.some(i => i.type === 'error') ? 'Issues' : 'Warnings';

            return `
                <div class="image-item">
                    <div class="image-info">
                        <img 
                            src="${image.src}" 
                            alt="Image preview" 
                            class="image-preview"
                            onerror="this.style.display='none'"
                        >
                        <div class="image-details-text">
                            <div class="image-src">${truncateUrl(image.src)}</div>
                            <div class="image-meta">
                                ${image.width && image.height ? `${image.width}×${image.height}` : 'Unknown dimensions'} • 
                                ${image.alt ? `Alt: "${image.alt}"` : 'No alt text'} • 
                                ${image.issues.length} issue${image.issues.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                        <div class="image-status">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function truncateUrl(url, maxLength = 50) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function setLoading(loading) {
        auditBtn.disabled = loading;
        loadingSpinner.style.display = loading ? 'block' : 'none';
        auditIcon.style.display = loading ? 'none' : 'block';
        auditText.textContent = loading ? 'Analyzing...' : 'Audit Images';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.classList.remove('show');
    }

    function hideResults() {
        resultsSection.classList.remove('show');
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to start audit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            performAudit();
        }
    });
});
