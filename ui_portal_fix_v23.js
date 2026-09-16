// Portal fix v23: clickable recycle admin entry + remove duplicate home savings card.
(function(){
  'use strict';
  function install(){
    const home=document.getElementById('halaman-beranda');
    const profile=home?.querySelector('.profile-section');
    if(profile && !document.getElementById('admin-recycle-hit-v23')){
      profile.style.position='relative';
      const btn=document.createElement('button');
      btn.id='admin-recycle-hit-v23';
      btn.type='button';
      btn.setAttribute('aria-label','Login Admin');
      btn.title='Login Admin';
      btn.style.cssText='position:absolute;right:0;top:0;width:46px;height:46px;border:0;border-radius:15px;background:transparent;z-index:8;cursor:pointer;padding:0;';
      btn.onclick=()=>{ if(typeof window.bukaAdminBankSampah==='function') window.bukaAdminBankSampah(); };
      profile.appendChild(btn);
    }
    const oldBook=document.getElementById('btn-savings-book');
    if(oldBook) oldBook.style.display='none';
    const nav=document.querySelector('.clean-bottom-nav');
    if(nav){
      const homeBtn=nav.querySelector('[data-action="home"]');
      const savings=nav.querySelector('[data-action="savings"]');
      const scan=nav.querySelector('[data-action="scan"]');
      const profileBtn=nav.querySelector('[data-action="profile"]');
      if(scan) scan.style.display='none';
      if(profileBtn) profileBtn.style.display='none';
      nav.style.gridTemplateColumns='1fr 1fr';
      if(homeBtn) homeBtn.style.display='flex';
      if(savings) savings.style.display='flex';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100),{once:true});
  else setTimeout(install,100);
  window.addEventListener('load',()=>{setTimeout(install,100);setTimeout(install,700)},{once:true});
})();
