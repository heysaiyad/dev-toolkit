// Pomodoro timer: 25 min work, 5 min break. Start, Pause, Reset. Plays a beep when session ends.
const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

let remaining = WORK_SECONDS;
let mode = 'work'; // 'work' or 'break'
let intervalId = null;

const timerEl = document.getElementById('timer');
const modeEl = document.getElementById('mode'); // may be null if UI doesn't include mode pill
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay() {
  timerEl.textContent = formatTime(remaining);
  if (modeEl) modeEl.textContent = mode === 'work' ? 'Work' : 'Break';
  document.title = `${formatTime(remaining)} - Pomodoro (${mode === 'work' ? 'Work' : 'Break'})`;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 1000;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    o.stop(now + 0.65);
  } catch (e) {
    // Fallback: try using simple Audio with generated data URI (rarely needed)
    console.warn('Audio API failed', e);
  }
}

function switchMode() {
  if (mode === 'work') {
    mode = 'break';
    remaining = BREAK_SECONDS;
  } else {
    mode = 'work';
    remaining = WORK_SECONDS;
  }
}

function tick() {
  if (remaining > 0) {
    remaining -= 1;
    updateDisplay();
  }

  if (remaining <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    playBeep();
    // Switch to the other mode but do not auto-start. User must press Start to begin next session.
    switchMode();
    updateDisplay();
  }
}

startBtn.addEventListener('click', () => {
  if (intervalId) return; // already running
  // resume or start
  intervalId = setInterval(tick, 1000);
  startBtn.setAttribute('aria-pressed', 'true');
  setRunningState(true);
});

pauseBtn.addEventListener('click', () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    setRunningState(false);
  }
});

resetBtn.addEventListener('click', () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  mode = 'work';
  remaining = WORK_SECONDS;
  updateDisplay();
  setRunningState(false);
});

// Initialize UI
updateDisplay();
// initial button states
startBtn.disabled = false;
pauseBtn.disabled = true;

function setRunningState(running) {
  if (running) {
    startBtn.classList.add('active');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
  } else {
    startBtn.classList.remove('active');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }
}
