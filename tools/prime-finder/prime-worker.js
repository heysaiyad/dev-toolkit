// prime-worker.js — performs sieve on worker thread and transfers primes as Uint32Array
self.onmessage = function (ev) {
  const msg = ev.data;
  if (!msg || msg.cmd !== "start") return;
  const max = Math.floor(msg.max);
  if (!max || max < 2) {
    postMessage({ type: "error", message: "Invalid max value" });
    return;
  }

  try {
    // Standard sieve of Eratosthenes using Uint8Array for memory efficiency
    const n = max;
    const sieve = new Uint8Array(n + 1); // 0 = prime candidate, 1 = composite
    sieve.fill(0);
    sieve[0] = 1;
    sieve[1] = 1;

    const limit = Math.floor(Math.sqrt(n));
    // iterate base from 2..limit and mark
    for (let i = 2; i <= limit; i++) {
      if (sieve[i]) continue;
      const start = i * i;
      for (let j = start; j <= n; j += i) sieve[j] = 1;
      // report progress based on i / limit
      if (i % 128 === 0 || i === limit) {
        const progress = Math.min(99, (i / limit) * 100);
        postMessage({ type: "progress", progress });
      }
    }

    // collect primes
    const primes = [];
    for (let i = 2; i <= n; i++) {
      if (!sieve[i]) primes.push(i);
    }

    // convert to Uint32Array and transfer
    const primesArr = new Uint32Array(primes.length);
    for (let i = 0; i < primes.length; i++) primesArr[i] = primes[i];

    postMessage({ type: "progress", progress: 100 });
    postMessage({ type: "done", count: primesArr.length, primesBuffer: primesArr.buffer }, [primesArr.buffer]);
    // after transferring, primesArr.buffer is neutered in worker so worker should not use it further
  } catch (e) {
    postMessage({ type: "error", message: e.message || String(e) });
  }
};
