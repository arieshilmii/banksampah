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
      #halaman-beranda{padding-bottom:calc(74px + env(safe-area-inset-bottom))!important;}
      .final-nav-v24{
        position:fixed!important;
        left:50%!important;
        right:auto!important;
        bottom:0!important;
        transform:translateX(-50%)!important;
        z-index:19000!important;
        width:min(100%,430px)!important;
        height:58px!important;
        min-height:58px!important;
        padding:5px 18px calc(5px + env(safe-area-inset-bottom))!important;
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        align-items:center!important;
        gap:8px!important;
        background:#16b98a!important;
        background-image:none!important;
        border:0!important;
        border-radius:22px 22px 0 0!important;
        box-shadow:0 -8px 24px rgba(10,105,78,.18)!important;
        overflow:visible!important;
      }
      .final-nav-v24::before,.final-nav-v24::after,
      .final-nav-v24 .clean-nav-wave,.final-nav-v24 .clean-nav-wave-v16{display:none!important;content:none!important;}
      .final-nav-v24 .clean-nav-btn{
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:44px!important;
        height:44px!important;
        padding:2px 4px!important;
        margin:0!important;
        transform:none!important;
        align-self:center!important;
        gap:3px!important;
        border:0!important;
        background:transparent!important;
        color:rgba(255,255,255,.78)!important;
        opacity:1!important;
        font-weight:800!important;
      }
      .final-nav-v24 .clean-nav-btn.active{color:#fff!important;}
      .final-nav-v24 .clean-nav-btn.active .ico{
        background:rgba(255,255,255,.16)!important;
        border-radius:10px!important;
      }
      .final-nav-v24 .clean-nav-btn .ico{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        font-size:18px!important;
        line-height:1!important;
        width:28px!important;
        height:24px!important;
        border:0!important;
        box-shadow:none!important;
        color:inherit!important;
      }
      .final-nav-v24 .clean-nav-btn span:last-child{
        font-size:9px!important;
        line-height:1!important;
        margin:0!important;
        color:inherit!important;
        opacity:1!important;
      }
      @media(min-width:700px){
        .final-nav-v24{bottom:14px!important;border-radius:22px!important;}
      }
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
