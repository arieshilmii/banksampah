// Consolidated shell v25: single bottom navigation + admin entry point.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);

  function installStyle(){
    let s=$('ui-shell-v25-style');
    if(!s){s=document.createElement('style');s.id='ui-shell-v25-style';document.head.appendChild(s);}
    s.textContent=`
      #halaman-beranda{padding-bottom:calc(86px + env(safe-area-inset-bottom))!important}
      #clean-bottom-nav.shell-v25{
        position:fixed!important;left:50%!important;bottom:0!important;transform:translateX(-50%)!important;
        width:min(100%,430px)!important;height:70px!important;min-height:70px!important;
        padding:0 38px calc(5px + env(safe-area-inset-bottom))!important;
        background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;
        display:grid!important;grid-template-columns:1fr 1fr!important;align-items:end!important;gap:30px!important;
        overflow:visible!important;z-index:19000!important;
      }
      #clean-bottom-nav.shell-v25 .shell-wave{
        position:absolute!important;left:0!important;bottom:0!important;width:100%!important;height:70px!important;z-index:0!important;
        pointer-events:none!important;filter:drop-shadow(0 -8px 18px rgba(10,105,78,.16))!important;
      }
      #clean-bottom-nav.shell-v25 .clean-nav-btn{
        position:relative!important;z-index:2!important;height:58px!important;min-height:58px!important;padding:0!important;margin:0!important;
        border:0!important;background:transparent!important;display:flex!important;flex-direction:column!important;align-items:center!important;
        justify-content:flex-end!important;gap:3px!important;color:rgba(255,255,255,.74)!important;font-size:9px!important;font-weight:850!important;
        transform:none!important;transition:transform .18s ease,color .18s ease!important;
      }
      #clean-bottom-nav.shell-v25 .nav-orb{
        width:40px!important;height:40px!important;border-radius:15px!important;display:flex!important;align-items:center!important;justify-content:center!important;
        border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.07)!important;transition:all .18s ease!important;
      }
      #clean-bottom-nav.shell-v25 .ico{font-size:19px!important;line-height:1!important;width:auto!important;height:auto!important;background:none!important;border:0!important;box-shadow:none!important;color:inherit!important}
      #clean-bottom-nav.shell-v25 .nav-label{font-size:8.5px!important;line-height:1!important;white-space:nowrap!important;color:inherit!important;margin:0!important}
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active{transform:translateY(-10px)!important;color:#087458!important}
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active .nav-orb{width:48px!important;height:48px!important;background:#fff!important;border-color:#fff!important;border-radius:17px!important;box-shadow:0 10px 22px rgba(4,91,66,.24)!important}
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active .nav-label{color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.13)!important}
      #clean-bottom-nav.shell-v25::before,#clean-bottom-nav.shell-v25::after,#clean-bottom-nav.shell-v25 .clean-nav-wave,#clean-bottom-nav.shell-v25 .clean-nav-wave-v16{display:none!important;content:none!important}
      #admin-recycle-hit-v25{position:absolute!important;right:0!important;top:0!important;width:46px!important;height:46px!important;border:0!important;background:transparent!important;z-index:9!important;cursor:pointer!important;padding:0!important}
      @media(min-width:700px){#clean-bottom-nav.shell-v25{bottom:14px!important}}
    `;
  }

  function closePortalPages(){
    const book=$('portal-book-page'); if(book) book.style.display='none';
    const admin=$('portal-admin-page'); if(admin) admin.style.display='none';
  }

  function buildNav(){
    const home=$('halaman-beranda'); if(!home) return;
    document.querySelectorAll('.clean-bottom-nav').forEach(el=>el.remove());
    const nav=document.createElement('nav');
    nav.id='clean-bottom-nav';nav.className='clean-bottom-nav shell-v25';nav.setAttribute('aria-label','Navigasi utama');
    nav.innerHTML=`
      <svg class="shell-wave" viewBox="0 0 430 70" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 23C0 9 13 0 32 0h78c41 0 58 21 105 21S281 0 322 0h76c19 0 32 9 32 23v47H0V23Z" fill="#16b98a"/>
      </svg>
      <button type="button" class="clean-nav-btn active" data-action="home"><span class="nav-orb"><span class="ico">⌂</span></span><span class="nav-label">Beranda</span></button>
      <button type="button" class="clean-nav-btn" data-action="savings"><span class="nav-orb"><span class="ico">▤</span></span><span class="nav-label">Buku Tabungan</span></button>`;
    document.body.appendChild(nav);
    const homeBtn=nav.querySelector('[data-action="home"]');
    const savingsBtn=nav.querySelector('[data-action="savings"]');
    const setActive=which=>{homeBtn.classList.toggle('active',which==='home');savingsBtn.classList.toggle('active',which==='savings');};
    homeBtn.onclick=()=>{setActive('home');closePortalPages();home.style.display='block';window.scrollTo({top:0,behavior:'smooth'});};
    savingsBtn.onclick=()=>{setActive('savings');if(typeof window.bukaBukuSampah==='function')window.bukaBukuSampah();};
  }

  function installAdminEntry(){
    const profile=$('halaman-beranda')?.querySelector('.profile-section');
    if(!profile) return;
    profile.style.position='relative';
    let btn=$('admin-recycle-hit-v25');
    if(!btn){
      btn=document.createElement('button');btn.id='admin-recycle-hit-v25';btn.type='button';btn.setAttribute('aria-label','Login Admin');btn.title='Login Admin';
      profile.appendChild(btn);
    }
    btn.onclick=()=>{if(typeof window.bukaAdminBankSampah==='function')window.bukaAdminBankSampah();};
    const oldBook=$('btn-savings-book');if(oldBook)oldBook.remove();
  }

  function install(){installStyle();buildNav();installAdminEntry();}
  function run(){setTimeout(install,80);setTimeout(install,650);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',()=>setTimeout(install,80),{once:true});
})();
