// Glassmorphic UI v8 for Bank Sampah Sukolilo.
// Presentation-only layer: preserve scanner/business logic and progressively enhance DOM.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);

  function addStyles(){
    if($('glass-ui-v8-style')) return;
    const s=document.createElement('style');
    s.id='glass-ui-v8-style';
    s.textContent=`
      :root{
        --g-deep:#214c31; --g-main:#4e8259; --g-soft:#a8c9a8; --g-lime:#86c96a;
        --glass:rgba(255,255,255,.22); --glass-strong:rgba(255,255,255,.34);
        --glass-line:rgba(255,255,255,.58); --ink:#15301e; --muted:#536a59;
      }
      html,body{min-height:100%;background:#315841!important;}
      body{font-family:Inter,'Segoe UI',system-ui,-apple-system,sans-serif!important;color:var(--ink);}
      body::before{
        inset:0!important;filter:blur(5px) saturate(.92)!important;opacity:.92!important;
        background-image:linear-gradient(145deg,rgba(236,246,229,.54),rgba(58,101,67,.25)),url('Assets/bg.jpg')!important;
        background-size:cover!important;background-position:center!important;
      }
      body::after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:
        radial-gradient(circle at 14% 10%,rgba(255,255,255,.45),transparent 28%),
        radial-gradient(circle at 88% 82%,rgba(173,220,146,.28),transparent 32%);}

      /* Profile / login */
      #form-login.glass-v8{
        width:min(92vw,410px)!important;max-width:410px!important;padding:27px 22px 23px!important;
        border-radius:32px!important;background:rgba(239,248,235,.24)!important;
        border:1px solid rgba(255,255,255,.64)!important;
        box-shadow:0 24px 60px rgba(16,47,28,.28),inset 0 1px 0 rgba(255,255,255,.72)!important;
        backdrop-filter:blur(23px) saturate(1.18)!important;-webkit-backdrop-filter:blur(23px) saturate(1.18)!important;
      }
      #form-login.glass-v8 h2{font-size:25px!important;letter-spacing:-.5px;color:#255734!important;text-shadow:none!important;margin:0!important;text-align:left!important;}
      .glass-login-sub{font-size:12px;color:#58705e;margin:5px 0 18px;line-height:1.45;}
      .glass-avatar{width:116px;height:116px;margin:4px auto 20px;border-radius:50%;position:relative;display:grid;place-items:center;
        background:linear-gradient(150deg,rgba(255,255,255,.65),rgba(218,235,214,.20));border:1px solid rgba(255,255,255,.78);
        box-shadow:0 12px 34px rgba(27,70,40,.14),inset 0 1px 3px rgba(255,255,255,.85);}
      .glass-avatar-head{width:42px;height:42px;border-radius:50%;background:#91aa91;position:absolute;top:25px;}
      .glass-avatar-body{width:70px;height:45px;border-radius:42px 42px 18px 18px;background:#91aa91;position:absolute;bottom:18px;}
      .glass-avatar-cam{position:absolute;right:0;bottom:8px;width:35px;height:35px;border-radius:50%;display:grid;place-items:center;background:#4f875a;color:white;border:3px solid rgba(245,250,242,.9);font-size:16px;}
      #form-login .form-group{margin-bottom:13px!important;}
      #form-login label{color:#183820!important;text-shadow:none!important;font-size:12px!important;font-weight:800!important;margin:0 0 6px!important;}
      #form-login input{height:46px!important;border:1px solid rgba(255,255,255,.62)!important;border-radius:14px!important;
        background:rgba(255,255,255,.28)!important;color:#183820!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.44)!important;
        backdrop-filter:blur(11px)!important;-webkit-backdrop-filter:blur(11px)!important;}
      #form-login input::placeholder{color:#64786a!important;}
      #form-login input[readonly]{background:rgba(234,243,230,.30)!important;color:#315a3c!important;}
      #form-login .btn-submit{height:50px!important;border-radius:26px!important;background:linear-gradient(135deg,#7cae69,#4e8758)!important;
        box-shadow:0 10px 24px rgba(46,108,62,.25),inset 0 1px 0 rgba(255,255,255,.36)!important;font-weight:900!important;letter-spacing:.1px;}

      /* Home */
      #halaman-beranda.glass-home-v8{max-width:430px!important;padding:18px 15px 96px!important;}
      .header-beranda.glass-header-v8{padding:20px!important;border-radius:26px!important;background:rgba(244,250,240,.23)!important;
        border:1px solid rgba(255,255,255,.58)!important;box-shadow:0 18px 42px rgba(20,55,31,.17)!important;
        backdrop-filter:blur(20px) saturate(1.13)!important;-webkit-backdrop-filter:blur(20px) saturate(1.13)!important;}
      .profile-section h2{font-size:25px!important;color:#fff!important;text-shadow:0 2px 8px rgba(13,43,24,.28)!important;letter-spacing:-.6px;}
      .profile-section p{color:rgba(255,255,255,.88)!important;text-shadow:0 1px 4px rgba(0,0,0,.22)!important;}
      .glass-home-tagline{font-size:11px;color:rgba(255,255,255,.84);margin-top:5px;}
      .rekap-card{margin-top:5px!important;padding:14px 8px!important;border-radius:20px!important;background:rgba(255,255,255,.35)!important;
        border:1px solid rgba(255,255,255,.62)!important;box-shadow:0 10px 24px rgba(30,66,40,.10),inset 0 1px 0 rgba(255,255,255,.55)!important;
        backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;}
      .rekap-label{font-size:9px!important;color:#4b6452!important;letter-spacing:.2px;}
      .rekap-value{font-size:17px!important;color:#245d35!important;white-space:nowrap;}
      .rekap-icon{font-size:18px;margin-bottom:3px;}
      .rekap-divider{height:45px!important;background:rgba(53,92,62,.16)!important;}
      .glass-section-title{display:flex;justify-content:space-between;align-items:center;color:white;margin:18px 2px 10px;font-size:17px;font-weight:850;text-shadow:0 2px 6px rgba(0,0,0,.25);}
      .glass-section-title small{font-size:10px;font-weight:650;opacity:.8;}
      .search-beranda{height:44px!important;border:1px solid rgba(255,255,255,.55)!important;border-radius:15px!important;background:rgba(255,255,255,.30)!important;
        color:#163620!important;box-shadow:0 9px 22px rgba(21,56,32,.12)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;}
      .search-beranda::placeholder{color:#3e6249!important;}
      .category-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;padding-bottom:12px!important;}
      .cat-card{min-height:105px!important;padding:13px 5px!important;border-radius:19px!important;background:rgba(255,255,255,.30)!important;
        border:1px solid rgba(255,255,255,.58)!important;box-shadow:0 11px 24px rgba(24,59,34,.13),inset 0 1px 0 rgba(255,255,255,.58)!important;
        backdrop-filter:blur(18px) saturate(1.12)!important;-webkit-backdrop-filter:blur(18px) saturate(1.12)!important;display:flex;flex-direction:column;justify-content:center;}
      .cat-icon{font-size:31px!important;margin-bottom:7px!important;filter:drop-shadow(0 3px 4px rgba(36,75,44,.12));}
      .cat-title{font-size:11px!important;color:#173920!important;line-height:1.18!important;font-weight:850!important;}
      .book-card{background:rgba(255,255,255,.30)!important;border:1px solid rgba(255,255,255,.58)!important;color:#173920!important;
        backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;border-radius:18px!important;box-shadow:0 10px 24px rgba(24,59,34,.12)!important;}
      .book-icon{background:rgba(218,240,211,.46)!important;}
      .glass-bottom-nav{position:fixed;left:50%;bottom:calc(12px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(390px,calc(100% - 30px));height:67px;
        z-index:8000;border-radius:24px;display:grid;grid-template-columns:repeat(4,1fr);align-items:center;padding:5px 8px;background:rgba(245,250,241,.38);
        border:1px solid rgba(255,255,255,.65);box-shadow:0 15px 38px rgba(18,48,28,.22);backdrop-filter:blur(24px) saturate(1.18);-webkit-backdrop-filter:blur(24px) saturate(1.18);}
      .glass-nav-item{border:0;background:transparent;color:#315c3a;font-size:9px;font-weight:800;display:flex;flex-direction:column;align-items:center;gap:3px;}
      .glass-nav-icon{font-size:19px;line-height:1}.glass-nav-item.active{color:#1e6b36;}

      /* Category modal */
      .modal-overlay{background:rgba(12,31,18,.42)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;}
      .modal-content{background:rgba(239,248,235,.72)!important;border:1px solid rgba(255,255,255,.68)!important;backdrop-filter:blur(25px)!important;-webkit-backdrop-filter:blur(25px)!important;}
      .subcat-grid{grid-template-columns:repeat(3,1fr)!important;gap:8px!important;}
      .subcat-card{background:rgba(255,255,255,.45)!important;border:1px solid rgba(255,255,255,.68)!important;border-radius:16px!important;}

      /* Camera */
      #camera-ui{background:#11291a!important;}
      .kamera-overlay-dark{background:linear-gradient(to bottom,rgba(12,31,18,.28),transparent 20%,transparent 65%,rgba(10,25,15,.26))!important;}
      .kamera-top-bar{margin:12px 13px 0;padding:12px 13px!important;border-radius:22px;background:rgba(236,247,232,.20)!important;
        border:1px solid rgba(255,255,255,.42)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important;}
      .back-btn,.torch-btn{background:rgba(255,255,255,.23)!important;border:1px solid rgba(255,255,255,.43)!important;}
      .kamera-title-area h2{font-size:18px!important}.kamera-title-area small{font-size:10px!important;color:rgba(255,255,255,.88)!important;}
      .scanner-box{width:min(90vw,390px)!important;aspect-ratio:2.25/1!important;border-radius:22px!important;box-shadow:0 0 0 9999px rgba(5,16,9,.34),0 16px 50px rgba(0,0,0,.18)!important;
        border:1px solid rgba(255,255,255,.28)!important;}
      .bracket{border-color:#e9fff0!important;filter:drop-shadow(0 0 5px rgba(255,255,255,.55))!important;}
      .scan-line{background:linear-gradient(90deg,transparent,#7cf2a6,transparent)!important;box-shadow:0 0 12px rgba(105,240,155,.75)!important;}
      .scanner-box::after{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.65)!important;}
      .kamera-bottom-panel{margin:0 12px calc(10px + env(safe-area-inset-bottom))!important;padding:17px 17px 18px!important;min-height:165px!important;border-radius:26px!important;
        background:rgba(238,248,235,.20)!important;border:1px solid rgba(255,255,255,.42)!important;box-shadow:0 16px 42px rgba(0,0,0,.20)!important;
        backdrop-filter:blur(24px) saturate(1.12)!important;-webkit-backdrop-filter:blur(24px) saturate(1.12)!important;}
      .scan-source{color:rgba(255,255,255,.72)!important;}
      .kamera-status-info,#status-text{color:#dcffe7!important;text-shadow:0 1px 8px rgba(0,0,0,.35)!important;}
      .scanner-tip{color:rgba(255,255,255,.72)!important;}
      #btn-lanjut,#btn-manual,#btn-capture{border:1px solid rgba(255,255,255,.52)!important;box-shadow:0 9px 23px rgba(0,0,0,.16)!important;}
      #btn-lanjut,#btn-capture{background:linear-gradient(135deg,rgba(118,211,139,.96),rgba(61,143,82,.96))!important;color:white!important;}
      #btn-manual{background:rgba(255,255,255,.28)!important;color:#fff!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;}
      .ai-result-display{font-size:46px!important;text-shadow:0 3px 10px rgba(0,0,0,.30)!important;}

      @media (max-width:360px){
        #halaman-beranda.glass-home-v8{padding-left:10px!important;padding-right:10px!important}.cat-title{font-size:10px!important}.cat-card{min-height:96px!important}.glass-bottom-nav{width:calc(100% - 18px);}
      }
    `;
    document.head.appendChild(s);
  }

  function enhanceLogin(){
    const form=$('form-login'); if(!form) return;
    form.classList.add('glass-v8');
    const h=form.querySelector('h2');
    if(h) h.textContent='PENGATURAN PROFIL';
    if(!form.querySelector('.glass-login-sub')){
      const sub=document.createElement('div'); sub.className='glass-login-sub';
      sub.textContent='Lengkapi data untuk mulai mencatat simpanan sampah.';
      h?.insertAdjacentElement('afterend',sub);
      const avatar=document.createElement('div'); avatar.className='glass-avatar';
      avatar.innerHTML='<div class="glass-avatar-head"></div><div class="glass-avatar-body"></div><div class="glass-avatar-cam">📷</div>';
      sub.insertAdjacentElement('afterend',avatar);
    }
    const groups=[...form.querySelectorAll('.form-group')];
    if(groups[0]){const l=groups[0].querySelector('label');if(l)l.textContent='Nama Lengkap';}
    if(groups[1]){const l=groups[1].querySelector('label');if(l)l.textContent='Unit Kerja';}

    if(!$('input-nip-glass')){
      const unitGroup=groups[1];
      const nip=document.createElement('div'); nip.className='form-group';
      nip.innerHTML='<label>NIP / ID Pegawai</label><input id="input-nip-glass" type="text" inputmode="numeric" placeholder="Contoh: 12345...">';
      unitGroup?.insertAdjacentElement('beforebegin',nip);
      const hp=document.createElement('div'); hp.className='form-group';
      hp.innerHTML='<label>No. HP</label><input id="input-hp-glass" type="tel" inputmode="tel" placeholder="081...">';
      unitGroup?.insertAdjacentElement('beforebegin',hp);
      try{
        const p=JSON.parse(localStorage.getItem('userBankSampah')||'null');
        if(p){$('input-nip-glass').value=p.nip||'';$('input-hp-glass').value=p.noHp||'';}
      }catch(_){}
    }
    const submit=form.querySelector('.btn-submit'); if(submit)submit.textContent='SIMPAN & LANJUTKAN  →';
  }

  function enhanceHome(){
    const home=$('halaman-beranda'); if(!home) return;
    home.classList.add('glass-home-v8');
    const header=home.querySelector('.header-beranda'); header?.classList.add('glass-header-v8');
    const profile=home.querySelector('.profile-section');
    if(profile && !profile.querySelector('.glass-home-tagline')){
      const t=document.createElement('div');t.className='glass-home-tagline';t.textContent='Terus pilah sampah, untuk lingkungan Sukolilo yang lebih hijau 🌿';profile.appendChild(t);
    }
    const rekap=home.querySelector('.rekap-card');
    if(rekap && !rekap.dataset.glassV8){
      rekap.dataset.glassV8='1';
      rekap.innerHTML=`
        <div class="rekap-item"><div class="rekap-icon">♻️</div><div class="rekap-label">Setoran</div><div class="rekap-value" id="teks-setoran">0 Kali</div></div>
        <div class="rekap-divider"></div>
        <div class="rekap-item"><div class="rekap-icon">⚖️</div><div class="rekap-label">Total Berat</div><div class="rekap-value" id="teks-total">0 Kg</div></div>
        <div class="rekap-divider"></div>
        <div class="rekap-item"><div class="rekap-icon">🗓️</div><div class="rekap-label">Terakhir</div><div class="rekap-value" id="teks-terakhir" style="font-size:12px">Belum ada</div></div>`;
    }
    const search=$('search-sampah');
    if(search && !home.querySelector('.glass-section-title')){
      const title=document.createElement('div');title.className='glass-section-title';title.innerHTML='<span>Pilih Jenis Sampah</span><small>3 menu per baris</small>';
      search.insertAdjacentElement('afterend',title);
    }
    ensureBottomNav();
    updateHomeStats();
  }

  function ensureBottomNav(){
    if($('glass-bottom-nav'))return;
    const nav=document.createElement('nav');nav.id='glass-bottom-nav';nav.className='glass-bottom-nav';
    nav.innerHTML=`
      <button class="glass-nav-item active" type="button"><span class="glass-nav-icon">⌂</span><span>Home</span></button>
      <button class="glass-nav-item" id="glass-nav-book" type="button"><span class="glass-nav-icon">📗</span><span>Simpanan</span></button>
      <button class="glass-nav-item" id="glass-nav-scan" type="button"><span class="glass-nav-icon">⌗</span><span>Scan</span></button>
      <button class="glass-nav-item" id="glass-nav-profile" type="button"><span class="glass-nav-icon">♙</span><span>Profil</span></button>`;
    document.body.appendChild(nav);
    $('glass-nav-book').onclick=()=>{if(typeof window.bukaBukuSampah==='function')window.bukaBukuSampah();};
    $('glass-nav-scan').onclick=()=>{$('search-sampah')?.focus();$('search-sampah')?.scrollIntoView({behavior:'smooth',block:'center'});};
    $('glass-nav-profile').onclick=()=>{const h=$('halaman-beranda'),f=$('form-login');if(h)h.style.display='none';if(f)f.style.display='block';};
  }

  function updateHomeStats(){
    try{
      let items=[];
      const p=JSON.parse(localStorage.getItem('userBankSampah')||'null');
      const id=p?.nama?encodeURIComponent(`${String(p.nama).trim().toLowerCase()}|${String(p.unit||'').trim().toLowerCase()}`):'guest';
      items=JSON.parse(localStorage.getItem(`riwayat_setor_user::${id}`)||'[]');
      if(!items.length)items=JSON.parse(localStorage.getItem('riwayat_setor')||'[]');
      const e=$('teks-setoran');if(e)e.textContent=`${items.length} Kali`;
    }catch(_){}
  }

  function enhanceCamera(){
    const small=document.querySelector('.kamera-title-area small'); if(small)small.textContent='Foto dulu • Universal OCR lokal';
    const source=$('scan-source'); if(source && source.textContent==='LOCAL OCR')source.textContent='UNIVERSAL OCR';
  }

  function wrapProfileSave(){
    const original=window.simpanProfil;
    if(typeof original!=='function'||original.__glassV8)return;
    const wrapped=function(){
      const r=original.apply(this,arguments);
      try{
        const p=JSON.parse(localStorage.getItem('userBankSampah')||'null');
        if(p){p.nip=$('input-nip-glass')?.value?.trim()||'';p.noHp=$('input-hp-glass')?.value?.trim()||'';localStorage.setItem('userBankSampah',JSON.stringify(p));}
      }catch(_){}
      updateHomeStats();
      return r;
    };
    wrapped.__glassV8=true;window.simpanProfil=wrapped;
  }

  window.addEventListener('load',()=>{
    addStyles();enhanceLogin();enhanceHome();enhanceCamera();wrapProfileSave();
    setTimeout(()=>{enhanceHome();updateHomeStats();},120);
    const obs=new MutationObserver(()=>{enhanceCamera();updateHomeStats();});
    obs.observe(document.body,{subtree:true,childList:true});
  });
})();