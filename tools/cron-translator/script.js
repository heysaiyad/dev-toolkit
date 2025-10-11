// Simple cron expression translator (5-field: minute hour day month weekday)
function plural(n, s){return n+" "+s+(n===1?"":"s");}

function readField(field, unit){
  if(field==='*') return `every ${unit}`;
  if(field.startsWith('*/')){
    const v=parseInt(field.slice(2),10);
    return `every ${v} ${unit}${v>1?"s":""}`;
  }
  if(field.includes('-')){
    const [a,b]=field.split('-').map(Number);
    return `from ${a} to ${b} ${unit}s`;
  }
  if(field.includes(',')){
    return `at ${field.split(',').join(', ')}`;
  }
  // single number
  if(!isNaN(Number(field))){
    return `at ${field} ${unit}${field==='1'?"":"s"}`;
  }
  return field;
}

function translateCron(expr){
  const parts=expr.trim().split(/\s+/);
  if(parts.length!==5) return 'Please enter a standard 5-field cron expression.';
  const [min,hour,dom,mon,dow]=parts;

  const minuteText=readField(min,'minute');
  const hourText=readField(hour,'hour');
  const domText=readField(dom,'day of month');
  const monText=readField(mon,'month');
  const dowText=readField(dow,'weekday');

  // simple combined heuristics
  if(min.startsWith('*/') && hour==='*' && dom==='*' && mon==='*' && dow==='*'){
    const n=parseInt(min.slice(2),10);
    return `Every ${n} minute${n>1?"s":""}.`;
  }
  if(min==='0' && hour==='*' && dom==='*' && mon==='*' && dow==='*'){
    return 'Every hour at minute 0.';
  }

  return `${minuteText}, ${hourText}, ${domText}, ${monText}, ${dowText}.`;
}

document.addEventListener('DOMContentLoaded',()=>{
  const input=document.getElementById('cronInput');
  const btn=document.getElementById('translateBtn');
  const out=document.getElementById('output');
  const copyBtn=document.getElementById('copyBtn');
  const exampleBtn=document.getElementById('exampleBtn');

  btn.addEventListener('click',()=>{
    const v=input.value||'';
    out.textContent=translateCron(v);
  });

  input.addEventListener('keydown',(e)=>{if(e.key==='Enter')btn.click();});

  copyBtn.addEventListener('click',()=>{
    navigator.clipboard.writeText(out.textContent||'').then(()=>{
      copyBtn.textContent='Copied'; setTimeout(()=>copyBtn.textContent='Copy',1200);
    });
  });

  exampleBtn.addEventListener('click',()=>{input.value='*/5 * * * *'; btn.click();});
  const backBtn=document.getElementById('backBtn');
  if(backBtn){
    backBtn.addEventListener('click',()=>{ window.history.back(); });
  }
});
