// Camera UI v20 — minimal visible OCR crop guide without changing OCR geometry.
(function(){
  'use strict';

  function install(){
    if(document.getElementById('camera-v20-style')) return;
    const style=document.createElement('style');
    style.id='camera-v20-style';
    style.textContent=`
      #camera-ui .scanner-focus-area{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        flex:1!important;
        pointer-events:none!important;
        z-index:3!important;
      }
      #camera-ui #scanner-box{
        opacity:1!important;
        width:min(78vw,340px)!important;
        aspect-ratio:2.5/1!important;
        position:relative!important;
        border:1.5px solid rgba(255,255,255,.88)!important;
        border-radius:18px!important;
        background:rgba(255,255,255,.025)!important;
        box-shadow:0 0 0 1px rgba(39,226,139,.18),0 8px 30px rgba(0,0,0,.10)!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
      }
      #camera-ui #scanner-box::before{
        content:''!important;
        position:absolute!important;
        inset:-1px!important;
        border-radius:18px!important;
        pointer-events:none!important;
        background:
          linear-gradient(#35e28b,#35e28b) left top/28px 2px no-repeat,
          linear-gradient(#35e28b,#35e28b) left top/2px 28px no-repeat,
          linear-gradient(#35e28b,#35e28b) right top/28px 2px no-repeat,
          linear-gradient(#35e28b,#35e28b) right top/2px 28px no-repeat,
          linear-gradient(#35e28b,#35e28b) left bottom/28px 2px no-repeat,
          linear-gradient(#35e28b,#35e28b) left bottom/2px 28px no-repeat,
          linear-gradient(#35e28b,#35e28b) right bottom/28px 2px no-repeat,
          linear-gradient(#35e28b,#35e28b) right bottom/2px 28px no-repeat!important;
      }
      #camera-ui #scanner-box::after{
        content:''!important;
        display:block!important;
        position:absolute!important;
        left:0!important;right:0!important;bottom:-28px!important;
        color:rgba(255,255,255,.88)!important;
        font-size:11px!important;
        font-weight:650!important;
        text-align:center!important;
        text-shadow:0 1px 3px rgba(0,0,0,.45)!important;
      }
      #camera-ui .bracket,
      #camera-ui .scan-line{display:none!important;}
    `;
    document.head.appendChild(style);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.addEventListener('load',install,{once:true});
})();
