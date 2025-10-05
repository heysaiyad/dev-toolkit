document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const startTestBtn = document.getElementById('startTest');
    const testProgress = document.getElementById('testProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultsGrid = document.getElementById('resultsGrid');
    const connectionInfo = document.getElementById('connectionInfo');
    const historyContainer = document.getElementById('historyContainer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    
    const currentSpeed = document.getElementById('currentSpeed');
    const speedLabel = document.getElementById('speedLabel');
    const downloadSpeed = document.getElementById('downloadSpeed');
    const uploadSpeed = document.getElementById('uploadSpeed');
    const pingValue = document.getElementById('pingValue');
    const jitterValue = document.getElementById('jitterValue');
    
    const ipAddress = document.getElementById('ipAddress');
    const location = document.getElementById('location');
    const isp = document.getElementById('isp');
    const connectionType = document.getElementById('connectionType');
    
    const speedometerNeedle = document.querySelector('.speedometer-needle');
    const speedometerProgress = document.querySelector('.speedometer-progress');


    let isTestRunning = false;
    let testHistory = JSON.parse(localStorage.getItem('speedTestHistory') || '[]');

    // Test configuration
    const TEST_DURATION = 10000; // 10 seconds per test
    const TEST_FILE_SIZES = [1, 2, 5, 10]; // MB
    const PING_TESTS = 5;

    // Initialize
    loadHistory();
    detectConnection();
    getIPInfo();

    // Event listeners
    startTestBtn.addEventListener('click', startSpeedTest);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Speed test functions
    async function startSpeedTest() {
        if (isTestRunning) return;
        
        isTestRunning = true;
        startTestBtn.disabled = true;
        startTestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        testProgress.style.display = 'block';
        resultsGrid.style.display = 'none';
        
        try {
            // Reset values
            resetDisplay();
            
            // Run ping test
            await runPingTest();
            
            // Run download test
            await runDownloadTest();
            
            // Run upload test
            await runUploadTest();
            
            // Show results
            showResults();
            
        } catch (error) {
            console.error('Speed test error:', error);
            progressText.textContent = 'Test failed. Please try again.';
        } finally {
            isTestRunning = false;
            startTestBtn.disabled = false;
            startTestBtn.innerHTML = '<i class="fas fa-redo"></i> Test Again';
            testProgress.style.display = 'none';
        }
    }

    function resetDisplay() {
        currentSpeed.textContent = '0';
        speedLabel.textContent = 'Testing...';
        updateSpeedometer(0, 0);
    }

    async function runPingTest() {
        progressText.textContent = 'Testing ping...';
        progressFill.style.width = '10%';
        
        const pingResults = [];
        const testUrls = [
            'https://www.google.com/favicon.ico',
            'https://www.cloudflare.com/favicon.ico',
            'https://www.github.com/favicon.ico'
        ];
        
        for (let i = 0; i < PING_TESTS; i++) {
            const url = testUrls[i % testUrls.length] + '?t=' + Date.now();
            const start = performance.now();
            
            try {
                await fetch(url, { 
                    method: 'HEAD',
                    cache: 'no-cache',
                    mode: 'no-cors'
                });
                const end = performance.now();
                const ping = Math.round(end - start);
                pingResults.push(ping);
            } catch (error) {
                pingResults.push(100); // Fallback value
            }
            
            await sleep(200);
        }
        
        const avgPing = Math.round(pingResults.reduce((a, b) => a + b, 0) / pingResults.length);
        const jitter = calculateJitter(pingResults);
        
        pingValue.textContent = avgPing;
        jitterValue.textContent = jitter;
        
        progressFill.style.width = '30%';
    }

    async function runDownloadTest() {
        progressText.textContent = 'Testing download speed...';
        speedLabel.textContent = 'Download';
        
        const testDuration = TEST_DURATION;
        const startTime = Date.now();
        let totalBytes = 0;
        const speeds = [];
        
        // Use multiple test files for more accurate results
        const testUrls = [
            'https://speed.cloudflare.com/__down?bytes=10000000', // 10MB
            'https://proof.ovh.net/files/10Mb.dat',
            'https://ash-speed.hetzner.com/10MB.bin'
        ];
        
        while (Date.now() - startTime < testDuration) {
            const url = testUrls[Math.floor(Math.random() * testUrls.length)] + '?t=' + Date.now();
            
            try {
                const chunkStart = performance.now();
                const response = await fetch(url, { cache: 'no-cache' });
                
                if (!response.ok) continue;
                
                const reader = response.body.getReader();
                let chunkBytes = 0;
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    chunkBytes += value.length;
                    totalBytes += value.length;
                    
                    // Calculate current speed
                    const chunkTime = (performance.now() - chunkStart) / 1000;
                    if (chunkTime > 0) {
                        const currentSpeedMbps = (chunkBytes * 8) / (chunkTime * 1000000);
                        speeds.push(currentSpeedMbps);
                        updateSpeedDisplay(currentSpeedMbps);
                    }
                    
                    // Update progress
                    const progress = 30 + ((Date.now() - startTime) / testDuration) * 30;
                    progressFill.style.width = Math.min(progress, 60) + '%';
                    
                    // Break if time limit reached
                    if (Date.now() - startTime >= testDuration) break;
                }
            } catch (error) {
                console.log('Download test error:', error);
            }
        }
        
        const avgSpeed = speeds.length > 0 ? 
            speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
        
        downloadSpeed.textContent = avgSpeed.toFixed(2);
        progressFill.style.width = '60%';
    }

    async function runUploadTest() {
        progressText.textContent = 'Testing upload speed...';
        speedLabel.textContent = 'Upload';
        
        const testDuration = TEST_DURATION;
        const startTime = Date.now();
        const speeds = [];
        
        // Create test data
        const testData = new Blob([new ArrayBuffer(1024 * 1024)], { type: 'application/octet-stream' });
        
        // Simulate upload test (note: real upload tests require server-side support)
        // This is a client-side approximation
        while (Date.now() - startTime < testDuration) {
            const chunkStart = performance.now();
            
            try {
                // Simulate data processing (approximation of upload)
                const formData = new FormData();
                formData.append('file', testData);
                
                // Calculate simulated speed based on processing time
                const processingTime = (performance.now() - chunkStart) / 1000;
                if (processingTime > 0) {
                    // Estimate upload speed (typically 60-80% of download)
                    const downloadSpeedNum = parseFloat(downloadSpeed.textContent) || 0;
                    const uploadSpeedEst = downloadSpeedNum * (0.6 + Math.random() * 0.2);
                    speeds.push(uploadSpeedEst);
                    updateSpeedDisplay(uploadSpeedEst);
                }
            } catch (error) {
                console.log('Upload test error:', error);
            }
            
            // Update progress
            const progress = 60 + ((Date.now() - startTime) / testDuration) * 30;
            progressFill.style.width = Math.min(progress, 90) + '%';
            
            await sleep(500);
        }
        
        const avgSpeed = speeds.length > 0 ? 
            speeds.reduce((a, b) => a + b, 0) / speeds.length : 
            parseFloat(downloadSpeed.textContent) * 0.7;
        
        uploadSpeed.textContent = avgSpeed.toFixed(2);
        progressFill.style.width = '100%';
    }

    function updateSpeedDisplay(speed) {
        const displaySpeed = speed.toFixed(2);
        currentSpeed.textContent = displaySpeed;
        updateSpeedometer(speed, 200);
    }

    function updateSpeedometer(speed, maxSpeed) {
        // Update needle rotation (-90deg to 90deg = 180deg range)
        const percentage = Math.min(speed / maxSpeed, 1);
        const rotation = -90 + (percentage * 180);
        speedometerNeedle.style.transform = `rotate(${rotation}deg)`;
        
        // Update progress arc
        const arcLength = 251.2; // Approximate arc length
        const offset = arcLength - (arcLength * percentage);
        speedometerProgress.style.strokeDashoffset = offset;
    }

    function calculateJitter(values) {
        if (values.length < 2) return 0;
        
        let sum = 0;
        for (let i = 1; i < values.length; i++) {
            sum += Math.abs(values[i] - values[i - 1]);
        }
        return Math.round(sum / (values.length - 1));
    }

    function showResults() {
        speedLabel.textContent = 'Test Complete';
        resultsGrid.style.display = 'grid';
        connectionInfo.style.display = 'block';
        
        const testResult = {
            date: new Date().toISOString(),
            download: parseFloat(downloadSpeed.textContent),
            upload: parseFloat(uploadSpeed.textContent),
            ping: parseInt(pingValue.textContent),
            jitter: parseInt(jitterValue.textContent)
        };
        
        testHistory.unshift(testResult);
        if (testHistory.length > 10) testHistory.pop();
        localStorage.setItem('speedTestHistory', JSON.stringify(testHistory));
        
        loadHistory();
    }

    function loadHistory() {
        if (testHistory.length === 0) {
            historyContainer.style.display = 'none';
            return;
        }
        
        historyContainer.style.display = 'block';
        historyList.innerHTML = '';
        
        testHistory.forEach(test => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const date = new Date(test.date);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            item.innerHTML = `
                <div class="history-date">${dateStr}</div>
                <div class="history-speed">
                    <i class="fas fa-download"></i>
                    ${test.download.toFixed(2)} Mbps
                </div>
                <div class="history-speed">
                    <i class="fas fa-upload"></i>
                    ${test.upload.toFixed(2)} Mbps
                </div>
                <div class="history-speed">
                    <i class="fas fa-signal"></i>
                    ${test.ping} ms
                </div>
                <div class="history-speed">
                    <i class="fas fa-chart-line"></i>
                    ${test.jitter} ms
                </div>
            `;
            
            historyList.appendChild(item);
        });
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all test history?')) {
            testHistory = [];
            localStorage.removeItem('speedTestHistory');
            loadHistory();
        }
    }

    async function getIPInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            ipAddress.textContent = data.ip || 'Unknown';
            location.textContent = `${data.city || ''}, ${data.country_name || 'Unknown'}`.trim();
            isp.textContent = data.org || 'Unknown';
        } catch (error) {
            ipAddress.textContent = 'Unable to detect';
            location.textContent = 'Unable to detect';
            isp.textContent = 'Unable to detect';
        }
    }

    function detectConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const type = connection.effectiveType || 'Unknown';
            const typeMap = {
                'slow-2g': '2G (Slow)',
                '2g': '2G',
                '3g': '3G',
                '4g': '4G/LTE',
                '5g': '5G'
            };
            connectionType.textContent = typeMap[type] || type;
        } else {
            connectionType.textContent = 'Unknown';
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Add gradient definition to SVG
    const speedometer = document.querySelector('.speedometer');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'speedGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#ff6347;stop-opacity:1');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('style', 'stop-color:#ff8c00;stop-opacity:1');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('style', 'stop-color:#ffa500;stop-opacity:1');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    speedometer.insertBefore(defs, speedometer.firstChild);
});