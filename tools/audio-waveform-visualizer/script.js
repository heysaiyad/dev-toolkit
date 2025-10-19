document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const fileInput = document.getElementById('audioFileInput');
    const audio = document.getElementById('audio');
    const playButton = document.getElementById('playButton');
    const muteButton = document.getElementById('muteButton');

    // Set up Web Audio API context and nodes
    const audioCtx = new AudioContext();
    const gainNode = audioCtx.createGain();
    let track = audioCtx.createMediaElementSource(audio);
    const analyser = new AnalyserNode(audioCtx, {
        fftSize: 2048,
        maxDecibels: -25,
        minDecibels: -60,
        smoothingTimeConstant: 0.5,
    });

    // Connect audio nodes
    track.connect(analyser);
    track.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Prepare analyser data array
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let channelData = null;

    // Set up canvas for waveform visualization
    const canvas = document.getElementById("waveformCanvas");
    const canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    let animationId = null;

    // Handle upload button click
    document.getElementById('uploadButton').addEventListener('click', function() {
        document.getElementById('audioFileInput').click();
    });

    // Handle file input change
    fileInput.addEventListener('change', async (event) => {
        // Get the selected file
        const fileList = event.target.files; 
        const file = fileList[0];

        // If no file selected, return
        if (!file) return;
        // Resume audio context if suspended
        if (audioCtx.state === "suspended") audioCtx.resume();  
        // Cancel any ongoing animation
        if (animationId) cancelAnimationFrame(animationId);

        // Create a URL for the file
        const fileURL = URL.createObjectURL(file);
        // Set the audio player's source to the file URL
        audio.src = fileURL; 

        // Read and decode audio data
        const arrayBuffer = await file.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        channelData = decoded.getChannelData(0);

        // Draw the full waveform once audio is loaded
        drawFullWaveform();

        // Capture data array from audio
        analyser.getByteTimeDomainData(dataArray);

        // Enable play and mute buttons
        playButton.disabled = false;
        muteButton.disabled = false;
    });
    
    // Handle play button click
    playButton.addEventListener('click', () => {
        if (!audio.paused) {
            audio.pause();
            playButton.textContent = "Play";
            if (animationId) cancelAnimationFrame(animationId);
            drawFullWaveform();
        } else {
            audio.play();
            playButton.textContent = "Pause";
            if (animationId) cancelAnimationFrame(animationId);
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            drawLiveWaveform();  
        }
    });

    // Handle mute button click
    muteButton.addEventListener('click', () => {
        let muted = gainNode.gain.value === 0;
        gainNode.gain.value = muted ? 1 : 0;
        muteButton.classList.toggle('muteRed', !muted);
    });

    // Handle audio ended event
    audio.addEventListener("ended", () => {
        if (animationId) cancelAnimationFrame(animationId);
        playButton.textContent = "Play";
        if (channelData) drawFullWaveform();
        audio.currentTime = 0;
    });

    // Function to draw live waveform
    function drawLiveWaveform() {
        animationId = requestAnimationFrame(drawLiveWaveform);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "#1a1a2e";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "#0081b4";
        canvasCtx.beginPath();

        const sliceWidth = WIDTH / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * (HEIGHT / 2);
            i === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
            x += sliceWidth;
        }

        canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();
    }

    // Function to draw full waveform
    function drawFullWaveform() {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.fillStyle = "#1a1a2e";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.strokeStyle = "#0081b4";
        canvasCtx.lineWidth = 1;
        canvasCtx.beginPath();

        const step = Math.ceil(channelData.length / WIDTH);
        const amp = HEIGHT / 2;

        for (let i = 0; i < WIDTH; i++) {
            const segment = channelData.slice(i * step, (i + 1) * step);
            const min = Math.min(...segment);
            const max = Math.max(...segment);
            canvasCtx.moveTo(i, (1 + min) * amp);
            canvasCtx.lineTo(i, (1 + max) * amp);
        }
        canvasCtx.stroke();
    }
});