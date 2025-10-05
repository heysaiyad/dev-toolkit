# Web Speech API Demonstrator

A comprehensive tool that showcases the power of the Web Speech API for both speech-to-text (dictation) and text-to-speech (synthesis) functionality.

## Features

### 🎤 **Speech to Text (Dictation)**
- **Real-time Speech Recognition**: Convert spoken words to text instantly
- **Continuous Listening**: Keep listening until manually stopped
- **Interim Results**: See text appear as you speak
- **Multiple Languages**: Support for 11+ languages including English, Spanish, French, German, and more
- **Visual Feedback**: Live status indicators and timer
- **Error Handling**: Comprehensive error messages for various scenarios

### 🔊 **Text to Speech (Synthesis)**
- **Voice Synthesis**: Convert text to natural-sounding speech
- **Voice Selection**: Choose from available system voices
- **Customizable Parameters**: Adjust rate, pitch, and volume
- **Playback Controls**: Play, pause, and stop speech
- **Multiple Languages**: Support for various languages and accents
- **Real-time Status**: Live feedback on speech synthesis status

### 🎨 **User Experience**
- **Intuitive Interface**: Clean, modern design following DevToolkit standards
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Keyboard Shortcuts**: Power user shortcuts for quick access
- **Visual Indicators**: Status dots, timers, and progress feedback
- **Browser Compatibility**: Graceful degradation for unsupported browsers
- **Accessibility**: Proper ARIA labels and keyboard navigation

### ⚙️ **Advanced Features**
- **Voice Customization**: Fine-tune speech synthesis parameters
- **Language Selection**: Choose from multiple supported languages
- **Error Recovery**: Automatic error handling and user guidance
- **Performance Optimization**: Efficient resource management
- **Cross-browser Support**: Works in Chrome, Edge, and Safari

## How to Use

### Speech to Text (Dictation)
1. **Select Language**: Choose your preferred language from the dropdown
2. **Start Listening**: Click "Start Listening" or press Ctrl+Space
3. **Speak Clearly**: Speak into your microphone - text will appear in real-time
4. **Stop When Done**: Click "Stop Listening" or press Ctrl+Space again
5. **Review Text**: Edit the transcribed text as needed

### Text to Speech (Synthesis)
1. **Enter Text**: Type or paste text into the "Text to Read" area
2. **Choose Voice**: Select from available system voices
3. **Adjust Settings**: Fine-tune rate, pitch, and volume
4. **Start Speaking**: Click "Speak" or press Ctrl+Enter
5. **Control Playback**: Use pause/stop buttons as needed

### Keyboard Shortcuts
- **Ctrl+Enter**: Start text-to-speech
- **Ctrl+Space**: Toggle speech recognition on/off
- **Escape**: Close any open modals

## Browser Support

### ✅ **Fully Supported**
- **Chrome** (recommended)
- **Edge** (Chromium-based)
- **Safari** (limited features)

### ⚠️ **Limited Support**
- **Firefox**: Text-to-speech only (no speech recognition)
- **Older browsers**: May have reduced functionality

### ❌ **Not Supported**
- **Internet Explorer**: No Web Speech API support
- **Very old browsers**: Missing required APIs

## Technical Implementation

### Architecture
- **Pure JavaScript**: No external frameworks or dependencies
- **Class-based Design**: Clean, maintainable code structure
- **Event-driven**: Efficient handling of speech API events
- **Modular Functions**: Easy to extend and customize

### Key APIs Used
- **SpeechRecognition API**: For speech-to-text functionality
- **SpeechSynthesis API**: For text-to-speech functionality
- **Web Audio API**: For audio input/output handling
- **MediaDevices API**: For microphone access

### Error Handling
- **Permission Errors**: Microphone access denied
- **Network Errors**: Connection issues during recognition
- **Audio Errors**: Microphone not found or inaccessible
- **Browser Compatibility**: Graceful degradation for unsupported features

## Voice Settings

### Speech Recognition Settings
- **Language**: Choose from 11+ supported languages
- **Continuous**: Keep listening until manually stopped
- **Interim Results**: Show partial results while speaking

### Speech Synthesis Settings
- **Voice**: Select from available system voices
- **Rate**: Speech speed (0.5x to 2.0x)
- **Pitch**: Voice pitch (0.0 to 2.0)
- **Volume**: Audio volume (0% to 100%)

## Privacy and Security

- **No Data Storage**: All processing happens locally in your browser
- **No Server Communication**: No data sent to external servers
- **Microphone Access**: Requires user permission for speech recognition
- **Local Processing**: Speech synthesis uses system voices only

## Performance Tips

### For Best Speech Recognition
- Use a good quality microphone
- Speak clearly and at moderate pace
- Minimize background noise
- Use supported browsers (Chrome recommended)

### For Best Speech Synthesis
- Choose appropriate voice for your content
- Adjust rate for your listening preference
- Use shorter text segments for better control
- Test different voices to find your preferred one

## Troubleshooting

### Common Issues
1. **Microphone not working**: Check browser permissions and microphone access
2. **No speech recognition**: Ensure you're using a supported browser
3. **Poor recognition accuracy**: Check microphone quality and speaking clarity
4. **No voices available**: Refresh the page or restart your browser
5. **Speech synthesis not working**: Check if voices are loaded and browser support

### Error Messages
- **"Microphone permission denied"**: Allow microphone access in browser settings
- **"No speech detected"**: Speak louder or check microphone connection
- **"Network error"**: Check internet connection for speech recognition
- **"Voice not available"**: Wait for voices to load or refresh the page

## Future Enhancements

Potential features for future versions:
- **Voice Commands**: Control the interface with voice commands
- **Audio Recording**: Save speech as audio files
- **Text Export**: Export transcribed text to various formats
- **Voice Training**: Improve recognition accuracy over time
- **Custom Voices**: Upload and use custom voice models
- **Batch Processing**: Process multiple text segments at once

## Contributing

This tool was created as part of the DevToolkit project for Hacktoberfest 2025.

### Development Guidelines
- Follow the existing code style and patterns
- Add proper error handling for all speech operations
- Include comprehensive user feedback
- Test on multiple browsers and devices
- Ensure accessibility compliance

### Testing Checklist
- [ ] Speech recognition in supported browsers
- [ ] Text-to-speech with various voices
- [ ] Voice parameter adjustments
- [ ] Language selection functionality
- [ ] Error handling and recovery
- [ ] Mobile device compatibility
- [ ] Keyboard shortcut functionality
- [ ] Browser compatibility testing

## License

This project is part of DevToolkit and follows the same MIT license.

---

**Made with ❤️ for the developer community • Happy Hacktoberfest 2025! 🎃**
