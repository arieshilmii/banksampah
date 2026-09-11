// Scanner UI v6: keep status/actions visually above the bottom panel.
(function(){
  'use strict';

  function installStyle(){
    if(document.getElementById('scanner-ui-v6-style'))return;
    const style=document.createElement('style');
    style.id='scanner-ui-v6-style';
    style.textContent=`
      .kamera-bottom-panel{
        position:relative !important;
        z-index:12000 !important;
        isolation:isolate !important;
        background:#07120d !important;
        backdrop-filter:none !important;
        -webkit-backdrop-filter:none !important;
        box-shadow:0 -8px 26px rgba(0,0,0,.24) !important;
        overflow:visible !important;
        pointer-events:auto !important;
      }
      .kamera-bottom-panel::before,.kamera-bottom-panel::after{pointer-events:none !important;}
      .kamera-bottom-panel > *{
        position:relative !important;
        z-index:2 !important;
        opacity:1 !important;
        filter:none !important;
      }
      .scan-source{color:#a8c8b4 !important;opacity:1 !important;}
      .kamera-status-info{
        color:#27f28a !important;
        opacity:1 !important;
        text-shadow:0 0 10px rgba(39,242,138,.12) !important;
      }
      #status-text{color:#27f28a !important;opacity:1 !important;}
      .scanner-actions{
        position:relative !important;
        z-index:12020 !important;
        opacity:1 !important;
        filter:none !important;
        pointer-events:auto !important;
      }
      #btn-lanjut{
        background:#20d979 !important;
        color:#052315 !important;
        border:0 !important;
        opacity:1 !important;
        box-shadow:0 5px 16px rgba(32,217,121,.18) !important;
      }
      #btn-manual{
        background:#f6f8f7 !important;
        color:#15231a !important;
        border:0 !important;
        opacity:1 !important;
        box-shadow:0 4px 14px rgba(0,0,0,.18) !important;
      }
      #btn-manual:disabled,#btn-lanjut:disabled{opacity:.55 !important;}
      .scanner-tip{color:#bcc7c0 !important;opacity:1 !important;}
      .ai-result-display{color:#fff !important;opacity:1 !important;}
      #capture-preview{z-index:3 !important;}
      .scanner-focus-area{z-index:3 !important;}
    `;
    document.head.appendChild(style);
  }

  window.addEventListener('load',installStyle);
})();
