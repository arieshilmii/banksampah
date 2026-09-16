// Bottom navigation v16 compatibility layer — final 2-item nav.
(function(){
  'use strict';

  function build(){
    const home=document.getElementById('halaman-beranda');
    if(!home) return;

    document.querySelectorAll('.clean-bottom-nav').forEach(el=>el.remove());

    const nav=document.createElement('nav');
    nav.id='clean-bottom-nav';
    nav.className='clean-bottom-nav final-nav-v16';
    nav.setAttribute('aria-label','Navigasi utama');
    nav.innerHTML=`
      <button type="button" class="clean-nav-btn active" data-action="home">
        <span class="ico">⌂</span><span>Beranda</span>
      </button>
      <button type="button" class="clean-nav-btn" data-action="savings">
        <span class="ico">▤</span><span>Buku Tabungan</span>
      </button>`;
    document.body.appendChild(nav);

    let style=document.getElementById('clean-nav-v16-style');
    if(!style){style=document.createElement('style');style.id='clean-nav-v16-style';document.head.appendChild(style);}
    style.textContent=`
      #halaman-beranda{padding-bottom:calc(76px + env(safe-area-inset-bottom))!important}
      #clean-bottom-nav.final-nav-v16{
        position:fixed!important;left:50%!important;right:auto!important;bottom:0!important;transform:translateX(-50%)!important;
        width:min(100%,430px)!important;height:58px!important;min-height:58px!important;
        padding:5px 18px calc(5px + env(safe-area-inset-bottom))!important;
        background:#16b98a!important;background-image:none!important;border:0!important;border-radius:22px 22px 0 0!important;
        box-shadow:0 -8px 24px rgba(10,105,78,.18)!important;
        display:grid!important;grid-template-columns:1fr 1fr!important;align-items:center!important;gap:8px!important;
        overflow:visible!important;z-index:19000!important;
      }
      #clean-bottom-nav.final-nav-v16::before,#clean-bottom-nav.final-nav-v16::after,
      #clean-bottom-nav.final-nav-v16 .clean-nav-wave,#clean-bottom-nav.final-nav-v16 .clean-nav-wave-v16{display:none!important;content:none!important}
      #clean-bottom-nav.final-nav-v16 .clean-nav-btn{
        position:relative!important;z-index:2!important;height:44px!important;min-height:44px!important;
        padding:2px 4px!important;margin:0!important;border:0!important;background:transparent!important;
        color:rgba(255,255,255,.80)!important;opacity:1!important;display:flex!important;flex-direction:column!important;
        align-items:center!important;justify-content:center!important;gap:3px!important;font-size:9px!important;font-weight:800!important;
        transform:none!important;align-self:center!important;
      }
      #clean-bottom-nav.final-nav-v16 .clean-nav-btn.active{color:#fff!important}
      #clean-bottom-nav.final-nav-v16 .clean-nav-btn.active .ico{background:rgba(255,255,255,.16)!important;border-radius:10px!important}
      #clean-bottom-nav.final-nav-v16 .clean-nav-btn .ico{
        width:28px!important;height:24px!important;display:flex!important;align-items:center!important;justify-content:center!important;
        font-size:18px!important;line-height:1!important;color:inherit!important;background:transparent;border:0!important;box-shadow:none!important;
      }
      #clean-bottom-nav.final-nav-v16 .clean-nav-btn span:last-child{font-size:9px!important;line-height:1!important;color:inherit!important;margin:0!important;opacity:1!important}
      @media(min-width:700px){#clean-bottom-nav.final-nav-v16{bottom:14px!important;border-radius:22px!important}}
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
