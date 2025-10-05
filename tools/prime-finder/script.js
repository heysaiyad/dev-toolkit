// main.js — UI + worker orchestration
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const downloadBtn = document.getElementById("download-btn");
  const clearBtn = document.getElementById("clear-btn");
  const progressBar = document.getElementById("progress-bar");
  const statStatus = document.getElementById("stat-status");
  const statProgress = document.getElementById("stat-progress");
  const statCount = document.getElementById("stat-count");
  const statTime = document.getElementById("stat-time");
  const resultBox = document.getElementById("result");
  const inputN = document.getElementById("max-n");

  let worker = null;
  let startTime = 0;
  let primesUint32 = null; // ArrayBuffer view received from worker

  function setStatus(text) { statStatus.textContent = `Status: ${text}`; }
  function setProgress(p) {
    progressBar.style.width = `${p}%`;
    statProgress.textContent = `Progress: ${p.toFixed(1)}%`;
  }
  function setCount(n) { statCount.textContent = `Primes found: ${n}`; }

  function resetUI() {
    setStatus("Idle");
    setProgress(0);
    setCount(0);
    statTime.textContent = `Elapsed: 0s`;
    resultBox.textContent = "No results yet.";
    downloadBtn.disabled = true;
    cancelBtn.disabled = true;
  }

  function formatTime(ms) {
    return (ms / 1000).toFixed(1);
  }

  startBtn.addEventListener("click", () => {
    const N = Math.floor(Number(inputN.value));
    if (!N || N < 2) {
      alert("Enter an integer >= 2");
      return;
    }

    // memory estimate: approx N bytes for sieve. Warn if huge.
    if (N > 200_000_000) {
      if (!confirm("N is very large and may use a lot of memory. Continue?")) return;
    }

    // ensure previous worker cleaned
    if (worker) {
      worker.terminate();
      worker = null;
    }

    worker = new Worker("prime-worker.js");
    startTime = performance.now();
    setStatus("Running");
    cancelBtn.disabled = false;
    downloadBtn.disabled = true;
    resultBox.textContent = "Computing...";
    setProgress(0);
    setCount(0);
    primesUint32 = null;

    worker.postMessage({ cmd: "start", max: N });

    worker.onmessage = (ev) => {
      const data = ev.data;
      if (!data) return;
      if (data.type === "progress") {
        setProgress(data.progress);
        statTime.textContent = `Elapsed: ${formatTime(performance.now() - startTime)}s`;
      } else if (data.type === "done") {
        setProgress(100);
        setStatus("Completed");
        statTime.textContent = `Elapsed: ${formatTime(performance.now() - startTime)}s`;
        setCount(data.count);

        // receive primes buffer (transferable)
        if (data.primesBuffer) {
          // wrap buffer in Uint32Array
          primesUint32 = new Uint32Array(data.primesBuffer);
          // show first up to 100 primes
          const sampleCount = Math.min(100, primesUint32.length);
          resultBox.textContent = primesUint32.slice(0, sampleCount).join(", ");
          if (primesUint32.length > sampleCount) resultBox.textContent += `, ... (total ${primesUint32.length})`;
          downloadBtn.disabled = false;
        } else {
          resultBox.textContent = `Found ${data.count} primes (no buffer transferred).`;
        }

        worker.terminate();
        worker = null;
        cancelBtn.disabled = true;
      } else if (data.type === "error") {
        setStatus("Error");
        resultBox.textContent = `❌ ${data.message}`;
        worker.terminate();
        worker = null;
        cancelBtn.disabled = true;
      }
    };

    worker.onerror = (err) => {
      setStatus("Error");
      resultBox.textContent = `❌ Worker error: ${err.message}`;
      worker.terminate();
      worker = null;
      cancelBtn.disabled = true;
    };
  });

  cancelBtn.addEventListener("click", () => {
    if (worker) {
      worker.terminate();
      worker = null;
      setStatus("Cancelled");
      resultBox.textContent = "Cancelled by user.";
      cancelBtn.disabled = true;
    }
  });

  clearBtn.addEventListener("click", () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    inputN.value = "1000000";
    primesUint32 = null;
    resetUI();
  });

  downloadBtn.addEventListener("click", () => {
    if (!primesUint32) {
      alert("No primes buffer available to download.");
      return;
    }
    // create newline-separated blob
    const text = Array.from(primesUint32).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `primes_up_to_${inputN.value}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // initial UI
  resetUI();
});
