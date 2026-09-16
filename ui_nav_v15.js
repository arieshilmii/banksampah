// Bottom navigation v15 — 3-item organic wave, no Scan button.
(function(){
  'use strict';

  function installStyle(){
    if(document.getElementById('clean-nav-v15-style')) return;
    const style=document.createElement('style');
    style.id='clean-nav-v15-style';
    style.textContent=`
      .clean-bottom-nav{
        position:fixed!important;
        left:50%!important;
        bottom:0!important;
        transform:translateX(-50%)!important;
        width:min(100%,430px)!important;
        height:88px!important;
        padding:18px 34px calc(10px + env(safe-area-inset-bottom))!important;
        background:transparent!important;
        border-radius:0!important;
        box-shadow:none!important;
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        align-items:end!important;
        gap:8px!important;
        overflow:visible!important;
        isolation:isolate!important;
      }

      .clean-nav-wave{
        position:absolute;
        left:0;
        right:0;
        bottom:0;
        width:100%;
        height:108px;
        z-index:0;
        pointer-events:none;
        overflow:visible;
        filter:drop-shadow(0 -8px 22px rgba(12,97,72,.18));
      }

      .clean-nav-btn{
        position:relative!important;
        z-index:2!important;
        min-height:52px!important;
        border:0!important;
        background:transparent!important;
        color:rgba(255,255,255,.78)!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:4px!important;
        font-size:9px!important;
        font-weight:800!important;
        padding:0!important;
        transition:transform .18s ease,color .18s ease!important;
      }
      .clean-nav-btn .ico{font-size:22px!important;line-height:1!important;}
      .clean-nav-btn.active{color:#fff!important;}
      .clean-nav-btn:active{transform:translateY(2px) scale(.97)!important;}
      .clean-nav-btn[data-action="savings"]{transform:translateY(8px)!important;}
      .clean-nav-btn[data-action="savings"]:active{transform:translateY(10px) scale(.97)!important;}
      .clean-nav-btn.scan{display:none!important;}

      @media(min-width:700px){
        .clean-bottom-nav{bottom:16px!important;}
        .clean-nav-wave{border-radius:0 0 28px 28px;}
      }
    `;
    document.head.appendChild(style);
  }

  function reshape(){
    const nav=document.getElementById('clean-bottom-nav');
    if(!nav) return false;
    if(nav.dataset.waveV15==='1') return true;

    nav.dataset.waveV15='1';
    nav.innerHTML=`
      <svg class="clean-nav-wave" viewBox="0 0 430 108" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,34 C0,15 14,0 34,0 H122 C156,0 170,26 215,26 C260,26 274,0 308,0 H396 C416,0 430,15 430,34 V108 H0 Z" fill="#16b98a"/>
      </svg>
      <button class="clean-nav-btn active" type="button" data-action="home"><span class="ico">⌂</span><span>Home</span></button>
      <button class="clean-nav-btn" type="button" data-action="savings"><span class="ico">▤</span><span>Simpanan</span></button>
      <button class="clean-nav-btn" type="button" data-action="profile"><span class="ico">♙</span><span>Profil</span></button>`;
    return true;
  }

  function run(){
    installStyle();
    if(reshape()) return;
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(reshape() || tries>30) clearInterval(timer);
    },100);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
  window.addEventListener('load',()=>setTimeout(run,0),{once:true});
})();
