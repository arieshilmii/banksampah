// UI background fix v11 — render the jungle image directly on the page body.
(function(){
  'use strict';

  function install(){
    if(document.getElementById('glass-bg-v11-style')) return;
    const style=document.createElement('style');
    style.id='glass-bg-v11-style';
    style.textContent=`
      html{
        min-height:100%;
        background:#163c25!important;
      }

      body{
        min-height:100vh!important;
        background-color:#163c25!important;
        background-image:
          linear-gradient(155deg,rgba(5,34,17,.20),rgba(21,67,36,.12)),
          url('./Assets/bg.jpg')!important;
        background-size:cover!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
        background-attachment:fixed!important;
      }

      /* The old pseudo background sat behind the opaque body and was invisible. */
      body::before{
        content:none!important;
        display:none!important;
        background:none!important;
      }

      /* Gentle readable overlay without hiding the photograph. */
      body::after{
        content:''!important;
        position:fixed!important;
        inset:0!important;
        z-index:0!important;
        pointer-events:none!important;
        background:
          radial-gradient(circle at 18% 8%,rgba(255,255,255,.10),transparent 30%),
          linear-gradient(to bottom,rgba(3,26,12,.02),rgba(2,24,11,.12))!important;
      }

      #form-login,
      #halaman-beranda{
        position:relative!important;
        z-index:2!important;
      }

      .glass-v91-nav{z-index:8000!important;}
      .modal-overlay{z-index:9000!important;}
      #camera-ui{z-index:9999!important;}

      @media(max-width:768px){
        body{
          background-attachment:scroll!important;
          background-position:center center!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
