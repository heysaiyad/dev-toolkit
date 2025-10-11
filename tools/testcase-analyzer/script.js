        function analyzeText() {
            const text = document.getElementById('textInput').value;
            const statsContent = document.getElementById('statsContent');

            if (!text.trim()) {
                statsContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-text-width"></i>
                        <p>Enter some text to see detailed analysis</p>
                    </div>
                `;
                return;
            }

            const stats = calculateStats(text);
            displayStats(stats);
        }

        function calculateStats(text) {
            const trimmedText = text.trim();
            
            // Character count
            const charCount = text.length;
            const charCountNoSpaces = text.replace(/\s/g, '').length;
            
            // Word count
            const words = trimmedText.match(/\S+/g) || [];
            const wordCount = words.length;
            
            // Sentence count
            const sentences = trimmedText.match(/[.!?]+(?=\s|$)/g) || [];
            const sentenceCount = sentences.length || (trimmedText ? 1 : 0);
            
            // Paragraph count
            const paragraphs = trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
            const paragraphCount = paragraphs.length;
            
            // Average word length
            const totalWordLength = words.reduce((sum, word) => {
                const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
                return sum + cleanWord.length;
            }, 0);
            const avgWordLength = wordCount > 0 ? (totalWordLength / wordCount).toFixed(2) : 0;
            
            // Average sentence length
            const avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(2) : 0;
            
            // Average paragraph length
            const avgParagraphLength = paragraphCount > 0 ? (wordCount / paragraphCount).toFixed(2) : 0;
            
            // Reading time (average reading speed: 200 words per minute)
            const readingTimeMinutes = (wordCount / 200).toFixed(1);
            
            // Speaking time (average speaking speed: 150 words per minute)
            const speakingTimeMinutes = (wordCount / 150).toFixed(1);
            
            // Longest and shortest words
            let longestWord = '';
            let shortestWord = words[0] || '';
            words.forEach(word => {
                const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
                if (cleanWord.length > longestWord.length) longestWord = cleanWord;
                if (cleanWord.length < shortestWord.replace(/[^a-zA-Z0-9]/g, '').length && cleanWord.length > 0) {
                    shortestWord = cleanWord;
                }
            });
            
            return {
                charCount,
                charCountNoSpaces,
                wordCount,
                sentenceCount,
                paragraphCount,
                avgWordLength,
                avgSentenceLength,
                avgParagraphLength,
                readingTimeMinutes,
                speakingTimeMinutes,
                longestWord,
                shortestWord
            };
        }

        function displayStats(stats) {
            const statsContent = document.getElementById('statsContent');
            
            statsContent.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon icon-orange">
                            <i class="fas fa-font"></i>
                        </div>
                        <div class="stat-label">Characters</div>
                        <div class="stat-value">${stats.charCount.toLocaleString()}</div>
                        <div class="stat-subtext">${stats.charCountNoSpaces.toLocaleString()} without spaces</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon icon-blue">
                            <i class="fas fa-align-left"></i>
                        </div>
                        <div class="stat-label">Words</div>
                        <div class="stat-value">${stats.wordCount.toLocaleString()}</div>
                        <div class="stat-subtext">Avg length: ${stats.avgWordLength} chars</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon icon-green">
                            <i class="fas fa-bars"></i>
                        </div>
                        <div class="stat-label">Sentences</div>
                        <div class="stat-value">${stats.sentenceCount.toLocaleString()}</div>
                        <div class="stat-subtext">Avg length: ${stats.avgSentenceLength} words</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon icon-yellow">
                            <i class="fas fa-paragraph"></i>
                        </div>
                        <div class="stat-label">Paragraphs</div>
                        <div class="stat-value">${stats.paragraphCount.toLocaleString()}</div>
                        <div class="stat-subtext">Avg length: ${stats.avgParagraphLength} words</div>
                    </div>
                </div>

                <div class="reading-stats">
                    <h3 class="section-title" style="font-size: 1.2rem; margin-bottom: 1rem;">
                        <i class="fas fa-clock"></i>
                        Reading Metrics
                    </h3>

                    <div class="reading-stat-item">
                        <div class="reading-stat-label">
                            <i class="fas fa-book-reader"></i>
                            Reading Time
                        </div>
                        <div class="reading-stat-value">${stats.readingTimeMinutes} min</div>
                    </div>

                    <div class="reading-stat-item">
                        <div class="reading-stat-label">
                            <i class="fas fa-microphone"></i>
                            Speaking Time
                        </div>
                        <div class="reading-stat-value">${stats.speakingTimeMinutes} min</div>
                    </div>

                    <div class="reading-stat-item">
                        <div class="reading-stat-label">
                            <i class="fas fa-arrows-alt-h"></i>
                            Longest Word
                        </div>
                        <div class="reading-stat-value">${stats.longestWord} (${stats.longestWord.length})</div>
                    </div>

                    <div class="reading-stat-item">
                        <div class="reading-stat-label">
                            <i class="fas fa-compress"></i>
                            Shortest Word
                        </div>
                        <div class="reading-stat-value">${stats.shortestWord} (${stats.shortestWord.length})</div>
                    </div>
                </div>
            `;
        }

        function clearText() {
            document.getElementById('textInput').value = '';
            document.getElementById('statsContent').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-text-width"></i>
                    <p>Enter some text to see detailed analysis</p>
                </div>
            `;
        }

        // Real-time analysis on input
        document.getElementById('textInput').addEventListener('input', function() {
            const text = this.value;
            if (text.trim()) {
                analyzeText();
            }
        });