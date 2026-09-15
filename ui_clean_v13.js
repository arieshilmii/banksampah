// Clean mobile UI v13 — single visual layer, no photo backgrounds or glassmorphism.
(function(){
  'use strict';

  const $ = (id)=>document.getElementById(id);

  function injectStyles(){
    if($('clean-ui-v13-style')) return;
    const style=document.createElement('style');
    style.id='clean-ui-v13-style';
    style.textContent=`
      :root{
        --mint-bg:#ecfaf6;
        --mint-soft:#dff6ef;
        --mint-card:#c6f2e6;
        --green:#16b98a;
        --green-dark:#087458;
        --ink:#163c32;
        --muted:#70847d;
        --line:#d7ece5;
        --white:#ffffff;
      }

      *{box-sizing:border-box}
      html,body{min-height:100%;background:var(--mint-bg)!important;background-image:none!important}
      body{
        margin:0!important;
        color:var(--ink)!important;
        font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif!important;
        display:flex!important;
        justify-content:center!important;
        align-items:flex-start!important;
        overflow-x:hidden!important;
      }
      body::before,body::after{content:none!important;display:none!important;background:none!important}
      button,input{font:inherit}

      /* PROFILE / LOGIN */
      #form-login{
        width:min(92vw,390px)!important;
        max-width:390px!important;
        margin:8vh auto 40px!important;
        padding:28px 24px 24px!important;
        border:1px solid var(--line)!important;
        border-radius:28px!important;
        background:#fff!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        box-shadow:0 18px 50px rgba(32,103,81,.10)!important;
        color:var(--ink)!important;
        position:relative!important;
        z-index:5!important;
      }
      #form-login::before{
        content:'♻️';
        width:74px;height:74px;border-radius:24px;
        display:flex;align-items:center;justify-content:center;
        margin:0 auto 16px;
        background:linear-gradient(145deg,#d9f8ef,#bdeedc);
        color:var(--green-dark);font-size:34px;
        box-shadow:0 10px 24px rgba(22,185,138,.14);
      }
      #form-login h2{
        margin:0 0 7px!important;
        text-align:center!important;
        color:var(--ink)!important;
        text-shadow:none!important;
        font-size:23px!important;
        letter-spacing:-.02em!important;
      }
      #form-login h2::after{
        content:'Atur profil sebelum mulai mencatat setoran sampah';
        display:block;margin-top:7px;font-size:12px;font-weight:500;color:var(--muted);
      }
      #form-login label{color:var(--ink)!important;text-shadow:none!important;font-size:12px!important;font-weight:750!important;margin-bottom:7px!important}
      #form-login .form-group{margin-bottom:15px!important}
      #form-login input{
        width:100%!important;padding:13px 14px!important;border:1px solid var(--line)!important;border-radius:15px!important;
        background:#f8fffc!important;color:var(--ink)!important;outline:none!important;box-shadow:none!important;
      }
      #form-login input:focus{border-color:#71d8b8!important;box-shadow:0 0 0 4px rgba(22,185,138,.08)!important}
      #form-login input[readonly]{background:#f0f7f4!important;color:#557067!important}
      #form-login .btn-submit{
        width:100%!important;padding:14px 16px!important;border:0!important;border-radius:16px!important;
        background:var(--green)!important;color:#fff!important;font-weight:850!important;margin-top:7px!important;
        box-shadow:0 10px 24px rgba(22,185,138,.22)!important;
      }
      #dropdown-list{border:1px solid var(--line)!important;border-radius:15px!important;box-shadow:0 14px 34px rgba(26,84,66,.14)!important;overflow:hidden!important}

      /* HOME */
      #halaman-beranda{
        width:100%!important;max-width:430px!important;min-height:100vh!important;height:auto!important;
        padding:20px 18px calc(112px + env(safe-area-inset-bottom))!important;
        margin:0 auto!important;background:transparent!important;overflow-y:visible!important;color:var(--ink)!important;
        position:relative!important;z-index:2!important;
      }
      .header-beranda{
        background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;
        padding:8px 0 0!important;margin:0 0 16px!important;color:var(--ink)!important;text-shadow:none!important;gap:14px!important;
      }
      .profile-section{position:relative;padding-right:56px!important}
      .profile-section::after{
        content:'♻';position:absolute;right:0;top:0;width:44px;height:44px;border-radius:15px;
        background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;
        color:var(--green);font-size:24px;box-shadow:0 7px 18px rgba(23,111,84,.08);
      }
      .profile-section::before{content:'Selamat datang';display:block;font-size:11px;color:var(--muted);font-weight:650;margin-bottom:2px}
      .profile-section h2{margin:0!important;font-size:23px!important;color:var(--ink)!important;letter-spacing:-.02em!important}
      .profile-section p{margin:4px 0 0!important;color:#658077!important;font-size:11px!important;opacity:1!important}

      .rekap-card{
        position:relative!important;overflow:hidden!important;min-height:188px!important;width:100%!important;
        background:linear-gradient(145deg,#bff3e5,#a8ead7)!important;border:0!important;border-radius:28px!important;
        padding:24px 145px 24px 22px!important;color:var(--ink)!important;display:block!important;
        box-shadow:0 16px 30px rgba(21,130,98,.10)!important;
      }
      .rekap-card::before{content:'Koleksi Sampah';display:block;font-size:13px;font-weight:800;color:#2b6657;margin-bottom:24px}
      .rekap-card::after{content:'';position:absolute;right:-26px;bottom:-44px;width:170px;height:170px;border-radius:50%;background:rgba(255,255,255,.23)}
      .rekap-item{display:block!important;text-align:left!important;position:relative!important;z-index:3!important}
      .rekap-item:first-child .rekap-label{display:none!important}
      .rekap-item:first-child .rekap-value{
        font-size:39px!important;line-height:1!important;font-weight:900!important;letter-spacing:-.04em!important;color:#102f27!important;
      }
      .rekap-item:first-child .rekap-value::after{content:' terkumpul';display:block;font-size:11px;font-weight:650;letter-spacing:0;color:#4c776b;margin-top:8px}
      .rekap-divider{display:none!important}
      .rekap-item:nth-of-type(2){margin-top:18px!important}
      .rekap-item:nth-of-type(2) .rekap-label{font-size:9px!important;color:#558074!important;margin-bottom:3px!important}
      .rekap-item:nth-of-type(2) .rekap-value{font-size:12px!important;color:#315e52!important;font-weight:800!important}
      .clean-bin-art{position:absolute;right:18px;top:44px;width:126px;height:112px;z-index:2;filter:drop-shadow(0 10px 12px rgba(8,116,88,.15))}
      .clean-bin-art svg{width:100%;height:100%;display:block}

      .book-card{
        width:100%!important;margin:0 0 13px!important;padding:13px 14px!important;border:1px solid var(--line)!important;border-radius:20px!important;
        background:#fff!important;box-shadow:0 7px 20px rgba(33,104,83,.07)!important;color:var(--ink)!important;
      }
      .book-icon{background:#e1f8f0!important;color:var(--green)!important;border-radius:14px!important}
      .book-title{color:var(--ink)!important;font-size:13px!important}
      .book-sub{color:var(--muted)!important}

      .search-beranda{
        width:100%!important;margin:0 0 18px!important;padding:13px 16px!important;border:1px solid var(--line)!important;border-radius:18px!important;
        background:#fff!important;color:var(--ink)!important;box-shadow:0 5px 16px rgba(33,104,83,.05)!important;
      }
      .clean-section-title{display:flex;align-items:center;justify-content:space-between;margin:2px 2px 12px;font-weight:900;color:var(--ink)}
      .clean-section-title strong{font-size:17px;letter-spacing:-.015em}
      .clean-section-title span{font-size:10px;color:#678078;font-weight:750}

      .category-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;padding:0 0 18px!important}
      .cat-card{
        min-width:0!important;min-height:126px!important;padding:14px 7px 12px!important;border:1px solid var(--line)!important;border-radius:21px!important;
        background:#f8fffd!important;box-shadow:0 7px 18px rgba(31,108,84,.055)!important;text-align:center!important;
        display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:8px!important;
      }
      .cat-card:active{transform:scale(.97)!important;background:#edf9f5!important}
      .cat-icon{width:54px;height:54px;border-radius:18px;background:#dff6ef;display:flex!important;align-items:center!important;justify-content:center!important;font-size:28px!important;margin:0!important}
      .cat-title{font-size:11px!important;line-height:1.22!important;color:#24483e!important;font-weight:800!important;word-break:normal!important}

      /* MODAL */
      .modal-overlay{background:rgba(20,49,40,.42)!important;backdrop-filter:blur(5px)!important;-webkit-backdrop-filter:blur(5px)!important}
      .modal-content{background:#f5fcf9!important;border-radius:28px 28px 0 0!important;padding:18px!important;box-shadow:0 -16px 50px rgba(12,69,51,.18)!important}
      .modal-header{border-bottom:1px solid var(--line)!important;padding-bottom:12px!important}
      .modal-title{color:var(--ink)!important;font-size:17px!important}
      .modal-close{background:#e1f4ed!important;color:#356357!important}
      .subcat-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
      .subcat-card{background:#fff!important;border:1px solid var(--line)!important;border-radius:18px!important;box-shadow:0 5px 14px rgba(31,108,84,.05)!important}

      /* SAVINGS SHEET */
      #savings-book-overlay{background:rgba(19,49,39,.46)!important}
      #savings-book-sheet{background:#f3fbf8!important}
      .book-head{background:var(--green)!important}
      .book-stat,.book-row{border:1px solid var(--line)!important;box-shadow:none!important}
      .book-stat-value,.book-row-weight{color:var(--green-dark)!important}

      /* CAMERA */
      #camera-ui{background:#08150f!important}
      .kamera-top-bar{
        background:rgba(239,252,247,.96)!important;color:var(--ink)!important;
        border-bottom:1px solid rgba(194,228,216,.85)!important;padding:calc(12px + env(safe-area-inset-top)) 14px 12px!important;
        box-shadow:0 5px 18px rgba(0,0,0,.08)!important;
      }
      .kamera-title-area,.kamera-title-area h2{color:var(--ink)!important;text-shadow:none!important}
      .kamera-title-area h2{font-size:16px!important}.kamera-title-area small{color:#668078!important;opacity:1!important}
      .back-btn,.torch-btn{background:#fff!important;color:var(--green-dark)!important;border:1px solid var(--line)!important;box-shadow:none!important}
      .scanner-box{border-radius:24px!important;box-shadow:0 0 0 9999px rgba(4,17,12,.48)!important}
      .bracket{border-color:#35d5a4!important;filter:drop-shadow(0 0 4px rgba(53,213,164,.30))!important}
      .scan-line{background:#35d5a4!important;box-shadow:0 0 9px rgba(53,213,164,.7)!important}
      .kamera-bottom-panel{
        position:relative!important;z-index:12000!important;background:#f4fcf9!important;border-radius:28px 28px 0 0!important;
        box-shadow:0 -12px 34px rgba(0,0,0,.13)!important;padding:18px 18px calc(20px + env(safe-area-inset-bottom))!important;
      }
      .scan-source{color:#668078!important}.kamera-status-info,#status-text{color:var(--green-dark)!important;text-shadow:none!important}
      .spinner{border-color:var(--green)!important;border-top-color:transparent!important}
      .ai-result-display{color:var(--ink)!important}.ai-result-display span{color:#6c817a!important}
      #btn-lanjut{background:var(--green)!important;color:#fff!important;border:0!important;border-radius:18px!important;box-shadow:0 9px 20px rgba(22,185,138,.18)!important}
      #btn-manual{background:#fff!important;color:var(--ink)!important;border:1px solid var(--line)!important;border-radius:18px!important;box-shadow:none!important}
      .scanner-tip{color:#6e817a!important}

      /* BOTTOM NAV */
      .clean-bottom-nav{
        position:fixed;left:50%;bottom:0;transform:translateX(-50%);z-index:8000;
        width:min(100%,430px);height:82px;padding:12px 20px calc(10px + env(safe-area-inset-bottom));
        background:var(--green);border-radius:28px 28px 0 0;box-shadow:0 -10px 30px rgba(12,97,72,.16);
        display:grid;grid-template-columns:1fr 1fr 1.12fr 1fr;align-items:end;gap:4px;
      }
      .clean-nav-btn{border:0;background:transparent;color:rgba(255,255,255,.78);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:9px;font-weight:800;min-height:48px;padding:0}
      .clean-nav-btn .ico{font-size:21px;line-height:1}.clean-nav-btn.active{color:#fff}
      .clean-nav-btn.scan{align-self:start;transform:translateY(-23px);color:var(--green-dark)}
      .clean-nav-btn.scan .ico{width:58px;height:58px;border-radius:50%;background:#fff;border:6px solid #d7f8ed;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 9px 22px rgba(8,116,88,.22)}
      .clean-nav-btn.scan span:last-child{margin-top:-1px;color:#fff;font-size:9px}

      @media(min-width:700px){
        #halaman-beranda{margin-top:18px!important;border-radius:32px;background:#ecfaf6!important;box-shadow:0 18px 55px rgba(20,80,62,.08)!important}
        .clean-bottom-nav{bottom:16px;border-radius:28px}
      }
    `;
    document.head.appendChild(style);
  }

  function addHeroArt(){
    const card=document.querySelector('.rekap-card');
    if(!card || card.querySelector('.clean-bin-art')) return;
    const art=document.createElement('div');
    art.className='clean-bin-art';
    art.innerHTML=`
      <svg viewBox="0 0 160 135" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="12" y="53" width="42" height="60" rx="8" fill="#6fd7b9"/>
          <rect x="19" y="43" width="28" height="12" rx="5" fill="#259f79"/>
          <path d="M22 73h22M22 84h22M22 95h22" stroke="#e9fff8" stroke-width="4" opacity=".85"/>
          <rect x="55" y="30" width="53" height="83" rx="9" fill="#20b98b"/>
          <rect x="63" y="18" width="37" height="14" rx="6" fill="#087458"/>
          <circle cx="81.5" cy="70" r="18" fill="#e9fff8" opacity=".95"/>
          <path d="M78 57l8 4-4 7M92 72l-7 7h-7M72 82l-5-9 5-7" stroke="#16b98a" stroke-width="4"/>
          <rect x="108" y="57" width="39" height="56" rx="8" fill="#84ddc4"/>
          <rect x="114" y="48" width="27" height="11" rx="5" fill="#269f7b"/>
          <path d="M118 76h19M118 87h19M118 98h19" stroke="#f1fff9" stroke-width="4" opacity=".9"/>
          <circle cx="21" cy="117" r="5" fill="#087458"/><circle cx="45" cy="117" r="5" fill="#087458"/>
          <circle cx="66" cy="118" r="6" fill="#087458"/><circle cx="98" cy="118" r="6" fill="#087458"/>
          <circle cx="117" cy="117" r="5" fill="#087458"/><circle cx="139" cy="117" r="5" fill="#087458"/>
        </g>
      </svg>`;
    card.appendChild(art);
  }

  function addSectionTitle(){
    const grid=$('category-grid');
    if(!grid || $('clean-section-title')) return;
    const title=document.createElement('div');
    title.id='clean-section-title';
    title.className='clean-section-title';
    title.innerHTML='<strong>Kategori Sampah</strong><span>Pilih untuk mulai menimbang ›</span>';
    grid.parentNode.insertBefore(title,grid);
  }

  function addBottomNav(){
    const home=$('halaman-beranda');
    if(!home || $('clean-bottom-nav')) return;
    const nav=document.createElement('nav');
    nav.id='clean-bottom-nav';
    nav.className='clean-bottom-nav';
    nav.innerHTML=`
      <button class="clean-nav-btn active" type="button" data-action="home"><span class="ico">⌂</span><span>Home</span></button>
      <button class="clean-nav-btn" type="button" data-action="savings"><span class="ico">▤</span><span>Simpanan</span></button>
      <button class="clean-nav-btn scan" type="button" data-action="scan"><span class="ico">⌗</span><span>Scan</span></button>
      <button class="clean-nav-btn" type="button" data-action="profile"><span class="ico">♙</span><span>Profil</span></button>`;
    home.appendChild(nav);

    nav.addEventListener('click',(e)=>{
      const btn=e.target.closest('button[data-action]');
      if(!btn) return;
      const action=btn.dataset.action;
      if(action==='home') home.scrollTo({top:0,behavior:'smooth'});
      if(action==='savings' && typeof window.bukaBukuSampah==='function') window.bukaBukuSampah();
      if(action==='scan'){
        const grid=$('category-grid');
        if(grid){grid.scrollIntoView({behavior:'smooth',block:'center'});grid.animate([{transform:'scale(1)'},{transform:'scale(1.02)'},{transform:'scale(1)'}],{duration:420});}
      }
      if(action==='profile'){
        home.style.display='none';
        const form=$('form-login');
        if(form){form.style.display='block';window.scrollTo({top:0,behavior:'smooth'});}
      }
    });
  }

  function improveHomeCopy(){
    const first=document.querySelector('.rekap-item:first-child .rekap-label');
    if(first) first.textContent='Total terkumpul';
    const second=document.querySelector('.rekap-item:nth-of-type(2) .rekap-label');
    if(second) second.textContent='Terakhir setor';
  }

  function install(){
    injectStyles();
    addHeroArt();
    addSectionTitle();
    addBottomNav();
    improveHomeCopy();
  }

  // Install once. No DOM-wide observer: keep rendering stable and cheap.
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.addEventListener('load',()=>{install();setTimeout(install,80);},{once:true});
})();
