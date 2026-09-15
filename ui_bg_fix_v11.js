// UI background fix v11.1 — explicit forest image for GitHub Pages preview.
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
          linear-gradient(155deg,rgba(4,28,14,.16),rgba(17,58,31,.12)),
          url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=85&w=1600&auto=format&fit=crop'),
          url('./Assets/bg.jpg')!important;
        background-size:cover,cover,cover!important;
        background-position:center center,center center,center center!important;
        background-repeat:no-repeat,no-repeat,no-repeat!important;
        background-attachment:fixed,fixed,fixed!important;
      }

      body::before{
        content:none!important;
        display:none!important;
        background:none!important;
      }

      body::after{
        content:''!important;
        position:fixed!important;
        inset:0!important;
        z-index:0!important;
        pointer-events:none!important;
        background:
          radial-gradient(circle at 18% 8%,rgba(255,255,255,.08),transparent 28%),
          linear-gradient(to bottom,rgba(2,21,10,.00),rgba(2,24,11,.08))!important;
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
          background-attachment:scroll,scroll,scroll!important;
          background-position:center center,center center,center center!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
