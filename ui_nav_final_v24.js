// Final bottom navigation v24: only Beranda and Buku Tabungan.
(function(){
  'use strict';

  function buildFinalNav(){
    const home=document.getElementById('halaman-beranda');
    if(!home) return;

    const old=document.querySelector('.clean-bottom-nav');
    if(old) old.remove();

    const nav=document.createElement('nav');
    nav.className='clean-bottom-nav final-nav-v24';
    nav.setAttribute('aria-label','Navigasi utama');
    nav.innerHTML=`
      <button type="button" class="clean-nav-btn active" data-action="home">
        <span class="ico">⌂</span><span>Beranda</span>
      </button>
      <button type="button" class="clean-nav-btn" data-action="savings">
        <span class="ico">▤</span><span>Buku Tabungan</span>
      </button>`;

    document.body.appendChild(nav);

    const style=document.getElementById('final-nav-v24-style')||document.createElement('style');
    style.id='final-nav-v24-style';
    style.textContent=`
      .final-nav-v24{
        grid-template-columns:1fr 1fr!important;
        height:54px!important;
        min-height:54px!important;
        padding:5px 18px calc(5px + env(safe-area-inset-bottom))!important;
        align-items:center!important;
        gap:8px!important;
      }
      .final-nav-v24 .clean-nav-btn{
        display:flex!important;
        min-height:42px!important;
        height:42px!important;
        padding:2px 4px!important;
        transform:none!important;
        align-self:center!important;
        gap:2px!important;
      }
      .final-nav-v24 .clean-nav-btn .ico{font-size:18px!important;line-height:1!important;width:auto!important;height:auto!important;background:none!important;border:0!important;box-shadow:none!important;}
      .final-nav-v24 .clean-nav-btn span:last-child{font-size:8px!important;margin:0!important;color:inherit!important;}
    `;
    if(!style.parentNode) document.head.appendChild(style);

    const homeBtn=nav.querySelector('[data-action="home"]');
    const savingsBtn=nav.querySelector('[data-action="savings"]');

    function active(which){
      homeBtn.classList.toggle('active',which==='home');
      savingsBtn.classList.toggle('active',which==='savings');
    }

    homeBtn.onclick=()=>{
      active('home');
      const book=document.getElementById('portal-book-page');
      const admin=document.getElementById('portal-admin-page');
      if(book) book.style.display='none';
      if(admin) admin.style.display='none';
      home.style.display='block';
      window.scrollTo({top:0,behavior:'smooth'});
    };

    savingsBtn.onclick=()=>{
      active('savings');
      if(typeof window.bukaBukuSampah==='function') window.bukaBukuSampah();
    };

    // Remove any stale profile/scan controls created by older UI modules.
    document.querySelectorAll('[data-action="profile"],[data-action="scan"]').forEach(el=>el.remove());
  }

  function run(){
    setTimeout(buildFinalNav,120);
    setTimeout(buildFinalNav,700);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',run,{once:true});
})();
