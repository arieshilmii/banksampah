// Bottom navigation v16 — force compact 3-item organic wave.
(function(){
  'use strict';

  function apply(){
    const nav=document.getElementById('clean-bottom-nav');
    if(!nav) return false;

    nav.innerHTML=`
      <svg class="clean-nav-wave-v16" viewBox="0 0 430 50" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,15 C0,6 12,0 28,0 H132 C163,0 181,13 215,13 C249,13 267,0 298,0 H402 C418,0 430,6 430,15 V50 H0 Z" fill="#16b98a"/>
      </svg>
      <button class="clean-nav-btn active" type="button" data-action="home"><span class="ico">⌂</span><span>Home</span></button>
      <button class="clean-nav-btn" type="button" data-action="savings"><span class="ico">▤</span><span>Simpanan</span></button>
      <button class="clean-nav-btn" type="button" data-action="profile"><span class="ico">♙</span><span>Profil</span></button>`;

    const style=document.createElement('style');
    style.id='clean-nav-v16-style';
    style.textContent=`
      #halaman-beranda{padding-bottom:calc(58px + env(safe-area-inset-bottom))!important}
      #clean-bottom-nav.clean-bottom-nav{
        position:fixed!important;left:50%!important;bottom:0!important;transform:translateX(-50%)!important;
        width:min(100%,430px)!important;height:46px!important;min-height:0!important;
        padding:2px 30px calc(3px + env(safe-area-inset-bottom))!important;
        background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;
        display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;
        align-items:end!important;gap:8px!important;overflow:visible!important;z-index:8000!important;
      }
      #clean-bottom-nav .clean-nav-wave,
      #clean-bottom-nav .clean-nav-wave-v16{
        position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:50px!important;
        z-index:0!important;pointer-events:none!important;filter:drop-shadow(0 -4px 10px rgba(12,97,72,.12))!important;
      }
      #clean-bottom-nav .clean-nav-btn{
        position:relative!important;z-index:2!important;min-height:34px!important;height:34px!important;
        padding:0!important;margin:0!important;border:0!important;background:transparent!important;
        color:rgba(255,255,255,.82)!important;display:flex!important;flex-direction:column!important;
        align-items:center!important;justify-content:center!important;gap:1px!important;
        font-size:7.5px!important;line-height:1!important;font-weight:800!important;
      }
      #clean-bottom-nav .clean-nav-btn .ico{font-size:16px!important;line-height:1!important}
      #clean-bottom-nav .clean-nav-btn.active{color:#fff!important}
      #clean-bottom-nav .clean-nav-btn[data-action="savings"]{transform:translateY(2px)!important}
      #clean-bottom-nav .clean-nav-btn.scan{display:none!important}
      @media(min-width:700px){#clean-bottom-nav.clean-bottom-nav{bottom:10px!important}}
    `;
    document.head.appendChild(style);
    return true;
  }

  function run(){
    if(apply()) return;
    let n=0;
    const t=setInterval(()=>{if(apply()||++n>40)clearInterval(t)},100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',()=>setTimeout(run,0),{once:true});
})();
