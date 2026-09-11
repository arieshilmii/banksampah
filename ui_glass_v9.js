// Glassmorphic UI v9.1 — one-time enhancement only; no MutationObserver.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);

  function addStyles(){
    if($('glass-v91-style'))return;
    const s=document.createElement('style');
    s.id='glass-v91-style';
    s.textContent=`
      :root{--ink:#183821;--muted:#5b7462;--line:rgba(255,255,255,.62);--glass:rgba(244,251,240,.25);--glass2:rgba(255,255,255,.34);--green:#4f875b;--green2:#7caf6c;}
      html,body{min-height:100%;background:#294c36!important;}
      body{font-family:Inter,'Segoe UI',system-ui,-apple-system,sans-serif!important;color:var(--ink);}
      body::before{inset:-5%!important;background-image:linear-gradient(145deg,rgba(237,246,230,.42),rgba(31,74,47,.28)),url('assets/bg.jpg')!important;background-size:cover!important;background-position:center!important;filter:blur(9px) saturate(.9)!important;opacity:.96!important;}
      body::after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(circle at 18% 8%,rgba(255,255,255,.34),transparent 28%),radial-gradient(circle at 86% 80%,rgba(170,222,151,.25),transparent 34%);}

      /* LOGIN */
      #form-login.glass-v91{width:min(92vw,410px)!important;max-width:410px!important;padding:24px 22px 22px!important;border-radius:30px!important;background:rgba(241,248,237,.23)!important;border:1px solid var(--line)!important;box-shadow:0 24px 58px rgba(12,40,24,.25),inset 0 1px 0 rgba(255,255,255,.72)!important;backdrop-filter:blur(25px) saturate(1.14)!important;-webkit-backdrop-filter:blur(25px) saturate(1.14)!important;}
      #form-login.glass-v91 h2{text-align:left!important;color:#295736!important;text-shadow:none!important;font-size:24px!important;margin:0!important;letter-spacing:-.4px;}
      .glass-v91-sub{font-size:12px;line-height:1.45;color:#5e7563;margin:5px 0 16px;}
      .glass-v91-avatar{width:112px;height:112px;margin:3px auto 18px;border-radius:50%;position:relative;background:linear-gradient(145deg,rgba(255,255,255,.68),rgba(214,234,210,.24));border:1px solid rgba(255,255,255,.8);box-shadow:0 12px 31px rgba(26,68,39,.14),inset 0 1px 3px rgba(255,255,255,.85);}
      .glass-v91-avatar:before{content:'';position:absolute;width:39px;height:39px;border-radius:50%;background:#94ab96;left:36px;top:24px;}.glass-v91-avatar:after{content:'';position:absolute;width:69px;height:43px;border-radius:44px 44px 18px 18px;background:#94ab96;left:21px;bottom:15px;}
      .glass-v91-cam{position:absolute;right:0;bottom:7px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#4e8659;color:#fff;border:3px solid rgba(248,252,246,.92);z-index:3;font-size:15px;}
      #form-login .form-group{margin-bottom:12px!important;}#form-login label{color:#1b3d24!important;text-shadow:none!important;font-size:12px!important;font-weight:800!important;margin-bottom:6px!important;}
      #form-login input{height:45px!important;border:1px solid rgba(255,255,255,.62)!important;border-radius:14px!important;background:rgba(255,255,255,.31)!important;color:#17371f!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.48)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;}
      #form-login input::placeholder{color:#6a7d70!important}#form-login input[readonly]{background:rgba(232,242,229,.3)!important;color:#315b3b!important;}
      .glass-v91-extra input{padding-left:13px!important}.glass-v91-footer{font-size:10px;text-align:center;color:#58715f;margin-top:12px;opacity:.9}
      #form-login .btn-submit{height:50px!important;border-radius:26px!important;background:linear-gradient(135deg,#82b770,#4e8759)!important;box-shadow:0 10px 25px rgba(45,104,59,.24),inset 0 1px 0 rgba(255,255,255,.33)!important;font-weight:900!important;}

      /* HOME */
      #halaman-beranda.glass-v91-home{max-width:430px!important;padding:15px 14px 96px!important;}
      .header-beranda.glass-v91-header{padding:18px!important;border-radius:25px!important;background:rgba(244,250,240,.22)!important;border:1px solid rgba(255,255,255,.58)!important;box-shadow:0 16px 40px rgba(18,52,29,.17)!important;backdrop-filter:blur(22px) saturate(1.14)!important;-webkit-backdrop-filter:blur(22px) saturate(1.14)!important;}
      .profile-section h2{font-size:24px!important;color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.24)!important;letter-spacing:-.45px;}.profile-section p{color:rgba(255,255,255,.9)!important;text-shadow:0 1px 4px rgba(0,0,0,.2)!important;}
      .glass-v91-tagline{font-size:10px;color:rgba(255,255,255,.82);margin-top:4px}
      .rekap-card{margin-top:5px!important;padding:13px 5px!important;border-radius:19px!important;background:rgba(255,255,255,.35)!important;border:1px solid rgba(255,255,255,.62)!important;box-shadow:0 9px 22px rgba(28,61,38,.1),inset 0 1px 0 rgba(255,255,255,.54)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;}
      .rekap-item{min-width:0}.rekap-label{font-size:8px!important;color:#536958!important;letter-spacing:.1px;}.rekap-value{font-size:14.5px!important;color:#245b34!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rekap-divider{height:42px!important;background:rgba(50,89,59,.16)!important;}
      .glass-v91-section{display:flex;justify-content:space-between;align-items:center;margin:16px 2px 9px;color:#fff;font-size:16px;font-weight:850;text-shadow:0 2px 6px rgba(0,0,0,.23)}.glass-v91-section small{font-size:9px;opacity:.78}
      .search-beranda{height:44px!important;border:1px solid rgba(255,255,255,.54)!important;border-radius:15px!important;background:rgba(255,255,255,.31)!important;color:#17371f!important;box-shadow:0 8px 20px rgba(21,53,31,.12)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;margin-bottom:10px!important;}.search-beranda::placeholder{color:#42634b!important;}
      .category-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;padding-bottom:14px!important}.cat-card{min-height:102px!important;padding:12px 4px!important;border-radius:18px!important;background:rgba(255,255,255,.31)!important;border:1px solid rgba(255,255,255,.6)!important;box-shadow:0 10px 22px rgba(22,57,32,.13),inset 0 1px 0 rgba(255,255,255,.56)!important;backdrop-filter:blur(18px) saturate(1.12)!important;-webkit-backdrop-filter:blur(18px) saturate(1.12)!important;display:flex;flex-direction:column;justify-content:center;}.cat-card:active{transform:scale(.97)}.cat-icon{font-size:29px!important;margin-bottom:7px!important}.cat-title{font-size:10.2px!important;line-height:1.15!important;font-weight:850!important;color:#173920!important;}
      .book-card{background:rgba(255,255,255,.31)!important;border:1px solid rgba(255,255,255,.6)!important;color:#173920!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;border-radius:18px!important;box-shadow:0 10px 22px rgba(22,57,32,.12)!important;}
      .glass-v91-banner{margin:3px 0 13px;padding:12px 14px;border-radius:18px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.52);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:flex;align-items:center;gap:10px;color:#244d2f;box-shadow:0 9px 20px rgba(20,52,30,.1)}.glass-v91-banner b{font-size:11px}.glass-v91-banner span{font-size:9px;color:#54705c}.glass-v91-banner .ico{font-size:30px}.glass-v91-banner .chev{margin-left:auto;font-size:20px;opacity:.7}
      .glass-v91-nav{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(390px,calc(100% - 28px));height:65px;z-index:8000;border-radius:23px;display:grid;grid-template-columns:repeat(4,1fr);align-items:center;padding:5px 7px;background:rgba(245,250,241,.36);border:1px solid rgba(255,255,255,.65);box-shadow:0 14px 34px rgba(18,48,28,.2);backdrop-filter:blur(24px) saturate(1.15);-webkit-backdrop-filter:blur(24px) saturate(1.15)}.glass-v91-nav button{border:0;background:transparent;color:#345d3d;font-size:9px;font-weight:800;display:flex;flex-direction:column;align-items:center;gap:2px}.glass-v91-nav .active{color:#176b32}.glass-v91-nav i{font-style:normal;font-size:18px;line-height:1}

      /* MODAL */
      .modal-overlay{background:rgba(9,28,16,.4)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}.modal-content{background:rgba(239,248,235,.76)!important;border:1px solid rgba(255,255,255,.68)!important;backdrop-filter:blur(25px)!important;-webkit-backdrop-filter:blur(25px)!important}.subcat-grid{grid-template-columns:repeat(3,1fr)!important;gap:8px!important}.subcat-card{background:rgba(255,255,255,.48)!important;border:1px solid rgba(255,255,255,.68)!important;border-radius:16px!important;}

      /* CAMERA */
      #camera-ui{background:#102719!important}.kamera-overlay-dark{background:linear-gradient(to bottom,rgba(8,25,14,.25),transparent 20%,transparent 64%,rgba(7,22,12,.23))!important}.kamera-top-bar{margin:10px 11px 0;padding:11px 12px!important;border-radius:21px;background:rgba(239,248,235,.19)!important;border:1px solid rgba(255,255,255,.42)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important}.back-btn,.torch-btn{background:rgba(255,255,255,.22)!important;border:1px solid rgba(255,255,255,.42)!important}.kamera-title-area h2{font-size:17px!important}.kamera-title-area small{font-size:10px!important;color:rgba(255,255,255,.88)!important}
      .glass-v91-camera-hint{position:absolute;top:78px;left:50%;transform:translateX(-50%);width:min(92vw,390px);z-index:5;border-radius:16px;padding:10px 13px;background:rgba(244,250,240,.25);border:1px solid rgba(255,255,255,.45);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);color:#fff;box-shadow:0 10px 26px rgba(0,0,0,.13);font-size:11px;text-shadow:0 1px 5px rgba(0,0,0,.25)}.glass-v91-camera-hint b{display:block;font-size:12px;margin-bottom:2px}
      .scanner-box{width:min(90vw,390px)!important;aspect-ratio:2.22/1!important;border-radius:22px!important;box-shadow:0 0 0 9999px rgba(4,15,8,.31),0 15px 44px rgba(0,0,0,.18)!important;border:1px solid rgba(255,255,255,.27)!important}.bracket{border-color:#effff3!important;filter:drop-shadow(0 0 5px rgba(255,255,255,.55))!important}.scan-line{background:linear-gradient(90deg,transparent,#79efa1,transparent)!important;box-shadow:0 0 12px rgba(105,239,153,.72)!important}.scanner-box::after{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.62)!important;bottom:-27px!important}
      .kamera-bottom-panel{margin:0 11px calc(9px + env(safe-area-inset-bottom))!important;padding:16px 16px 17px!important;min-height:164px!important;border-radius:25px!important;background:rgba(238,248,235,.2)!important;border:1px solid rgba(255,255,255,.42)!important;box-shadow:0 15px 40px rgba(0,0,0,.2)!important;backdrop-filter:blur(24px) saturate(1.12)!important;-webkit-backdrop-filter:blur(24px) saturate(1.12)!important}.scan-source{color:rgba(255,255,255,.72)!important}.kamera-status-info,#status-text{color:#e0ffe9!important;text-shadow:0 1px 8px rgba(0,0,0,.32)!important}.scanner-tip{color:rgba(255,255,255,.72)!important}.ai-result-display{font-size:44px!important;text-shadow:0 3px 10px rgba(0,0,0,.28)!important}
      #btn-lanjut,#btn-capture{background:linear-gradient(135deg,rgba(123,213,142,.97),rgba(62,143,82,.97))!important;color:#fff!important;border:1px solid rgba(255,255,255,.5)!important;box-shadow:0 8px 21px rgba(0,0,0,.16)!important}#btn-manual{background:rgba(255,255,255,.25)!important;color:#fff!important;border:1px solid rgba(255,255,255,.48)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}
      @media(max-width:360px){#halaman-beranda.glass-v91-home{padding-left:9px!important;padding-right:9px!important}.cat-card{min-height:94px!important}.cat-title{font-size:9.5px!important}.glass-v91-nav{width:calc(100% - 18px)}}
    `;
    document.head.appendChild(s);
  }

  function enhanceLogin(){
    const form=$('form-login');if(!form||form.dataset.glassV91==='1')return;
    form.dataset.glassV91='1';form.classList.add('glass-v91');
    const h=form.querySelector('h2');if(h)h.textContent='PENGATURAN PROFIL';
    const sub=document.createElement('div');sub.className='glass-v91-sub';sub.textContent='Lengkapi data pegawai untuk mulai mencatat simpanan sampah.';h?.insertAdjacentElement('afterend',sub);
    const avatar=document.createElement('div');avatar.className='glass-v91-avatar';avatar.innerHTML='<div class="glass-v91-cam">📷</div>';sub.insertAdjacentElement('afterend',avatar);
    const groups=[...form.querySelectorAll('.form-group')];
    if(groups[0]){const l=groups[0].querySelector('label');if(l)l.textContent='Nama Lengkap';}
    if(groups[1]){
      const nip=document.createElement('div');nip.className='form-group glass-v91-extra';nip.innerHTML='<label>NIP / ID Pegawai</label><input id="glass-nip" type="text" placeholder="Contoh: 12345...">';groups[1].insertAdjacentElement('beforebegin',nip);
      const hp=document.createElement('div');hp.className='form-group glass-v91-extra';hp.innerHTML='<label>No. HP</label><input id="glass-hp" type="tel" placeholder="081...">';groups[1].insertAdjacentElement('beforebegin',hp);
      const l=groups[1].querySelector('label');if(l)l.textContent='Unit Kerja';
      try{const x=JSON.parse(localStorage.getItem('glassProfileExtra')||'{}');$('glass-nip').value=x.nip||'';$('glass-hp').value=x.hp||'';}catch(_){}
    }
    const btn=form.querySelector('.btn-submit');if(btn){btn.textContent='SIMPAN & LANJUTKAN  →';btn.addEventListener('click',()=>{try{localStorage.setItem('glassProfileExtra',JSON.stringify({nip:$('glass-nip')?.value||'',hp:$('glass-hp')?.value||''}));}catch(_){}});}
    const foot=document.createElement('div');foot.className='glass-v91-footer';foot.textContent='🌱 Bersama, kita ciptakan lingkungan yang lebih baik';form.appendChild(foot);
  }

  function getHistory(){
    try{
      const p=JSON.parse(localStorage.getItem('userBankSampah')||'{}');const id=encodeURIComponent(`${p.nama||''}|${p.unit||''}`.toLowerCase().trim());
      let arr=JSON.parse(localStorage.getItem(`riwayat_setor_user::${id}`)||'[]');if(!Array.isArray(arr)||!arr.length)arr=JSON.parse(localStorage.getItem('riwayat_setor')||'[]');return Array.isArray(arr)?arr:[];
    }catch(_){return[];}
  }

  function addThirdStat(){
    const card=document.querySelector('.rekap-card');if(!card||$('teks-setoran'))return;
    const old=[...card.querySelectorAll('.rekap-item')];
    if(old[0]){const l=old[0].querySelector('.rekap-label');if(l)l.textContent='Total Berat';}
    const div=document.createElement('div');div.className='rekap-divider';const item=document.createElement('div');item.className='rekap-item';item.innerHTML='<div class="rekap-label">Setoran</div><div class="rekap-value" id="teks-setoran">0 Kali</div>';
    card.appendChild(div);card.appendChild(item);
  }

  function ensureNav(home){
    if(home.querySelector('.glass-v91-nav'))return;
    const nav=document.createElement('div');nav.className='glass-v91-nav';nav.innerHTML='<button class="active"><i>⌂</i>Home</button><button><i>☆</i>Poin</button><button><i>⌗</i>Scan</button><button><i>♙</i>Profil</button>';
    const b=nav.querySelectorAll('button');b[2].onclick=()=>{$('search-sampah')?.focus();};b[3].onclick=()=>{home.style.display='none';const f=$('form-login');if(f)f.style.display='block';};home.appendChild(nav);
  }

  function enhanceHome(){
    const home=$('halaman-beranda');if(!home||home.dataset.glassV91==='1')return;
    home.dataset.glassV91='1';home.classList.add('glass-v91-home');home.querySelector('.header-beranda')?.classList.add('glass-v91-header');
    const profile=home.querySelector('.profile-section');if(profile&&!profile.querySelector('.glass-v91-tagline')){const tag=document.createElement('div');tag.className='glass-v91-tagline';tag.textContent='Terus pilah sampah, untuk lingkungan yang lebih hijau.';profile.appendChild(tag);}
    addThirdStat();
    const search=$('search-sampah');if(search&&!home.querySelector('.glass-v91-section')){const title=document.createElement('div');title.className='glass-v91-section';title.innerHTML='<span>Pilih Jenis Sampah</span><small>Lihat semua ›</small>';search.insertAdjacentElement('afterend',title);}
    const grid=$('category-grid');if(grid&&!home.querySelector('.glass-v91-banner')){const banner=document.createElement('div');banner.className='glass-v91-banner';banner.innerHTML='<div class="ico">🌍</div><div><b>Sampah Hari Ini</b><br><span>Bumi Lebih Baik Esok Nanti</span></div><div class="chev">›</div>';grid.insertAdjacentElement('afterend',banner);}
    const hist=getHistory();const e=$('teks-setoran');if(e)e.textContent=`${hist.length} Kali`;
    ensureNav(home);
  }

  function enhanceCamera(){
    const cam=$('camera-ui');if(!cam||cam.dataset.glassV91==='1')return;cam.dataset.glassV91='1';
    const small=document.querySelector('.kamera-title-area small');if(small)small.textContent='Foto dulu • Universal OCR lokal';
    const title=document.querySelector('.kamera-title-area h2');if(title)title.textContent='Pindai Timbangan';
    const hint=document.createElement('div');hint.className='glass-v91-camera-hint';hint.innerHTML='<b>🌿 Arahkan kamera ke layar timbangan</b>Pastikan angka berada jelas di dalam frame.';cam.appendChild(hint);
  }

  window.addEventListener('load',()=>{addStyles();enhanceLogin();enhanceHome();enhanceCamera();});
})();
