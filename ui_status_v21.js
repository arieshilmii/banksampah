// Status text v21 — user-facing OCR wording only; does not change OCR logic.
(function(){
  'use strict';
  const TARGET_ID='status-text';
  const shouldReplace=(text)=>{
    const s=String(text||'').toLowerCase();
    return s.includes('memuat universal ocr lokal') || s.includes('universal ocr sedang membaca');
  };
  const apply=()=>{
    const el=document.getElementById(TARGET_ID);
    if(el && shouldReplace(el.textContent)) el.textContent='Sedang Dibaca AI';
  };
  const run=()=>{
    apply();
    const root=document.getElementById(TARGET_ID) || document.body;
    if(!root) return;
    const obs=new MutationObserver(apply);
    obs.observe(root,{subtree:true,childList:true,characterData:true});
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();
