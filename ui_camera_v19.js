// Camera UI v19 — success action row + Android back handling.
(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  let cameraHistoryArmed=false;
  let closingFromPop=false;
  let lastWasteName='';

  function installStyle(){
    if($('camera-v19-style')) return;
    const s=document.createElement('style');
    s.id='camera-v19-style';
    s.textContent=`
      #camera-ui .scanner-actions.success-v19{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        gap:10px!important;
        width:100%!important;
        max-width:360px!important;
      }
      #camera-ui .scanner-actions.success-v19 #btn-lanjut{
        grid-column:1/-1!important;
        width:100%!important;
        min-height:54px!important;
        border-radius:24px!important;
      }
      #camera-ui .scanner-actions.success-v19 #btn-manual,
      #camera-ui .scanner-actions.success-v19 #btn-retake-v19{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:48px!important;
        margin:0!important;
        padding:12px 10px!important;
        border-radius:20px!important;
        font-size:13px!important;
        font-weight:800!important;
        line-height:1.15!important;
      }
      #camera-ui .scanner-actions.success-v19 #btn-manual{
        background:rgba(255,255,255,.10)!important;
        color:#fff!important;
        border:1px solid rgba(255,255,255,.18)!important;
        box-shadow:none!important;
      }
      #camera-ui .scanner-actions.success-v19 #btn-retake-v19{
        background:rgba(53,225,139,.13)!important;
        color:#45e695!important;
        border:1px solid rgba(53,225,139,.26)!important;
      }
      #camera-ui .scanner-actions:not(.success-v19) #btn-retake-v19{display:none!important;}
    `;
    document.head.appendChild(s);
  }

  function ensureRetakeButton(){
    const actions=document.querySelector('#camera-ui .scanner-actions');
    if(!actions) return null;
    let btn=$('btn-retake-v19');
    if(!btn){
      btn=document.createElement('button');
      btn.id='btn-retake-v19';
      btn.type='button';
      btn.className='btn-action-manual';
      btn.textContent='↻ Ambil Ulang';
      btn.addEventListener('click',retake);
      actions.appendChild(btn);
    }
    return btn;
  }

  function markSuccessActions(){
    const actions=document.querySelector('#camera-ui .scanner-actions');
    if(!actions) return;
    ensureRetakeButton();
    actions.classList.add('success-v19');
    const manual=$('btn-manual');
    if(manual){
      manual.style.display='flex';
      manual.textContent='⌨️ Input Manual';
    }
    const retakeBtn=$('btn-retake-v19');
    if(retakeBtn) retakeBtn.style.display='flex';
  }

  function clearSuccessActions(){
    const actions=document.querySelector('#camera-ui .scanner-actions');
    if(actions) actions.classList.remove('success-v19');
    const retakeBtn=$('btn-retake-v19');
    if(retakeBtn) retakeBtn.style.display='none';
  }

  function retake(){
    clearSuccessActions();
    const result=$('ai-result');
    if(result) result.style.display='none';
    const save=$('btn-lanjut');
    if(save) save.style.display='none';
    const manual=$('btn-manual');
    if(manual) manual.style.display='none';
    const name=(typeof window.jenisSampahAktif==='string' && window.jenisSampahAktif) || lastWasteName;
    if(typeof window.mulaiKamera==='function' && name){
      window.mulaiKamera(name);
    }
  }

  function isCameraOpen(){
    const ui=$('camera-ui');
    if(!ui) return false;
    return getComputedStyle(ui).display!=='none';
  }

  function isManualOpen(){
    return $('manual-weight-modal')?.classList.contains('show') || false;
  }

  function closeManual(){
    $('manual-weight-modal')?.classList.remove('show');
  }

  function armHistory(){
    if(cameraHistoryArmed) return;
    try{
      history.pushState({bankSampahCamera:true},'',location.href);
      cameraHistoryArmed=true;
    }catch(_){}
  }

  function disarmHistoryWithoutPop(){
    cameraHistoryArmed=false;
  }

  function installBackHandler(){
    window.addEventListener('popstate',()=>{
      if(isManualOpen()){
        closeManual();
        if(isCameraOpen()) armHistory();
        return;
      }
      if(isCameraOpen()){
        closingFromPop=true;
        try{ if(typeof window.tutupKamera==='function') window.tutupKamera(); }catch(_){}
        clearSuccessActions();
        cameraHistoryArmed=false;
        closingFromPop=false;
      }
    });
  }

  function wrapAppFunctions(){
    if(typeof window.mulaiKamera==='function' && !window.mulaiKamera.__v19){
      const originalStart=window.mulaiKamera;
      const wrappedStart=function(name){
        lastWasteName=name||lastWasteName;
        clearSuccessActions();
        const out=originalStart.apply(this,arguments);
        armHistory();
        return out;
      };
      wrappedStart.__v19=true;
      window.mulaiKamera=wrappedStart;
    }

    if(typeof window.suksesScan==='function' && !window.suksesScan.__v19){
      const originalSuccess=window.suksesScan;
      const wrappedSuccess=function(){
        const out=originalSuccess.apply(this,arguments);
        setTimeout(markSuccessActions,0);
        return out;
      };
      wrappedSuccess.__v19=true;
      window.suksesScan=wrappedSuccess;
    }

    if(typeof window.tutupKamera==='function' && !window.tutupKamera.__v19){
      const originalClose=window.tutupKamera;
      const wrappedClose=function(){
        const out=originalClose.apply(this,arguments);
        clearSuccessActions();
        if(cameraHistoryArmed && !closingFromPop){
          cameraHistoryArmed=false;
          try{ history.back(); }catch(_){}
        }else{
          disarmHistoryWithoutPop();
        }
        return out;
      };
      wrappedClose.__v19=true;
      window.tutupKamera=wrappedClose;
    }
  }

  function run(){
    installStyle();
    ensureRetakeButton();
    wrapAppFunctions();
    // Re-wrap after other load handlers finish overriding camera functions.
    setTimeout(wrapAppFunctions,0);
    setTimeout(wrapAppFunctions,300);
    setTimeout(wrapAppFunctions,900);
  }

  installBackHandler();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('load',()=>setTimeout(run,0),{once:true});
})();
