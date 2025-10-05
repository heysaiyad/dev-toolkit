// Web Speech API Demonstrator
class WebSpeechAPI {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.startTime = null;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.checkBrowserSupport();
        this.initializeSpeechRecognition();
        this.initializeSpeechSynthesis();
        this.setupEventListeners();
        this.loadVoices();
    }

    // Check browser support for Web Speech API
    checkBrowserSupport() {
        const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const hasSynthesis = 'speechSynthesis' in window;

        if (!hasRecognition && !hasSynthesis) {
            this.showWarning('Your browser does not support the Web Speech API. Please use Chrome, Edge, or Safari for the best experience.');
            return;
        }

        if (!hasRecognition) {
            this.showWarning('Speech recognition is not supported in your browser. Text-to-speech features are still available.');
            this.disableSpeechRecognition();
        }

        if (!hasSynthesis) {
            this.showWarning('Speech synthesis is not supported in your browser. Speech-to-text features are still available.');
            this.disableSpeechSynthesis();
        }
    }

    // Initialize Speech Recognition
    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateRecognitionStatus('Listening...', 'active');
            this.startTimer();
            this.updateButtons();
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const textarea = document.getElementById('speech-text');
            const currentText = textarea.value;
            const newText = currentText + finalTranscript + interimTranscript;
            textarea.value = newText;
            
            // Auto-scroll to bottom
            textarea.scrollTop = textarea.scrollHeight;
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.handleRecognitionError(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateRecognitionStatus('Stopped listening', '');
            this.stopTimer();
            this.updateButtons();
        };
    }

    // Initialize Speech Synthesis
    initializeSpeechSynthesis() {
        if (!this.synthesis) return;

        // Load voices when they become available
        this.synthesis.onvoiceschanged = () => {
            this.loadVoices();
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Speech Recognition controls
        document.getElementById('start-listening').addEventListener('click', () => {
            this.startListening();
        });

        document.getElementById('stop-listening').addEventListener('click', () => {
            this.stopListening();
        });

        document.getElementById('recognition-language').addEventListener('change', (e) => {
            if (this.recognition) {
                this.recognition.lang = e.target.value;
            }
        });

        // Speech Synthesis controls
        document.getElementById('speak-text').addEventListener('click', () => {
            this.speakText();
        });

        document.getElementById('pause-speech').addEventListener('click', () => {
            this.pauseSpeech();
        });

        document.getElementById('stop-speech').addEventListener('click', () => {
            this.stopSpeech();
        });

        // Voice settings
        document.getElementById('voice-select').addEventListener('change', (e) => {
            // Voice will be set when speaking
        });

        // Range sliders
        document.getElementById('rate-slider').addEventListener('input', (e) => {
            document.getElementById('rate-value').textContent = `${e.target.value}x`;
        });

        document.getElementById('pitch-slider').addEventListener('input', (e) => {
            document.getElementById('pitch-value').textContent = e.target.value;
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            document.getElementById('volume-value').textContent = `${Math.round(e.target.value * 100)}%`;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        if (!this.isSpeaking) {
                            this.speakText();
                        }
                        break;
                    case ' ':
                        e.preventDefault();
                        if (this.isListening) {
                            this.stopListening();
                        } else {
                            this.startListening();
                        }
                        break;
                }
            }
        });
    }

    // Load available voices
    loadVoices() {
        if (!this.synthesis) return;

        const voices = this.synthesis.getVoices();
        const voiceSelect = document.getElementById('voice-select');
        
        // Clear existing options except the first one
        voiceSelect.innerHTML = '<option value="">Default Voice</option>';

        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.textContent += ' - Default';
            }
            voiceSelect.appendChild(option);
        });
    }

    // Speech Recognition Methods
    startListening() {
        if (!this.recognition) {
            this.showError('Speech recognition is not supported in your browser.');
            return;
        }

        try {
            this.recognition.start();
            this.showSuccess('Started listening. Speak now!');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showError('Failed to start speech recognition. Please try again.');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    // Speech Synthesis Methods
    speakText() {
        const text = document.getElementById('tts-text').value.trim();
        if (!text) {
            this.showError('Please enter some text to speak.');
            return;
        }

        if (this.isSpeaking) {
            this.showWarning('Already speaking. Stop current speech first.');
            return;
        }

        // Stop any current speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        const voiceSelect = document.getElementById('voice-select');
        const voices = this.synthesis.getVoices();
        if (voiceSelect.value && voices[voiceSelect.value]) {
            utterance.voice = voices[voiceSelect.value];
        }

        // Set speech parameters
        utterance.rate = parseFloat(document.getElementById('rate-slider').value);
        utterance.pitch = parseFloat(document.getElementById('pitch-slider').value);
        utterance.volume = parseFloat(document.getElementById('volume-slider').value);

        // Event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateSynthesisStatus('Speaking...', 'active');
            this.updateButtons();
            this.updateCurrentVoice();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateSynthesisStatus('Finished speaking', '');
            this.updateButtons();
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isSpeaking = false;
            this.updateSynthesisStatus('Speech error', 'error');
            this.updateButtons();
            this.showError('Speech synthesis failed: ' + event.error);
        };

        utterance.onpause = () => {
            this.updateSynthesisStatus('Paused', '');
        };

        utterance.onresume = () => {
            this.updateSynthesisStatus('Speaking...', 'active');
        };

        this.synthesis.speak(utterance);
        this.showSuccess('Started speaking text.');
    }

    pauseSpeech() {
        if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
            this.showInfo('Speech paused.');
        }
    }

    stopSpeech() {
        this.synthesis.cancel();
        this.isSpeaking = false;
        this.updateSynthesisStatus('Stopped', '');
        this.updateButtons();
        this.showInfo('Speech stopped.');
    }

    // UI Update Methods
    updateRecognitionStatus(text, status) {
        document.getElementById('recognition-status-text').textContent = text;
        const statusDot = document.getElementById('recognition-status');
        statusDot.className = 'status-dot';
        if (status) {
            statusDot.classList.add(status);
        }
    }

    updateSynthesisStatus(text, status) {
        document.getElementById('synthesis-status-text').textContent = text;
        const statusDot = document.getElementById('synthesis-status');
        statusDot.className = 'status-dot';
        if (status) {
            statusDot.classList.add(status);
        }
    }

    updateButtons() {
        // Recognition buttons
        document.getElementById('start-listening').disabled = this.isListening;
        document.getElementById('stop-listening').disabled = !this.isListening;

        // Synthesis buttons
        document.getElementById('speak-text').disabled = this.isSpeaking;
        document.getElementById('pause-speech').disabled = !this.isSpeaking;
        document.getElementById('stop-speech').disabled = !this.isSpeaking;
    }

    updateCurrentVoice() {
        const voiceSelect = document.getElementById('voice-select');
        const voices = this.synthesis.getVoices();
        let voiceName = 'Default Voice';
        
        if (voiceSelect.value && voices[voiceSelect.value]) {
            voiceName = voices[voiceSelect.value].name;
        }
        
        document.getElementById('current-voice').textContent = voiceName;
    }

    // Timer for recognition
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('recognition-time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        document.getElementById('recognition-time').textContent = '00:00';
    }

    // Error handling
    handleRecognitionError(error) {
        let message = 'Speech recognition error: ';
        
        switch(error) {
            case 'no-speech':
                message = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                message = 'Microphone not found or not accessible.';
                break;
            case 'not-allowed':
                message = 'Microphone permission denied. Please allow microphone access.';
                break;
            case 'network':
                message = 'Network error occurred. Please check your connection.';
                break;
            default:
                message += error;
        }
        
        this.showError(message);
        this.updateRecognitionStatus('Error occurred', 'error');
    }

    // Disable features if not supported
    disableSpeechRecognition() {
        document.getElementById('start-listening').disabled = true;
        document.getElementById('stop-listening').disabled = true;
        document.querySelector('.speech-section:first-child').style.opacity = '0.6';
    }

    disableSpeechSynthesis() {
        document.getElementById('speak-text').disabled = true;
        document.getElementById('pause-speech').disabled = true;
        document.getElementById('stop-speech').disabled = true;
        document.querySelector('.speech-section:last-child').style.opacity = '0.6';
    }

    // Notification methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        }[type];

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        // Add notification styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    background: var(--bg-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    padding: 1rem 1.5rem;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 10001;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    backdrop-filter: blur(20px);
                    max-width: 400px;
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-success {
                    border-color: var(--success-color);
                    color: var(--success-color);
                }
                .notification-error {
                    border-color: var(--error-color);
                    color: var(--error-color);
                }
                .notification-warning {
                    border-color: var(--warning-color);
                    color: var(--warning-color);
                }
                .notification-info {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Hide browser warning if supported
    hideBrowserWarning() {
        const warning = document.getElementById('browser-warning');
        if (warning) {
            warning.classList.add('hidden');
        }
    }
}

// Initialize the Web Speech API when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const speechAPI = new WebSpeechAPI();
    
    // Auto-focus on the first textarea
    document.getElementById('speech-text').focus();
    
    // Hide browser warning after checking support
    setTimeout(() => {
        speechAPI.hideBrowserWarning();
    }, 3000);
});
