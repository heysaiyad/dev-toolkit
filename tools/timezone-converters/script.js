
(function(){
  const fromSelect = document.getElementById('from-tz');
  const toSelect = document.getElementById('to-tz');
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  const resultDisplay = document.getElementById('result-display');
  const convertBtn = document.getElementById('convert-btn');
  const copyBtn = document.getElementById('copy-btn');
  const swapBtn = document.getElementById('swap-btn');
  const showNow = document.getElementById('show-now');
  const nowUpdate = document.getElementById('now-update');

  // Map of abbreviations → IANA zones
  const tzMap = {
    "UTC": "UTC",
    "GMT": "Europe/London",
    "EST": "America/New_York",
    "CST": "America/Chicago",
    "MST": "America/Denver",
    "PST": "America/Los_Angeles",
    "IST": "Asia/Kolkata",
    "CET": "Europe/Paris",
    "EET": "Europe/Bucharest",
    "JST": "Asia/Tokyo",
    "AEST": "Australia/Sydney"
  };

  function populateTZ(select, preferred) {
    select.innerHTML = '';
    Object.entries(tzMap).forEach(([abbr, zone]) => {
      const opt = document.createElement('option');
      opt.value = zone;
      opt.textContent = `${abbr} (${zone.replace('_',' ')})`;
      if (zone === preferred) opt.selected = true;
      select.appendChild(opt);
    });
  }

  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  populateTZ(fromSelect, userTZ);
  populateTZ(toSelect, 'UTC');
document.querySelectorAll('input[type="date"], input[type="time"]').forEach(input => {
  input.addEventListener('click', () => {
    if (input.showPicker) {
      input.showPicker();
    }
  });
});
  function formatInZone(date, timeZone) {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).format(date);
  }

  function getOffsetMinutes(date, timeZone) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    const parts = fmt.formatToParts(date).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
    const local = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
                           parts.hour, parts.minute, parts.second);
    return Math.round((local - date.getTime()) / (60*1000));
  }

  function convert() {
    const fromTZ = fromSelect.value;
    const toTZ = toSelect.value;
    let sourceDate;

    if (showNow.checked) {
      sourceDate = new Date();
      const localISO = new Date().toISOString().slice(0,16);
      dateInput.value = localISO.split("T")[0];
      timeInput.value = localISO.split("T")[1];
    } else {
      if (!dateInput.value || !timeInput.value) {
        resultDisplay.textContent = '⚠️ Please pick both a date and a time.';
        copyBtn.disabled = true;
        return;
      }
      sourceDate = new Date(`${dateInput.value}T${timeInput.value}`);
    }

    const fromFormatted = formatInZone(sourceDate, fromTZ);
    const toFormatted = formatInZone(sourceDate, toTZ);
    const fromOffset = getOffsetMinutes(sourceDate, fromTZ);
    const toOffset = getOffsetMinutes(sourceDate, toTZ);
    const diffMinutes = toOffset - fromOffset;
    const diffSign = diffMinutes >= 0 ? '+' : '-';
    const diffAbs = Math.abs(diffMinutes);
    const diffHours = Math.floor(diffAbs/60);
    const diffMins = diffAbs % 60;

    const lines = [];
    lines.push(`🗓️ Instant (UTC): ${new Date(sourceDate.getTime()).toUTCString()}`);
    lines.push(`\nFrom (${fromTZ}): ${fromFormatted} (UTC${formatOffset(fromOffset)})`);
    lines.push(`To   (${toTZ}): ${toFormatted} (UTC${formatOffset(toOffset)})`);
    lines.push(`\nOffset difference: ${diffSign}${String(diffHours).padStart(2,'0')}:${String(diffMins).padStart(2,'0')} (to - from)`);

    resultDisplay.textContent = lines.join('\n');
    copyBtn.disabled = false;
  }

  function formatOffset(offsetMinutes) {
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const h = String(Math.floor(abs/60)).padStart(2,'0');
    const m = String(abs%60).padStart(2,'0');
    return `${sign}${h}:${m}`;
  }

  convertBtn.addEventListener('click', convert);
  swapBtn.addEventListener('click', () => {
    const a = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = a;
  });

  copyBtn.addEventListener('click', function(){
    navigator.clipboard.writeText(resultDisplay.textContent).then(()=>{
      this.textContent = '✔ Copied!';
      this.classList.add('copied');
      setTimeout(()=>{ this.innerHTML = '<i class="fas fa-copy"></i> Copy Result'; this.classList.remove('copied'); }, 2000);
    });
  });

  nowUpdate.addEventListener('click', () => {
    if (showNow.checked) convert();
  });

  showNow.addEventListener('change', () => {
    if (showNow.checked) {
      dateInput.disabled = true;
      timeInput.disabled = true;
      convert();
    } else {
      dateInput.disabled = false;
      timeInput.disabled = false;
    }
  });

  showNow.checked = true;
  convert();
})();
