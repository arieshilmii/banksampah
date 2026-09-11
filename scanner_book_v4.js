// Local-only scanner UX + Buku Simpanan Sampah per user.
(function(){
  'use strict';

  const $ = (id) => document.getElementById(id);

  function getProfile(){
    try { return JSON.parse(localStorage.getItem('userBankSampah') || 'null'); }
    catch (_) { return null; }
  }

  function profileId(){
    const p=getProfile();
    if(!p?.nama) return 'guest';
    return encodeURIComponent(`${String(p.nama).trim().toLowerCase()}|${String(p.unit||'').trim().toLowerCase()}`);
  }

  function historyKey(){ return `riwayat_setor_user::${profileId()}`; }
  function migrationKey(){ return `riwayat_setor_migrated::${profileId()}`; }

  function ensureUserHistory(){
    const key=historyKey();
    let own=[];
    try { own=JSON.parse(localStorage.getItem(key)||'[]'); } catch (_) { own=[]; }

    // Migrasi riwayat versi lama satu kali ke user yang sedang aktif, agar data lama tidak hilang.
    if(!localStorage.getItem(migrationKey())){
      try {
        const legacy=JSON.parse(localStorage.getItem('riwayat_setor')||'[]');
        if(!own.length && Array.isArray(legacy) && legacy.length){
          own=legacy;
          localStorage.setItem(key,JSON.stringify(own));
        }
      } catch (_) {}
      localStorage.setItem(migrationKey(),'1');
    }
    return own;
  }

  function saveUserHistory(items){
    localStorage.setItem(historyKey(),JSON.stringify(items));
  }

  function formatWeight(item){
    if(item?.berat_tampilan) return String(item.berat_tampilan).replace(',','.');
    const n=Number(item?.berat||0);
    if(!Number.isFinite(n)) return '0';
    return n.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
  }

  function formatDateTime(iso){
    const d=new Date(iso);
    if(Number.isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID',{
      day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'
    }).format(d).replace(' pukul ', ' • ');
  }

  function toastSaved(){
    let toast=$('weight-saved-toast-v4');
    if(!toast){
      toast=document.createElement('div');
      toast.id='weight-saved-toast-v4';
      toast.style.cssText='position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:30000;background:#173f2b;color:#fff;padding:14px 22px;border-radius:28px;font-weight:800;box-shadow:0 8px 28px rgba(0,0,0,.35);white-space:nowrap;opacity:0;transition:opacity .2s ease;';
      document.body.appendChild(toast);
    }
    toast.textContent='Timbangan Berhasil Dicatat';
    toast.style.opacity='1';
    setTimeout(()=>{ toast.style.opacity='0'; },2200);
  }

  function injectBookStyles(){
    if($('book-savings-style')) return;
    const style=document.createElement('style');
    style.id='book-savings-style';
    style.textContent=`
      .book-card{width:100%;margin:0 0 15px;background:rgba(255,255,255,.92);border:0;border-radius:14px;padding:14px 15px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 12px rgba(0,0,0,.12);cursor:pointer;text-align:left;color:#1e362a}
      .book-card:active{transform:scale(.985)}
      .book-icon{width:44px;height:44px;border-radius:13px;background:#e2f1e7;display:flex;align-items:center;justify-content:center;font-size:23px;flex:0 0 auto}
      .book-main{flex:1;min-width:0}.book-title{font-weight:800;font-size:14px}.book-sub{font-size:11px;color:#6c757d;margin-top:3px}.book-arrow{font-size:22px;color:#6d8174}
      #savings-book-overlay{position:fixed;inset:0;z-index:25000;background:rgba(0,0,0,.72);backdrop-filter:blur(5px);display:none;align-items:flex-end;justify-content:center}
      #savings-book-sheet{width:100%;max-width:430px;height:min(88vh,780px);background:#f3f6f4;border-radius:24px 24px 0 0;display:flex;flex-direction:column;overflow:hidden}
      .book-head{padding:18px 18px 12px;background:#234b35;color:#fff;display:flex;align-items:center;gap:12px}.book-head-text{flex:1}.book-head h3{margin:0;font-size:18px}.book-head p{margin:4px 0 0;font-size:11px;opacity:.82}.book-close{width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:18px}
      .book-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 16px 8px}.book-stat{background:#fff;border-radius:13px;padding:13px;box-shadow:0 2px 7px rgba(0,0,0,.06)}.book-stat-label{font-size:10px;color:#748078;text-transform:uppercase;font-weight:800}.book-stat-value{margin-top:4px;font-size:20px;font-weight:900;color:#2d6846}
      .book-list-title{padding:7px 17px;font-size:11px;font-weight:900;color:#647169;text-transform:uppercase}.book-list{flex:1;overflow:auto;padding:0 14px 24px}.book-row{background:#fff;border-radius:13px;padding:12px 13px;margin-bottom:9px;display:grid;grid-template-columns:1fr auto;gap:5px 12px;box-shadow:0 2px 7px rgba(0,0,0,.05)}.book-row-kind{font-size:13px;font-weight:800;color:#263f31}.book-row-weight{font-size:15px;font-weight:900;color:#2e7650}.book-row-date{font-size:10px;color:#818983}.book-empty{padding:45px 18px;text-align:center;color:#7c8880}.book-empty-icon{font-size:38px;margin-bottom:10px}
    `;
    document.head.appendChild(style);
  }

  function ensureBookUI(){
    injectBookStyles();
    const home=$('halaman-beranda');
    const search=$('search-sampah');
    if(home && search && !$('btn-savings-book')){
      const btn=document.createElement('button');
      btn.id='btn-savings-book';
      btn.type='button';
      btn.className='book-card';
      btn.innerHTML='<div class="book-icon">📗</div><div class="book-main"><div class="book-title">Buku Simpanan Sampah</div><div class="book-sub" id="book-home-summary">Lihat rincian setoran sampahmu</div></div><div class="book-arrow">›</div>';
      btn.onclick=()=>window.bukaBukuSampah();
      home.insertBefore(btn,search);
    }

    if(!$('savings-book-overlay')){
      const overlay=document.createElement('div');
      overlay.id='savings-book-overlay';
      overlay.innerHTML=`
        <div id="savings-book-sheet">
          <div class="book-head">
            <div class="book-head-text"><h3>📗 Buku Simpanan Sampah</h3><p id="book-profile-name">Riwayat setoran</p></div>
            <button class="book-close" type="button" aria-label="Tutup">✕</button>
          </div>
          <div class="book-summary">
            <div class="book-stat"><div class="book-stat-label">Total Berat</div><div class="book-stat-value" id="book-total-weight">0 Kg</div></div>
            <div class="book-stat"><div class="book-stat-label">Jumlah Setoran</div><div class="book-stat-value" id="book-total-count">0</div></div>
          </div>
          <div class="book-list-title">Rincian Setoran</div>
          <div class="book-list" id="book-history-list"></div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('.book-close').onclick=()=>window.tutupBukuSampah();
      overlay.onclick=(e)=>{ if(e.target===overlay) window.tutupBukuSampah(); };
    }
  }

  function refreshBook(){
    ensureBookUI();
    const items=ensureUserHistory();
    const total=items.reduce((s,i)=>s+(Number(i.berat)||0),0);
    const summary=$('book-home-summary');
    if(summary) summary.textContent=items.length ? `${items.length} setoran • ${total.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')} Kg` : 'Belum ada setoran sampah';
    const totalEl=$('book-total-weight'); if(totalEl) totalEl.textContent=`${total.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')} Kg`;
    const countEl=$('book-total-count'); if(countEl) countEl.textContent=String(items.length);
    const p=getProfile(); const name=$('book-profile-name'); if(name) name.textContent=p ? `${p.nama} • ${p.unit||''}` : 'Riwayat setoran';

    const list=$('book-history-list');
    if(!list) return;
    if(!items.length){
      list.innerHTML='<div class="book-empty"><div class="book-empty-icon">♻️</div><b>Belum ada simpanan sampah</b><div style="font-size:11px;margin-top:5px">Setoran yang disimpan akan muncul di sini.</div></div>';
      return;
    }
    list.innerHTML=[...items].reverse().map(i=>`
      <div class="book-row">
        <div class="book-row-kind">${escapeHtml(i.jenis||'Sampah')}</div>
        <div class="book-row-weight">${escapeHtml(formatWeight(i))} Kg</div>
        <div class="book-row-date">${escapeHtml(formatDateTime(i.waktu))}</div>
        <div></div>
      </div>`).join('');
  }

  function escapeHtml(v){
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  window.bukaBukuSampah=function(){
    refreshBook();
    const overlay=$('savings-book-overlay'); if(overlay) overlay.style.display='flex';
  };
  window.tutupBukuSampah=function(){ const overlay=$('savings-book-overlay'); if(overlay) overlay.style.display='none'; };

  function forceLocalOnlyUI(){
    const ai=$('btn-ai'); if(ai) ai.remove();
    const small=document.querySelector('.kamera-title-area small'); if(small) small.textContent='Foto dulu • pembacaan lokal';
    const tip=$('scanner-tip'); if(tip) tip.textContent='Arahkan angka ke kotak lalu tekan Ambil Gambar. Jika hasil kurang tepat, gunakan Input Berat Manual.';
    const manual=$('btn-manual'); if(manual) manual.textContent='⌨️ Input / Koreksi Manual';
  }

  function normalizeScannerStatus(){
    forceLocalOnlyUI();
    const st=$('status-text');
    if(!st) return;
    const low=(st.textContent||'').toLowerCase();
    if(low.includes('belum yakin') || low.includes('belum berhasil') || low.includes('gagal') || low.includes('gunakan ai') || low.includes('kuota ai')){
      st.textContent='Angka belum terbaca. Silakan input berat manual.';
      const manual=$('btn-manual'); if(manual) manual.style.display='block';
      const retake=$('btn-retake'); if(retake) retake.style.display='none';
      const next=$('btn-lanjut'); if(next) next.style.display='none';
    }
  }

  window.addEventListener('load',()=>{
    ensureBookUI();
    forceLocalOnlyUI();

    // AI tidak lagi menjadi bagian alur pengguna.
    window.mintaBantuanAI=function(){};

    const originalSuccess=window.suksesScan;
    if(typeof originalSuccess==='function'){
      window.suksesScan=function(nilai,sumber='lokal'){
        originalSuccess(nilai,sumber==='AI'?'lokal':sumber);
        forceLocalOnlyUI();
        const manual=$('btn-manual'); if(manual) manual.style.display='block';
        const retake=$('btn-retake'); if(retake) retake.style.display='none';
        const next=$('btn-lanjut'); if(next) next.style.display='block';
        const st=$('status-text'); if(st) st.textContent='Berat terbaca. Simpan atau koreksi manual.';
      };
    }

    // Rekap beranda kini memakai riwayat milik user aktif.
    window.muatDataRekap=function(){
      const items=ensureUserHistory();
      const total=items.reduce((s,i)=>s+(Number(i.berat)||0),0);
      const t=$('teks-total'); if(t) t.textContent=total.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+' Kg';
      const last=$('teks-terakhir');
      if(last){
        if(items.length){
          const d=new Date(items[items.length-1].waktu);
          last.textContent=Number.isNaN(d.getTime())?'-':`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
        } else last.textContent='Belum ada';
      }
      refreshBook();
    };

    // Simpan langsung ke buku user, tanpa jalur AI dan tanpa riwayat campuran antar-user.
    window.simpanKeDatabase=function(){
      if(!Number.isFinite(Number(beratTerbaca)) || Number(beratTerbaca)<=0) return;
      const items=ensureUserHistory();
      items.push({
        jenis:jenisSampahAktif,
        berat:Number(beratTerbaca),
        berat_tampilan:String(beratTeksTerbaca||beratTerbaca),
        waktu:new Date().toISOString()
      });
      saveUserHistory(items);
      tutupKamera();
      window.muatDataRekap();
      toastSaved();
    };

    const camera=$('camera-ui');
    if(camera){
      const obs=new MutationObserver(()=>normalizeScannerStatus());
      obs.observe(camera,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style']});
    }

    // Setelah profil otomatis dimuat oleh script utama, perbarui buku sekali lagi.
    setTimeout(()=>{ try{ window.muatDataRekap(); }catch(_){} },50);
  });
})();
