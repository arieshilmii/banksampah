// Bottom navigation v16 compatibility layer — organic 2-item nav.
(function(){
  'use strict';

  function build(){
    const home=document.getElementById('halaman-beranda');
    if(!home) return;

    document.querySelectorAll('.clean-bottom-nav').forEach(el=>el.remove());

    const nav=document.createElement('nav');
    nav.id='clean-bottom-nav';
    nav.className='clean-bottom-nav final-nav-v16 organic-nav-v25';
    nav.setAttribute('aria-label','Navigasi utama');
    nav.innerHTML=`
      <svg class="organic-nav-shape" viewBox="0 0 430 72" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,23 C0,10 13,2 31,2 H112 C147,2 168,18 215,18 C262,18 283,2 318,2 H399 C417,2 430,10 430,23 V72 H0 Z" fill="#16b98a"/>
      </svg>
      <button type="button" class="clean-nav-btn active" data-action="home">
        <span class="nav-orb"><span class="ico">⌂</span></span>
        <span class="nav-label">Beranda</span>
      </button>
      <button type="button" class="clean-nav-btn" data-action="savings">
        <span class="nav-orb"><span class="ico">▤</span></span>
        <span class="nav-label">Buku Tabungan</span>
      </button>`;
    document.body.appendChild(nav);

    let style=document.getElementById('clean-nav-v16-style');
    if(!style){style=document.createElement('style');style.id='clean-nav-v16-style';document.head.appendChild(style);}
    style.textContent=`
      #halaman-beranda{padding-bottom:calc(78px + env(safe-area-inset-bottom))!important}
      #clean-bottom-nav.organic-nav-v25{
        position:fixed!important;left:50%!important;right:auto!important;bottom:0!important;transform:translateX(-50%)!important;
        width:min(100%,430px)!important;height:64px!important;min-height:64px!important;
        padding:0 34px calc(5px + env(safe-area-inset-bottom))!important;
        background:transparent!important;background-image:none!important;border:0!important;border-radius:0!important;
        box-shadow:none!important;display:grid!important;grid-template-columns:1fr 1fr!important;align-items:end!important;gap:24px!important;
        overflow:visible!important;z-index:19000!important;
      }
      #clean-bottom-nav.organic-nav-v25 .organic-nav-shape{
        position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:64px!important;
        z-index:0!important;pointer-events:none!important;filter:drop-shadow(0 -7px 18px rgba(10,105,78,.16))!important;
      }
      #clean-bottom-nav.organic-nav-v25 .clean-nav-btn{
        position:relative!important;z-index:2!important;height:54px!important;min-height:54px!important;
        padding:0!important;margin:0!important;border:0!important;background:transparent!important;
        color:rgba(255,255,255,.72)!important;opacity:1!important;display:flex!important;flex-direction:column!important;
        align-items:center!important;justify-content:flex-end!important;gap:2px!important;font-size:9px!important;font-weight:800!important;
        transform:translateY(0)!important;align-self:end!important;transition:transform .18s ease,color .18s ease!important;
      }
      #clean-bottom-nav.organic-nav-v25 .clean-nav-btn .nav-orb{
        width:38px!important;height:38px!important;border-radius:15px!important;display:flex!important;align-items:center!important;justify-content:center!important;
        background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.10)!important;
        box-shadow:none!important;transition:all .18s ease!important;
      }
      #clean-bottom-nav.organic-nav-v25 .clean-nav-btn .ico{
        width:auto!important;height:auto!important;display:block!important;font-size:18px!important;line-height:1!important;color:inherit!important;
        background:none!important;border:0!important;box-shadow:none!important;
      }
      #clean-bottom-nav.organic-nav-v25 .clean-nav-btn .nav-label{
        font-size:8.5px!important;line-height:1!important;color:inherit!important;margin:0!important;opacity:1!important;white-space:nowrap!important;
      }
      #clean-bottom-nav.organic-nav-v25 .clean-nav-btn.active{
        color:#087458!important;transform:translateY(-8px)!important;
      }
      #clean-bottom-nav.organic-nav-v25 .clean-nav-btn.active .nav-orb{
        width:44px!important;height:44px!important;border-radius:16px!important;background:#ffffff!important;border-color:#ffffff!important;
        box-shadow:0 9px 22px rgba(4,91,66,.24)!important;
      }
      #clean-bottom-nav.organic-nav-v25 .clean-nav-btn.active .nav-label{
        color:#ffffff!important;text-shadow:0 1px 2px rgba(0,0,0,.12)!important;
      }
      #clean-bottom-nav.organic-nav-v25::before,#clean-bottom-nav.organic-nav-v25::after,
      #clean-bottom-nav.organic-nav-v25 .clean-nav-wave,#clean-bottom-nav.organic-nav-v25 .clean-nav-wave-v16{display:none!important;content:none!important}
      @media(min-width:700px){
        #clean-bottom-nav.organic-nav-v25{bottom:14px!important}
        #clean-bottom-nav.organic-nav-v25 .organic-nav-shape{border-radius:0 0 24px 24px}
      }
    `;

    const homeBtn=nav.querySelector('[data-action="home"]');
    const savingsBtn=nav.querySelector('[data-action="savings"]');
    const setActive=(which)=>{
      homeBtn.classList.toggle('active',which==='home');
      savingsBtn.classList.toggle('active',which==='savings');
    };

    homeBtn.onclick=()=>{
      setActive('home');
      const book=document.getElementById('portal-book-page');
      const admin=document.getElementById('portal-admin-page');
      if(book) book.style.display='none';
      if(admin) admin.style.display='none';
      home.style.display='block';
      window.scrollTo({top:0,behavior:'smooth'});
    };
    savingsBtn.onclick=()=>{
      setActive('savings');
      if(typeof window.bukaBukuSampah==='function') window.bukaBukuSampah();
    };

    document.querySelectorAll('[data-action="profile"],[data-action="scan"]').forEach(el=>el.remove());
  }

  function run(){setTimeout(build,60);setTimeout(build,450);setTimeout(build,1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',run,{once:true});
})();
