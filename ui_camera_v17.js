// Camera UI v17 — clean full-screen camera + custom manual weight modal.
(function(){
  'use strict';

  function installStyle(){
    if(document.getElementById('camera-clean-v17-style')) return;
    const style=document.createElement('style');
    style.id='camera-clean-v17-style';
    style.textContent=`
      /* Camera: remove top rectangle/header/labels while keeping scan crop geometry alive */
      #camera-ui .kamera-top-bar{display:none!important;}
      #camera-ui .scan-source{display:none!important;}
      #camera-ui .scanner-focus-area{flex:1!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;}
      #camera-ui #scanner-box{
        opacity:0!important;
        box-shadow:none!important;
        border:0!important;
        background:transparent!important;
      }
      #camera-ui #scanner-box::after,
      #camera-ui .bracket,
      #camera-ui .scan-line{display:none!important;}

      #camera-ui .kamera-bottom-panel{
        margin-top:auto!important;
        min-height:170px!important;
        padding:20px 20px calc(20px + env(safe-area-inset-bottom))!important;
        border-radius:26px 26px 0 0!important;
        background:linear-gradient(180deg,rgba(3,17,11,.90),rgba(2,12,8,.97))!important;
        backdrop-filter:blur(14px)!important;
        -webkit-backdrop-filter:blur(14px)!important;
        box-shadow:0 -12px 36px rgba(0,0,0,.18)!important;
      }
      #camera-ui .kamera-status-info{
        color:#37e18b!important;
        font-size:15px!important;
        font-weight:800!important;
        line-height:1.35!important;
        margin:0 0 12px!important;
      }
      #camera-ui .scanner-tip{
        color:rgba(255,255,255,.68)!important;
        font-size:11px!important;
        line-height:1.45!important;
        margin-top:12px!important;
        max-width:330px!important;
      }
      #camera-ui .scanner-actions{max-width:340px!important;gap:9px!important;}
      #camera-ui .btn-action-main,
      #camera-ui .btn-action-manual{
        border-radius:24px!important;
        padding:14px 18px!important;
        font-size:15px!important;
        font-weight:800!important;
      }
      #camera-ui .btn-action-main{
        background:linear-gradient(135deg,#35e18b,#20c978)!important;
        color:#082b1a!important;
        box-shadow:0 10px 24px rgba(32,201,120,.25)!important;
      }
      #camera-ui .btn-action-manual{
        background:rgba(255,255,255,.10)!important;
        color:#fff!important;
        border:1px solid rgba(255,255,255,.18)!important;
      }

      /* Custom manual input modal */
      #manual-weight-modal{
        position:fixed;inset:0;z-index:20000;display:none;align-items:flex-end;justify-content:center;
        padding:18px 14px calc(18px + env(safe-area-inset-bottom));
      }
      #manual-weight-modal.show{display:flex!important;}
      #manual-weight-modal .manual-backdrop{
        position:absolute;inset:0;background:rgba(7,18,13,.54);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);
      }
      #manual-weight-modal .manual-card{
        position:relative;z-index:1;width:min(100%,380px);background:linear-gradient(180deg,#ffffff,#f2fbf7);
        border:1px solid rgba(255,255,255,.92);border-radius:26px;padding:20px 18px 18px;
        box-shadow:0 24px 70px rgba(0,0,0,.28);animation:manualUp .18s ease-out;
      }
      @keyframes manualUp{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
      #manual-weight-modal .manual-handle{width:42px;height:4px;border-radius:999px;background:#d7e4dd;margin:0 auto 16px;}
      #manual-weight-modal .manual-icon{
        width:50px;height:50px;border-radius:16px;background:#dff8ec;display:flex;align-items:center;justify-content:center;
        font-size:25px;margin-bottom:12px;
      }
      #manual-weight-modal h3{margin:0;color:#143b29;font-size:20px;line-height:1.2;}
      #manual-weight-modal .manual-sub{margin:6px 0 18px;color:#6a7e73;font-size:13px;line-height:1.4;}
      #manual-weight-modal .manual-label{display:block;margin:0 0 8px;color:#2c5740;font-size:13px;font-weight:800;text-shadow:none;}
      #manual-weight-modal .manual-field{position:relative;}
      #manual-weight-modal input{
        width:100%;height:62px;border:1.5px solid #d5e5dc;border-radius:17px;background:#fff;color:#153c2a;
        padding:0 64px 0 16px;font-size:28px;font-weight:850;outline:none;box-shadow:none;
      }
      #manual-weight-modal input:focus{border-color:#29c97a;box-shadow:0 0 0 4px rgba(41,201,122,.13);}
      #manual-weight-modal .manual-unit{position:absolute;right:17px;top:50%;transform:translateY(-50%);font-size:15px;font-weight:800;color:#6d8176;}
      #manual-weight-modal .manual-help{display:block;margin-top:7px;color:#809087;font-size:11px;}
      #manual-weight-modal .manual-actions{display:grid;grid-template-columns:1fr 1.35fr;gap:10px;margin-top:19px;}
      #manual-weight-modal button{height:48px;border:0;border-radius:15px;font-size:14px;font-weight:800;}
      #manual-weight-modal .manual-cancel{background:#edf3ef;color:#365b47;}
      #manual-weight-modal .manual-save{background:linear-gradient(135deg,#35df8c,#20c879);color:#08311c;box-shadow:0 9px 20px rgba(32,200,121,.20);}
      #manual-weight-modal .manual-error{display:none;margin-top:8px;color:#c54545;font-size:12px;font-weight:700;}
      #manual-weight-modal .manual-error.show{display:block;}
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    if(document.getElementById('manual-weight-modal')) return;
    const el=document.createElement('div');
    el.id='manual-weight-modal';
    el.innerHTML=`
      <div class="manual-backdrop"></div>
      <div class="manual-card" role="dialog" aria-modal="true" aria-labelledby="manual-weight-title">
        <div class="manual-handle"></div>
        <div class="manual-icon">⚖️</div>
        <h3 id="manual-weight-title">Input Berat Manual</h3>
        <div class="manual-sub" id="manual-weight-sub">Masukkan berat sampah dalam kilogram.</div>
        <label class="manual-label" for="manual-weight-input">Berat</label>
        <div class="manual-field">
          <input id="manual-weight-input" type="text" inputmode="decimal" autocomplete="off" placeholder="0,000">
          <span class="manual-unit">Kg</span>
        </div>
        <small class="manual-help">Contoh: 0,260 atau 2,5</small>
        <div class="manual-error" id="manual-weight-error">Masukkan angka lebih dari 0, maksimal 3 angka desimal.</div>
        <div class="manual-actions">
          <button type="button" class="manual-cancel">Batal</button>
          <button type="button" class="manual-save">Gunakan Berat</button>
        </div>
      </div>`;
    document.body.appendChild(el);

    const close=()=>el.classList.remove('show');
    el.querySelector('.manual-backdrop').addEventListener('click',close);
    el.querySelector('.manual-cancel').addEventListener('click',close);
    el.querySelector('.manual-save').addEventListener('click',submitManual);
    el.querySelector('#manual-weight-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submitManual();}});
  }

  function openManual(){
    ensureModal();
    const modal=document.getElementById('manual-weight-modal');
    const input=document.getElementById('manual-weight-input');
    const sub=document.getElementById('manual-weight-sub');
    const err=document.getElementById('manual-weight-error');
    const jenis=(typeof window.jenisSampahAktif==='string' && window.jenisSampahAktif) ? window.jenisSampahAktif : 'sampah';
    sub.textContent=`Masukkan berat ${jenis} dalam kilogram.`;
    input.value='';
    err.classList.remove('show');
    modal.classList.add('show');
    setTimeout(()=>input.focus(),80);
  }

  function submitManual(){
    const modal=document.getElementById('manual-weight-modal');
    const input=document.getElementById('manual-weight-input');
    const err=document.getElementById('manual-weight-error');
    const raw=String(input.value||'').trim().replace(',','.');
    if(!/^\d+(?:\.\d{1,3})?$/.test(raw) || Number(raw)<=0){
      err.classList.add('show');
      input.focus();
      return;
    }
    err.classList.remove('show');
    modal.classList.remove('show');
    if(typeof window.suksesScan==='function') window.suksesScan(raw,'manual');
  }

  function installOverride(){
    // Override legacy prompt()-based manual input after the inline app script has loaded.
    window.inputManual=openManual;
  }

  function run(){
    installStyle();
    ensureModal();
    installOverride();
    setTimeout(installOverride,0);
    setTimeout(installOverride,250);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',()=>setTimeout(run,0),{once:true});
})();
