// Glassmorphic UI v9 — safe, one-time enhancement layer.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);

  function addStyles(){
    if($('glass-v9-style')) return;
    const s=document.createElement('style');
    s.id='glass-v9-style';
    s.textContent=`
      :root{--g1:#173b28;--g2:#4f7f5b;--glass:rgba(255,255,255,.22);--line:rgba(255,255,255,.52);--ink:#183821;--muted:#5d7463;}
      html,body{min-height:100%;background:#274a35!important;}
      body{font-family:Inter,'Segoe UI',system-ui,-apple-system,sans-serif!important;color:var(--ink);}
      body::before{inset:-4%!important;background-image:linear-gradient(145deg,rgba(224,241,219,.38),rgba(28,68,44,.24)),url('assets/bg.jpg')!important;background-size:cover!important;background-position:center!important;filter:blur(8px) saturate(.9)!important;opacity:.96!important;}
      body::after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(circle at 18% 8%,rgba(255,255,255,.28),transparent 30%),radial-gradient(circle at 88% 82%,rgba(159,216,147,.22),transparent 34%);}

      /* LOGIN */
      #form-login.glass-v9{width:min(92vw,410px)!important;max-width:410px!important;padding:25px 21px 22px!important;border-radius:30px!important;background:rgba(239,248,235,.20)!important;border:1px solid rgba(255,255,255,.62)!important;box-shadow:0 24px 60px rgba(13,41,25,.28),inset 0 1px 0 rgba(255,255,255,.62)!important;backdrop-filter:blur(24px) saturate(1.15)!important;-webkit-backdrop-filter:blur(24px) saturate(1.15)!important;}
      #form-login.glass-v9 h2{text-align:left!important;color:#234f30!important;text-shadow:none!important;font-size:24px!important;margin:0!important;letter-spacing:-.4px;}
      .glass-v9-sub{font-size:12px;color:#5b715f;margin:5px 0 16px;line-height:1.45;}
      .glass-v9-avatar{width:108px;height:108px;border-radius:50%;margin:2px auto 18px;position:relative;background:linear-gradient(145deg,rgba(255,255,255,.64),rgba(211,232,207,.22));border:1px solid rgba(255,255,255,.78);box-shadow:0 12px 30px rgba(27,68,39,.14),inset 0 1px 3px rgba(255,255,255,.8);}
      .glass-v9-avatar:before{content:'';position:absolute;width:38px;height:38px;border-radius:50%;background:#91aa93;left:35px;top:24px;}
      .glass-v9-avatar:after{content:'';position:absolute;width:68px;height:42px;border-radius:42px 42px 18px 18px;background:#91aa93;left:20px;bottom:15px;}
      .glass-v9-cam{position:absolute;right:-1px;bottom:7px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#4e8659;color:white;border:3px solid rgba(247,251,245,.9);z-index:2;font-size:15px;}
      #form-login .form-group{margin-bottom:13px!important;}
      #form-login label{color:#193a22!important;text-shadow:none!important;font-size:12px!important;font-weight:800!important;margin-bottom:6px!important;}
      #form-login input{height:46px!important;border:1px solid rgba(255,255,255,.58)!important;border-radius:14px!important;background:rgba(255,255,255,.30)!important;color:#17371f!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.44)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;}
      #form-login input::placeholder{color:#6b7e70!important;}
      #form-login input[readonly]{background:rgba(232,242,229,.28)!important;color:#315b3b!important;}
      #form-login .btn-submit{height:50px!important;border-radius:26px!important;background:linear-gradient(135deg,#7eb16c,#4f865a)!important;box-shadow:0 10px 25px rgba(45,104,59,.24),inset 0 1px 0 rgba(255,255,255,.32)!important;font-weight:900!important;}

      /* HOME */
      #halaman-beranda.glass-v9-home{max-width:430px!important;padding:16px 14px 94px!important;}
      .header-beranda.glass-v9-header{padding:18px!important;border-radius:25px!important;background:rgba(244,250,240,.20)!important;border:1px solid rgba(255,255,255,.55)!important;box-shadow:0 16px 38px rgba(18,52,29,.18)!important;backdrop-filter:blur(22px) saturate(1.14)!important;-webkit-backdrop-filter:blur(22px) saturate(1.14)!important;}
      .profile-section h2{font-size:24px!important;color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.22)!important;letter-spacing:-.5px;}
      .profile-section p{color:rgba(255,255,255,.88)!important;text-shadow:0 1px 4px rgba(0,0,0,.2)!important;}
      .glass-v9-tagline{font-size:10px;color:rgba(255,255,255,.82);margin-top:4px;}
      .rekap-card{margin-top:4px!important;padding:12px 5px!important;border-radius:18px!important;background:rgba(255,255,255,.32)!important;border:1px solid rgba(255,255,255,.58)!important;box-shadow:0 9px 22px rgba(28,61,38,.1),inset 0 1px 0 rgba(255,255,255,.5)!important;backdrop-filter:blur(15px)!important;-webkit-backdrop-filter:blur(15px)!important;}
      .rekap-item{min-width:0}.rekap-label{font-size:8px!important;color:#516957!important;letter-spacing:.1px;}.rekap-value{font-size:15px!important;color:#245b34!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.rekap-divider{height:42px!important;background:rgba(50,89,59,.15)!important;}
      .glass-v9-section{display:flex;justify-content:space-between;align-items:center;margin:17px 2px 9px;color:white;font-size:16px;font-weight:850;text-shadow:0 2px 6px rgba(0,0,0,.23)}
      .glass-v9-section small{font-size:9px;font-weight:700;opacity:.78;}
      .search-beranda{height:44px!important;border:1px solid rgba(255,255,255,.52)!important;border-radius:15px!important;background:rgba(255,255,255,.29)!important;color:#17371f!important;box-shadow:0 8px 20px rgba(21,53,31,.12)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;margin-bottom:10px!important;}
      .search-beranda::placeholder{color:#42634b!important;}
      .category-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;padding-bottom:14px!important;}
      .cat-card{min-height:104px!important;padding:12px 5px!important;border-radius:19px!important;background:rgba(255,255,255,.29)!important;border:1px solid rgba(255,255,255,.57)!important;box-shadow:0 10px 23px rgba(22,57,32,.13),inset 0 1px 0 rgba(255,255,255,.55)!important;backdrop-filter:blur(18px) saturate(1.12)!important;-webkit-backdrop-filter:blur(18px) saturate(1.12)!important;display:flex;flex-direction:column;justify-content:center;}
      .cat-icon{font-size:30px!important;margin-bottom:7px!important}.cat-title{font-size:10.5px!important;line-height:1.16!important;font-weight:850!important;color:#173920!important;}
      .book-card{background:rgba(255,255,255,.29)!important;border:1px solid rgba(255,255,255,.57)!important;color:#173920!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;border-radius:18px!important;box-shadow:0 10px 23px rgba(22,57,32,.12)!important;}
      .glass-v9-nav{position:fixed;left:50%;bottom:calc(11px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(388px,calc(100% - 28px));height:65px;z-index:8000;border-radius:23px;display:grid;grid-template-columns:repeat(4,1fr);align-items:center;padding:5px 7px;background:rgba(245,250,241,.34);border:1px solid rgba(255,255,255,.62);box-shadow:0 14px 34px rgba(18,48,28,.2);backdrop-filter:blur(24px) saturate(1.15);-webkit-backdrop-filter:blur(24px) saturate(1.15);}
      .glass-v9-nav button{border:0;background:transparent;color:#345d3d;font-size:9px;font-weight:800;display:flex;flex-direction:column;align-items:center;gap:2px}.glass-v9-nav .active{color:#176b32}.glass-v9-nav i{font-style:normal;font-size:18px;line-height:1}

      /* MODAL */
      .modal-overlay{background:rgba(9,28,16,.42)!important;backdrop-filter:blur(9px)!important;-webkit-backdrop-filter:blur(9px)!important;}
      .modal-content{background:rgba(239,248,235,.74)!important;border:1px solid rgba(255,255,255,.66)!important;backdrop-filter:blur(25px)!important;-webkit-backdrop-filter:blur(25px)!important;}
      .subcat-grid{grid-template-columns:repeat(3,1fr)!important;gap:8px!important}.subcat-card{background:rgba(255,255,255,.46)!important;border:1px solid rgba(255,255,255,.66)!important;border-radius:16px!important;}

      /* CAMERA */
      #camera-ui{background:#102719!important}.kamera-overlay-dark{background:linear-gradient(to bottom,rgba(8,25,14,.27),transparent 22%,transparent 64%,rgba(7,22,12,.22))!important;}
      .kamera-top-bar{margin:11px 12px 0;padding:11px 12px!important;border-radius:21px;background:rgba(239,248,235,.19)!important;border:1px solid rgba(255,255,255,.40)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important;}
      .back-btn,.torch-btn{background:rgba(255,255,255,.22)!important;border:1px solid rgba(255,255,255,.42)!important}.kamera-title-area h2{font-size:17px!important}.kamera-title-area small{font-size:10px!important;color:rgba(255,255,255,.86)!important;}
      .scanner-box{width:min(90vw,390px)!important;aspect-ratio:2.25/1!important;border-radius:22px!important;box-shadow:0 0 0 9999px rgba(4,15,8,.34),0 15px 44px rgba(0,0,0,.18)!important;border:1px solid rgba(255,255,255,.26)!important;}.bracket{border-color:#e9fff0!important;filter:drop-shadow(0 0 5px rgba(255,255,255,.52))!important}.scan-line{background:linear-gradient(90deg,transparent,#79efa1,transparent)!important;box-shadow:0 0 12px rgba(105,239,153,.72)!important}.scanner-box::after{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.62)!important;}
      .kamera-bottom-panel{margin:0 11px calc(10px + env(safe-area-inset-bottom))!important;padding:16px 16px 17px!important;min-height:164px!important;border-radius:25px!important;background:rgba(238,248,235,.19)!important;border:1px solid rgba(255,255,255,.40)!important;box-shadow:0 15px 40px rgba(0,0,0,.20)!important;backdrop-filter:blur(24px) saturate(1.12)!important;-webkit-backdrop-filter:blur(24px) saturate(1.12)!important;}
      .scan-source{color:rgba(255,255,255,.72)!important}.kamera-status-info,#status-text{color:#dcffe7!important;text-shadow:0 1px 8px rgba(0,0,0,.32)!important}.scanner-tip{color:rgba(255,255,255,.72)!important}.ai-result-display{font-size:44px!important;text-shadow:0 3px 10px rgba(0,0,0,.28)!important;}
      #btn-lanjut,#btn-capture{background:linear-gradient(135deg,rgba(123,213,142,.96),rgba(62,143,82,.96))!important;color:#fff!important;border:1px solid rgba(255,255,255,.50)!important;box-shadow:0 8px 21px rgba(0,0,0,.16)!important}#btn-manual{background:rgba(255,255,255,.25)!important;color:#fff!important;border:1px solid rgba(255,255,255,.48)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;}
      @media(max-width:360px){#halaman-beranda.glass-v9-home{padding-left:9px!important;padding-right:9px!important}.cat-card{min-height:96px!important}.cat-title{font-size:9.7px!important}.glass-v9-nav{width:calc(100% - 18px)}}
    `;
    document.head.appendChild(s);
  }

  function enhanceLogin(){
    const form=$('form-login'); if(!form||form.dataset.glassV9==='1')return;
    form.dataset.glassV9='1'; form.classList.add('glass-v9');
    const h=form.querySelector('h2'); if(h)h.textContent='PENGATURAN PROFIL';
    const sub=document.createElement('div'); sub.className='glass-v9-sub'; sub.textContent='Lengkapi data pegawai untuk mulai mencatat simpanan sampah.'; h?.insertAdjacentElement('afterend',sub);
    const avatar=document.createElement('div'); avatar.className='glass-v9-avatar'; avatar.innerHTML='<div class="glass-v9-cam">📷</div>'; sub.insertAdjacentElement('afterend',avatar);
    const groups=form.querySelectorAll('.form-group');
    if(groups[0]){const l=groups[0].querySelector('label');if(l)l.textContent='Nama Lengkap';}
    if(groups[1]){const l=groups[1].querySelector('label');if(l)l.textContent='Unit Kerja';}
    const btn=form.querySelector('.btn-submit');if(btn)btn.textContent='SIMPAN & LANJUTKAN  →';
  }

  function userHistoryCount(){
    try{
      const p=JSON.parse(localStorage.getItem('userBankSampah')||'{}');
      const id=encodeURIComponent(`${p.nama||''}|${p.unit||''}`.toLowerCase().trim());
      const k=`riwayat_setor_user::${id}`;
      const arr=JSON.parse(localStorage.getItem(k)||localStorage.getItem('riwayat_setor')||'[]');
      return Array.isArray(arr)?arr.length:0;
    }catch(_){return 0;}
  }

  function addThirdStat(){
    const card=document.querySelector('.rekap-card'); if(!card||$('teks-setoran'))return;
    const divider=document.createElement('div');divider.className='rekap-divider';
    const item=document.createElement('div');item.className='rekap-item';item.innerHTML='<div class="rekap-label">Setoran</div><div class="rekap-value" id="teks-setoran">0 Kali</div>';
    card.appendChild(divider);card.appendChild(item);
  }
  function updateSetoran(){const e=$('teks-setoran');if(e)e.textContent=`${userHistoryCount()} Kali`;}

  function addBottomNav(home){
    if(home.querySelector('.glass-v9-nav'))return;
    const nav=document.createElement('div');nav.className='glass-v9-nav';
    nav.innerHTML='<button class="active" type="button"><i>⌂</i>Home</button><button type="button"><i>★</i>Simpanan</button><button type="button"><i>⌗</i>Scan</button><button type="button"><i>◉</i>Profil</button>';
    const b=nav.querySelectorAll('button');
    b[1].onclick=()=>{const book=document.querySelector('.book-card');book?.scrollIntoView({behavior:'smooth',block:'center'});};
    b[2].onclick=()=>{$('search-sampah')?.focus();};
    b[3].onclick=()=>{home.style.display='none';const f=$('form-login');if(f)f.style.display='block';};
    home.appendChild(nav);
  }

  function enhanceHome(){
    const home=$('halaman-beranda');if(!home||home.dataset.glassV9==='1')return;
    home.dataset.glassV9='1';home.classList.add('glass-v9-home');
    home.querySelector('.header-beranda')?.classList.add('glass-v9-header');
    const profile=home.querySelector('.profile-section');
    if(profile){const tag=document.createElement('div');tag.className='glass-v9-tagline';tag.textContent='Terus pilah sampah, untuk lingkungan yang lebih hijau.';profile.appendChild(tag);}
    addThirdStat();
    const search=$('search-sampah');if(search){const title=document.createElement('div');title.className='glass-v9-section';title.innerHTML='<span>Pilih Jenis Sampah</span><small>3 menu per baris</small>';search.insertAdjacentElement('afterend',title);}
    addBottomNav(home);updateSetoran();
  }

  function enhanceCamera(){
    const small=document.querySelector('.kamera-title-area small');if(small)small.textContent='Foto dulu • Universal OCR lokal';
    const src=$('scan-source');if(src&&src.textContent==='LOCAL OCR')src.textContent='UNIVERSAL OCR';
  }

  function wrapRekap(){
    const original=window.muatDataRekap;
    if(typeof original!=='function'||original.__glassV9)return;
    const wrapped=function(){const r=original.apply(this,arguments);updateSetoran();return r;};
    wrapped.__glassV9=true;window.muatDataRekap=wrapped;
  }

  window.addEventListener('load',()=>{
    addStyles();enhanceLogin();enhanceHome();enhanceCamera();wrapRekap();updateSetoran();
  },{once:true});
})();
