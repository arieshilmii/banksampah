// Consolidated shell v25: single bottom navigation, admin entry and mobile book layout.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);

  function installStyle(){
    let s=$('ui-shell-v25-style');
    if(!s){s=document.createElement('style');s.id='ui-shell-v25-style';document.head.appendChild(s);}
    s.textContent=`
      #halaman-beranda{padding-bottom:calc(76px + env(safe-area-inset-bottom))!important}
      #clean-bottom-nav.shell-v25{
        position:fixed!important;left:50%!important;bottom:0!important;transform:translateX(-50%)!important;
        width:min(100%,430px)!important;height:62px!important;min-height:62px!important;
        padding:8px 34px calc(5px + env(safe-area-inset-bottom))!important;
        background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;
        display:grid!important;grid-template-columns:1fr 1fr!important;align-items:center!important;gap:42px!important;
        overflow:visible!important;z-index:19000!important;
      }
      #clean-bottom-nav.shell-v25 .shell-wave{
        position:absolute!important;left:0!important;bottom:0!important;width:100%!important;height:62px!important;z-index:0!important;
        pointer-events:none!important;filter:drop-shadow(0 -6px 16px rgba(10,105,78,.14))!important;
      }
      #clean-bottom-nav.shell-v25 .clean-nav-btn{
        position:relative!important;z-index:2!important;height:48px!important;min-height:48px!important;padding:0!important;margin:0!important;
        border:0!important;background:transparent!important;display:flex!important;flex-direction:column!important;align-items:center!important;
        justify-content:center!important;gap:3px!important;color:rgba(255,255,255,.74)!important;font-size:9px!important;font-weight:850!important;
        transform:none!important;transition:color .18s ease!important;
      }
      #clean-bottom-nav.shell-v25 .nav-orb{
        width:36px!important;height:34px!important;border-radius:13px!important;display:flex!important;align-items:center!important;justify-content:center!important;
        border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.07)!important;
        box-shadow:none!important;transition:background .18s ease,border-color .18s ease,box-shadow .18s ease,width .18s ease!important;
      }
      #clean-bottom-nav.shell-v25 .ico{
        font-size:18px!important;line-height:1!important;width:auto!important;height:auto!important;background:none!important;border:0!important;
        box-shadow:none!important;color:inherit!important;
      }
      #clean-bottom-nav.shell-v25 .nav-label{
        font-size:8.5px!important;line-height:1!important;white-space:nowrap!important;color:inherit!important;margin:0!important;
      }
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active{color:#087458!important;transform:none!important}
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active .nav-orb{
        width:40px!important;height:36px!important;background:#fff!important;border-color:#fff!important;border-radius:14px!important;
        box-shadow:0 7px 16px rgba(4,91,66,.20)!important;
      }
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active .nav-label{
        color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.12)!important;
      }
      #clean-bottom-nav.shell-v25::before,#clean-bottom-nav.shell-v25::after,
      #clean-bottom-nav.shell-v25 .clean-nav-wave,#clean-bottom-nav.shell-v25 .clean-nav-wave-v16{
        display:none!important;content:none!important;
      }
      #admin-recycle-hit-v25{
        position:absolute!important;right:0!important;top:0!important;width:46px!important;height:46px!important;border:0!important;
        background:transparent!important;z-index:9!important;cursor:pointer!important;padding:0!important;
      }
      /* Buku Tabungan only: all four columns fit on one mobile viewport. Admin table is untouched. */
      #portal-book-page{box-sizing:border-box!important;width:100%!important;max-width:100vw!important;overflow-x:hidden!important;padding-left:12px!important;padding-right:12px!important}
      #portal-book-page .portal-wrap{width:100%!important;max-width:430px!important;min-width:0!important}
      #portal-book-page .portal-table-wrap{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important}
      #portal-book-page .portal-table{width:100%!important;min-width:0!important;max-width:100%!important;table-layout:fixed!important}
      #portal-book-page .portal-table th,#portal-book-page .portal-table td{
        box-sizing:border-box!important;min-width:0!important;padding:11px 5px!important;
        white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;vertical-align:top!important;
        font-size:10px!important;line-height:1.35!important;
      }
      #portal-book-page .portal-table th{font-size:9px!important;line-height:1.2!important}
      #portal-book-page .portal-table th:nth-child(1),#portal-book-page .portal-table td:nth-child(1){width:23%!important}
      #portal-book-page .portal-table th:nth-child(2),#portal-book-page .portal-table td:nth-child(2){width:34%!important}
      #portal-book-page .portal-table th:nth-child(3),#portal-book-page .portal-table td:nth-child(3){width:17%!important}
      #portal-book-page .portal-table th:nth-child(4),#portal-book-page .portal-table td:nth-child(4){width:26%!important}
      #portal-book-page .portal-table td:nth-child(3),#portal-book-page .portal-table td:nth-child(4){font-variant-numeric:tabular-nums!important}
      @media(max-width:360px){
        #portal-book-page{padding-left:8px!important;padding-right:8px!important}
        #portal-book-page .portal-table th,#portal-book-page .portal-table td{padding:9px 3px!important;font-size:9px!important}
        #portal-book-page .portal-table th{font-size:8px!important}
      }
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
      <svg class="shell-wave" viewBox="0 0 430 62" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 19C0 8 13 2 30 2H132C164 2 181 13 215 13S266 2 298 2H400C417 2 430 8 430 19V62H0V19Z" fill="#16b98a"/>
      </svg>
      <button type="button" class="clean-nav-btn active" data-action="home"><span class="nav-orb"><span class="ico">⌂</span></span><span class="nav-label">Beranda</span></button>
      <button type="button" class="clean-nav-btn" data-action="savings"><span class="nav-orb"><span class="ico">▤</span></span><span class="nav-label">Buku Tabungan</span></button>`;
    document.body.appendChild(nav);

    const homeBtn=nav.querySelector('[data-action="home"]');
    const savingsBtn=nav.querySelector('[data-action="savings"]');
    const setActive=which=>{
      homeBtn.classList.toggle('active',which==='home');
      savingsBtn.classList.toggle('active',which==='savings');
    };

    homeBtn.onclick=()=>{
      setActive('home');closePortalPages();home.style.display='block';window.scrollTo({top:0,behavior:'smooth'});
    };
    savingsBtn.onclick=()=>{
      setActive('savings');if(typeof window.bukaBukuSampah==='function')window.bukaBukuSampah();
    };
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
