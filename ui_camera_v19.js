// Result buttons: retain the existing OCR and save functions. Back routing lives in ui_shell_v25.js.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  function installStyle(){
    if($('camera-v19-style'))return;
    const style=document.createElement('style');style.id='camera-v19-style';
    style.textContent=`
      #camera-ui .scanner-actions.success-v19{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:10px!important;width:100%!important;max-width:360px!important}
      #camera-ui .scanner-actions.success-v19 #btn-lanjut{grid-column:1/-1!important;width:100%!important;min-height:54px!important;border-radius:24px!important}
      #camera-ui .scanner-actions.success-v19 #btn-manual,#camera-ui .scanner-actions.success-v19 #btn-retake-v19{display:flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;min-height:48px!important;margin:0!important;padding:12px 8px!important;border-radius:20px!important;font-size:13px!important;font-weight:800!important;line-height:1.15!important}
      #camera-ui .scanner-actions.success-v19 #btn-manual{background:rgba(255,255,255,.10)!important;color:#fff!important;border:1px solid rgba(255,255,255,.18)!important;box-shadow:none!important}
      #camera-ui .scanner-actions.success-v19 #btn-retake-v19{background:rgba(53,225,139,.13)!important;color:#45e695!important;border:1px solid rgba(53,225,139,.26)!important}
      #camera-ui .scanner-actions:not(.success-v19) #btn-retake-v19{display:none!important}
    `;document.head.appendChild(style);
  }
  function clearResultActions(){
    $('camera-ui')?.querySelector('.scanner-actions')?.classList.remove('success-v19');
    const retake=$('btn-retake-v19');if(retake)retake.style.display='none';
  }
  function clearPhoto(){
    window.cancelUniversalCapture?.();
    const photo=$('capture-preview');
    if(photo){photo.style.display='none';photo.hidden=true;photo.getContext('2d')?.clearRect(0,0,photo.width,photo.height);}
  }
  function retake(){
    clearPhoto();clearResultActions();
    ['ai-result','btn-lanjut','btn-manual'].forEach(id=>{const el=$(id);if(el)el.style.display='none';});
    const waste=window.jenisSampahAktif||'';
    if(waste&&typeof window.mulaiKamera==='function')window.mulaiKamera(waste);
  }
  function ensureRetake(){
    const actions=$('camera-ui')?.querySelector('.scanner-actions');if(!actions||$('btn-retake-v19'))return;
    const button=document.createElement('button');button.id='btn-retake-v19';button.type='button';button.className='btn-action-manual';
    button.textContent='↻ Ambil Ulang';button.addEventListener('click',retake);actions.appendChild(button);
  }
  function markResultActions(){
    const actions=$('camera-ui')?.querySelector('.scanner-actions');if(!actions)return;
    ensureRetake();actions.classList.add('success-v19');
    const manual=$('btn-manual');if(manual){manual.style.display='flex';manual.textContent='⌨️ Input Manual';}
    if($('btn-retake-v19'))$('btn-retake-v19').style.display='flex';
  }
  function wrapActions(){
    if(typeof window.mulaiKamera==='function'&&!window.mulaiKamera.__resultActionsV19){
      const original=window.mulaiKamera;
      const wrapped=function(){clearResultActions();return original.apply(this,arguments);};
      wrapped.__resultActionsV19=true;window.mulaiKamera=wrapped;
    }
    if(typeof window.suksesScan==='function'&&!window.suksesScan.__resultActionsV19){
      const original=window.suksesScan;
      const wrapped=function(){const result=original.apply(this,arguments);setTimeout(markResultActions,0);return result;};
      wrapped.__resultActionsV19=true;window.suksesScan=wrapped;
    }
    if(typeof window.tutupKamera==='function'&&!window.tutupKamera.__resultActionsV19){
      const original=window.tutupKamera;
      const wrapped=function(){clearPhoto();const result=original.apply(this,arguments);clearResultActions();return result;};
      wrapped.__resultActionsV19=true;window.tutupKamera=wrapped;
    }
  }
  function install(){installStyle();ensureRetake();wrapActions();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>setTimeout(wrapActions,20),{once:true});
})();