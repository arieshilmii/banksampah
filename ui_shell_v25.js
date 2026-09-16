// App shell: one bottom navigation, accessible subcategory sheet, one browser history router.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const routeKey='bankSampahRoute';
  let currentRoute='home';
  let routerReady=false;
  let restoring=false;
  let openingCamera=false;
  let lastWaste='';
  let lastCategory='';
  const originals={};

  function visible(id){
    const element=$(id);
    return !!element&&getComputedStyle(element).display!=='none';
  }

  function installStyle(){
    let style=$('ui-shell-v25-style');
    if(!style){style=document.createElement('style');style.id='ui-shell-v25-style';document.head.appendChild(style);}
    style.textContent=`
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
      #clean-bottom-nav.shell-v25 .ico{font-size:18px!important;line-height:1!important;width:auto!important;height:auto!important;background:none!important;border:0!important;box-shadow:none!important;color:inherit!important}
      #clean-bottom-nav.shell-v25 .nav-label{font-size:8.5px!important;line-height:1!important;white-space:nowrap!important;color:inherit!important;margin:0!important}
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active{color:#087458!important;transform:none!important}
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active .nav-orb{width:40px!important;height:36px!important;background:#fff!important;border-color:#fff!important;border-radius:14px!important;box-shadow:0 7px 16px rgba(4,91,66,.20)!important}
      #clean-bottom-nav.shell-v25 .clean-nav-btn.active .nav-label{color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.12)!important}
      #clean-bottom-nav.shell-v25::before,#clean-bottom-nav.shell-v25::after,#clean-bottom-nav.shell-v25 .clean-nav-wave,#clean-bottom-nav.shell-v25 .clean-nav-wave-v16{display:none!important;content:none!important}
      #admin-recycle-hit-v25{position:absolute!important;right:0!important;top:0!important;width:46px!important;height:46px!important;border:0!important;background:transparent!important;z-index:9!important;cursor:pointer!important;padding:0!important}

      /* The category sheet is ABOVE navigation, centered, and independently scrollable. */
      #modal-subkategori{
        position:fixed!important;inset:0!important;z-index:20500!important;
        display:none;align-items:center!important;justify-content:center!important;
        padding:max(12px,env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom))!important;
        overflow:hidden!important;background:rgba(10,40,30,.52)!important;
      }
      #modal-subkategori .modal-content{
        box-sizing:border-box!important;display:flex!important;flex-direction:column!important;
        width:100%!important;max-width:430px!important;max-height:calc(100dvh - 42px - env(safe-area-inset-bottom))!important;
        min-height:0!important;padding:18px!important;margin:0!important;
        border-radius:24px!important;overflow:hidden!important;background:#f5fcf9!important;
      }
      #modal-subkategori .modal-header{flex:0 0 auto!important;margin-bottom:12px!important}
      #modal-subkategori .subcat-grid{
        flex:1 1 auto!important;min-height:0!important;min-width:0!important;max-height:100%!important;
        overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;
        display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
        align-content:start!important;gap:10px!important;padding:2px 2px 10px!important;
        -webkit-overflow-scrolling:touch!important;
      }
      #modal-subkategori .subcat-card{min-width:0!important}
      /* Camera and its manual dialog must also cover the fixed nav. */
      #camera-ui{z-index:21000!important}
      #manual-weight-modal{z-index:24000!important}
      #portal-admin-login{z-index:26000!important}

      /* Buku Tabungan: four columns fit inside a mobile screen. Admin table is unchanged. */
      #portal-book-page{box-sizing:border-box!important;width:100%!important;max-width:100vw!important;overflow-x:hidden!important;padding-left:12px!important;padding-right:12px!important}
      #portal-book-page .portal-wrap{width:100%!important;max-width:430px!important;min-width:0!important}
      #portal-book-page .portal-table-wrap{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important}
      #portal-book-page .portal-table{width:100%!important;min-width:0!important;max-width:100%!important;table-layout:fixed!important}
      #portal-book-page .portal-table th,#portal-book-page .portal-table td{box-sizing:border-box!important;min-width:0!important;padding:11px 5px!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;vertical-align:top!important;font-size:10px!important;line-height:1.35!important}
      #portal-book-page .portal-table th{font-size:9px!important;line-height:1.2!important}
      #portal-book-page .portal-table th:nth-child(1),#portal-book-page .portal-table td:nth-child(1){width:23%!important}
      #portal-book-page .portal-table th:nth-child(2),#portal-book-page .portal-table td:nth-child(2){width:34%!important}
      #portal-book-page .portal-table th:nth-child(3),#portal-book-page .portal-table td:nth-child(3){width:17%!important}
      #portal-book-page .portal-table th:nth-child(4),#portal-book-page .portal-table td:nth-child(4){width:26%!important}
      #portal-book-page .portal-table td:nth-child(3),#portal-book-page .portal-table td:nth-child(4){font-variant-numeric:tabular-nums!important}
      @media(max-width:360px){#portal-book-page{padding-left:8px!important;padding-right:8px!important}#portal-book-page .portal-table th,#portal-book-page .portal-table td{padding:9px 3px!important;font-size:9px!important}#portal-book-page .portal-table th{font-size:8px!important}}
      @media(min-width:700px){#clean-bottom-nav.shell-v25{bottom:14px!important}}
    `;
  }

  function markNav(){
    const nav=$('clean-bottom-nav');if(!nav)return;
    nav.querySelector('[data-action="home"]')?.classList.toggle('active',currentRoute!=='book');
    nav.querySelector('[data-action="savings"]')?.classList.toggle('active',currentRoute==='book');
  }
  function pushRoute(route){
    if(restoring||currentRoute===route)return;
    try{history.pushState({...history.state,[routeKey]:route},'',location.href);}catch(error){console.warn('Route history:',error)}
    currentRoute=route;markNav();
  }
  function showHome(){
    for(const id of ['portal-book-page','portal-admin-page','portal-admin-login','modal-subkategori']){
      const el=$(id);if(el)el.style.display='none';
    }
    const manual=$('manual-weight-modal');manual?.classList.remove('show');
    if(visible('camera-ui'))originals.closeCamera?.();
    if($('halaman-beranda'))$('halaman-beranda').style.display='block';
  }
  function renderRoute(route){
    restoring=true;
    const wasCamera=visible('camera-ui');
    const manual=$('manual-weight-modal');
    if(route!=='manual')manual?.classList.remove('show');
    if(route!=='camera'&&route!=='manual'&&wasCamera)originals.closeCamera?.();
    ['portal-book-page','portal-admin-page','portal-admin-login','modal-subkategori'].forEach(id=>{const el=$(id);if(el)el.style.display='none'});
    if(route==='modal'&&$('modal-subkategori'))$('modal-subkategori').style.display='flex';
    else if(route==='book'&&typeof originals.book==='function')originals.book();
    else if(route==='admin'&&$('portal-admin-page'))$('portal-admin-page').style.display='block';
    else if(route==='admin-login'&&typeof originals.admin==='function')originals.admin();
    else if(route==='camera'&&!wasCamera&&lastWaste&&typeof originals.startCamera==='function')originals.startCamera(lastWaste);
    else if(route==='manual'){
      if(!visible('camera-ui')&&lastWaste&&typeof originals.startCamera==='function')originals.startCamera(lastWaste);
      if(typeof originals.manual==='function')originals.manual();
    }
    currentRoute=route;markNav();restoring=false;
  }
  function goBack(){
    if(currentRoute==='home')return;
    try{history.back();}catch(_){history.replaceState({...history.state,[routeKey]:'home'},'',location.href);renderRoute('home')}
  }

  function wrapGlobal(name,key,after){
    const fn=window[name];if(typeof fn!=='function'||fn.__appShellRoute)return;
    originals[key]=fn;
    const wrapped=function(){return after(fn,this,arguments)};
    wrapped.__appShellRoute=true;
    window[name]=wrapped;
  }
  function wrapRoutes(){
    wrapGlobal('bukaModal','openModal',(fn,ctx,args)=>{
      const result=fn.apply(ctx,args);
      lastCategory=args[0]||lastCategory;
      if(visible('modal-subkategori'))pushRoute('modal');
      return result;
    });
    wrapGlobal('tutupModalPaksa','closeModal',(fn,ctx,args)=>{
      const result=fn.apply(ctx,args);
      if(!restoring&&!openingCamera&&currentRoute==='modal')goBack();
      return result;
    });
    wrapGlobal('mulaiKamera','startCamera',(fn,ctx,args)=>{
      lastWaste=args[0]||lastWaste;
      openingCamera=true;
      let result;
      try{result=fn.apply(ctx,args);}finally{openingCamera=false}
      if(visible('camera-ui'))pushRoute('camera');
      return result;
    });
    wrapGlobal('tutupKamera','closeCamera',(fn,ctx,args)=>{
      const result=fn.apply(ctx,args);
      if(!restoring&&!openingCamera&&currentRoute==='camera')goBack();
      return result;
    });
    wrapGlobal('inputManual','manual',(fn,ctx,args)=>{
      const result=fn.apply(ctx,args);
      if($('manual-weight-modal')?.classList.contains('show'))pushRoute('manual');
      return result;
    });
    wrapGlobal('bukaBukuSampah','book',(fn,ctx,args)=>{
      const result=fn.apply(ctx,args);
      if(visible('portal-book-page'))pushRoute('book');
      return result;
    });
    wrapGlobal('bukaAdminBankSampah','admin',(fn,ctx,args)=>{
      const result=fn.apply(ctx,args);
      if(visible('portal-admin-login'))pushRoute('admin-login');
      else if(visible('portal-admin-page'))pushRoute('admin');
      return result;
    });
  }

  function handleClicksCapture(event){
    const target=event.target;
    if(!(target instanceof Element))return;
    const manualClose=target.closest('#manual-weight-modal .manual-cancel,#manual-weight-modal .manual-backdrop');
    const bookBack=target.closest('#portal-book-page .portal-back');
    const adminBack=target.closest('#portal-admin-page .portal-back,#portal-admin-page #admin-logout');
    const adminCancel=target.closest('#portal-admin-login .admin-cancel');
    if((currentRoute==='manual'&&manualClose)||(currentRoute==='book'&&bookBack)||(currentRoute==='admin'&&adminBack)||(currentRoute==='admin-login'&&adminCancel)){
      if(adminBack&&target.closest('#admin-logout'))localStorage.removeItem('bank_admin_session_v22');
      event.preventDefault();event.stopImmediatePropagation();goBack();
    }
  }
  function handleClicksBubble(event){
    const target=event.target;
    if(!(target instanceof Element))return;
    if(target.closest('#manual-weight-modal .manual-save')){
      setTimeout(()=>{if(currentRoute==='manual'&&!$('manual-weight-modal')?.classList.contains('show'))goBack()},0);
    }
    if(target.closest('#portal-admin-login .admin-submit')){
      setTimeout(()=>{
        if(currentRoute==='admin-login'&&visible('portal-admin-page')&&!visible('portal-admin-login')){
          try{history.replaceState({...history.state,[routeKey]:'admin'},'',location.href)}catch(_){}
          currentRoute='admin';markNav();
        }
      },0);
    }
  }
  function setUpRouter(){
    if(routerReady)return;
    routerReady=true;
    try{history.replaceState({...history.state,[routeKey]:'home'},'',location.href)}catch(_){}
    window.addEventListener('popstate',event=>{
      const target=event.state?.[routeKey]||'home';
      renderRoute(['home','modal','camera','manual','book','admin','admin-login'].includes(target)?target:'home');
    });
    document.addEventListener('click',handleClicksCapture,true);
    document.addEventListener('click',handleClicksBubble);
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&currentRoute!=='home'){event.preventDefault();goBack()}
      if(event.key==='Enter'&&event.target?.id==='manual-weight-input'){
        setTimeout(()=>{if(currentRoute==='manual'&&!$('manual-weight-modal')?.classList.contains('show'))goBack()},0);
      }
    },true);
  }

  function mountNav(){
    const home=$('halaman-beranda');if(!home)return;
    let nav=$('clean-bottom-nav');
    if(!nav||!nav.classList.contains('shell-v25')){
      document.querySelectorAll('.clean-bottom-nav').forEach(node=>node.remove());
      nav=document.createElement('nav');nav.id='clean-bottom-nav';nav.className='clean-bottom-nav shell-v25';nav.setAttribute('aria-label','Navigasi utama');document.body.appendChild(nav);
    }
    if(!nav.querySelector('.nav-orb')||nav.querySelectorAll('.clean-nav-btn').length!==2){
      nav.innerHTML=`
        <svg class="shell-wave" viewBox="0 0 430 62" preserveAspectRatio="none" aria-hidden="true"><path d="M0 19C0 8 13 2 30 2H132C164 2 181 13 215 13S266 2 298 2H400C417 2 430 8 430 19V62H0V19Z" fill="#16b98a"/></svg>
        <button type="button" class="clean-nav-btn" data-action="home"><span class="nav-orb"><span class="ico">⌂</span></span><span class="nav-label">Beranda</span></button>
        <button type="button" class="clean-nav-btn" data-action="savings"><span class="nav-orb"><span class="ico">▤</span></span><span class="nav-label">Buku Tabungan</span></button>`;
    }
    nav.querySelector('[data-action="home"]').onclick=()=>{
      if(currentRoute==='book'||currentRoute==='admin')goBack();
      else if(currentRoute==='home'){window.scrollTo({top:0,behavior:'smooth'})}
      else{showHome();try{history.replaceState({...history.state,[routeKey]:'home'},'',location.href)}catch(_){}currentRoute='home';markNav()}
    };
    nav.querySelector('[data-action="savings"]').onclick=()=>{
      if(currentRoute!=='book'&&typeof window.bukaBukuSampah==='function')window.bukaBukuSampah();
    };
    markNav();
  }
  function installAdminEntry(){
    const profile=$('halaman-beranda')?.querySelector('.profile-section');if(!profile)return;
    profile.style.position='relative';
    let button=$('admin-recycle-hit-v25');
    if(!button){button=document.createElement('button');button.id='admin-recycle-hit-v25';button.type='button';button.setAttribute('aria-label','Login Admin');button.title='Login Admin';profile.appendChild(button)}
    button.onclick=()=>{if(typeof window.bukaAdminBankSampah==='function')window.bukaAdminBankSampah()};
    $('btn-savings-book')?.remove();
  }
  function install(){installStyle();setUpRouter();wrapRoutes();mountNav();installAdminEntry();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>{
    // Base camera/book modules replace globals on load. Wrap their final functions once.
    setTimeout(()=>{wrapRoutes();mountNav();installAdminEntry()},100);
    // Older portal UI adjusts nav labels after load; restore one canonical shell afterward.
    setTimeout(mountNav,720);
  },{once:true});
})();
