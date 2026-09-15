// Glassmorphic UI v10 — transparent jungle refinement layer only.
(function(){
  'use strict';

  function install(){
    if(document.getElementById('glass-v10-style')) return;
    const s=document.createElement('style');
    s.id='glass-v10-style';
    s.textContent=`
      :root{
        --glass-v10:rgba(237,248,235,.20);
        --glass-v10-strong:rgba(239,249,237,.27);
        --glass-v10-soft:rgba(255,255,255,.16);
        --glass-v10-line:rgba(255,255,255,.58);
        --glass-v10-line-soft:rgba(255,255,255,.40);
        --glass-v10-shadow:0 12px 32px rgba(7,34,18,.16), inset 0 1px 0 rgba(255,255,255,.50);
      }

      html,body{background:#163c25!important;}
      body::before{
        inset:-3%!important;
        background-image:
          linear-gradient(155deg,rgba(12,49,26,.08),rgba(35,88,51,.12)),
          url('Assets/bg.jpg')!important;
        background-size:cover!important;
        background-position:center!important;
        background-attachment:fixed!important;
        filter:blur(3px) saturate(1.08) brightness(.92)!important;
        opacity:1!important;
        transform:scale(1.035);
      }
      body::after{
        background:
          radial-gradient(circle at 15% 6%,rgba(244,255,238,.18),transparent 30%),
          radial-gradient(circle at 78% 22%,rgba(153,226,142,.11),transparent 26%),
          linear-gradient(to bottom,rgba(4,30,14,.02),rgba(3,24,12,.11))!important;
      }

      /* reusable liquid-glass feel */
      #form-login.glass-v91,
      .header-beranda.glass-v91-header,
      .rekap-card,
      .book-card,
      .search-beranda,
      .cat-card,
      .glass-v91-banner,
      .glass-v91-nav,
      .modal-content,
      .subcat-card,
      .kamera-top-bar,
      .glass-v91-camera-hint,
      .kamera-bottom-panel,
      #form-login input{
        background:var(--glass-v10)!important;
        border:1px solid var(--glass-v10-line)!important;
        box-shadow:var(--glass-v10-shadow)!important;
        backdrop-filter:blur(13px) saturate(1.16)!important;
        -webkit-backdrop-filter:blur(13px) saturate(1.16)!important;
      }

      #form-login.glass-v91{
        background:rgba(236,248,233,.18)!important;
        border-radius:31px!important;
      }
      #form-login input{
        background:rgba(255,255,255,.17)!important;
        border-color:rgba(255,255,255,.55)!important;
        color:#183a22!important;
      }
      #form-login input::placeholder{color:rgba(39,66,45,.68)!important;}
      #form-login input[readonly]{background:rgba(239,249,235,.16)!important;}
      #form-login .btn-submit{
        background:linear-gradient(135deg,rgba(112,181,101,.72),rgba(49,126,69,.76))!important;
        border:1px solid rgba(255,255,255,.54)!important;
        box-shadow:0 11px 27px rgba(12,55,26,.20),inset 0 1px 0 rgba(255,255,255,.42)!important;
        backdrop-filter:blur(13px)!important;
        -webkit-backdrop-filter:blur(13px)!important;
      }

      .header-beranda.glass-v91-header{
        background:rgba(225,244,224,.16)!important;
        border-radius:25px!important;
      }
      .profile-section h2{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.34)!important;}
      .profile-section p,.glass-v91-tagline{color:rgba(255,255,255,.90)!important;text-shadow:0 1px 5px rgba(0,0,0,.30)!important;}

      .rekap-card{
        background:rgba(248,252,247,.24)!important;
        border-color:rgba(255,255,255,.64)!important;
      }
      .rekap-label{color:rgba(44,70,49,.76)!important;}
      .rekap-value{color:#1d6633!important;}
      .rekap-divider{background:rgba(31,87,45,.15)!important;}

      .book-card,
      .search-beranda,
      .cat-card,
      .glass-v91-banner{
        background:rgba(238,248,235,.19)!important;
        border-color:rgba(255,255,255,.56)!important;
      }
      .book-card{color:#153a21!important;}
      .search-beranda{color:#163a21!important;}
      .search-beranda::placeholder{color:rgba(32,68,43,.70)!important;}
      .cat-card{
        min-height:100px!important;
        border-radius:18px!important;
        box-shadow:0 10px 25px rgba(7,35,17,.14),inset 0 1px 0 rgba(255,255,255,.44)!important;
      }
      .cat-title{
        color:#183c23!important;
        text-shadow:0 1px 2px rgba(255,255,255,.24)!important;
      }
      .cat-card:active{transform:scale(.965)!important;background:rgba(244,252,241,.25)!important;}

      .glass-v91-nav{
        background:rgba(234,247,232,.20)!important;
        border-color:rgba(255,255,255,.60)!important;
        box-shadow:0 14px 32px rgba(7,32,16,.20),inset 0 1px 0 rgba(255,255,255,.46)!important;
      }
      .glass-v91-nav button{color:rgba(36,78,47,.84)!important;}
      .glass-v91-nav .active{color:#176d35!important;}

      .modal-overlay{background:rgba(5,27,13,.32)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}
      .modal-content{background:rgba(233,247,230,.27)!important;}
      .subcat-card{background:rgba(248,252,246,.22)!important;}

      #camera-ui{
        background:#0e2b18!important;
      }
      .kamera-overlay-dark{
        background:linear-gradient(to bottom,rgba(6,26,12,.16),transparent 24%,transparent 63%,rgba(5,24,11,.20))!important;
      }
      .kamera-top-bar,
      .glass-v91-camera-hint,
      .kamera-bottom-panel{
        background:rgba(224,242,222,.15)!important;
        border-color:rgba(255,255,255,.46)!important;
        box-shadow:0 13px 34px rgba(0,0,0,.17),inset 0 1px 0 rgba(255,255,255,.35)!important;
      }
      .back-btn,.torch-btn,#btn-manual{
        background:rgba(242,250,239,.16)!important;
        border:1px solid rgba(255,255,255,.42)!important;
        backdrop-filter:blur(12px)!important;
        -webkit-backdrop-filter:blur(12px)!important;
      }
      #btn-lanjut,#btn-capture{
        background:linear-gradient(135deg,rgba(91,190,108,.78),rgba(39,131,63,.84))!important;
        border:1px solid rgba(255,255,255,.53)!important;
        backdrop-filter:blur(12px)!important;
        -webkit-backdrop-filter:blur(12px)!important;
      }
      .scanner-box{
        border-color:rgba(255,255,255,.38)!important;
        box-shadow:0 0 0 9999px rgba(2,18,8,.25),0 14px 38px rgba(0,0,0,.17),inset 0 0 0 1px rgba(255,255,255,.10)!important;
      }

      @media(max-width:420px){
        body::before{background-position:center center!important;}
        #halaman-beranda.glass-v91-home{padding-top:12px!important;}
        .cat-card{min-height:96px!important;}
      }
    `;
    document.head.appendChild(s);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
