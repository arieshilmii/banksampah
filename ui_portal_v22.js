// Portal v22: two-item navigation, savings book dashboard, and local admin dashboard.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
  const kg=n=>`${(Number(n)||0).toFixed(3).replace(/0+$/,'').replace(/\.$/,'')} Kg`;
  const fmtDate=iso=>{const d=new Date(iso);return Number.isNaN(d.getTime())?'-':new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function profile(){try{return JSON.parse(localStorage.getItem('userBankSampah')||'null')}catch(_){return null}}
  function profileId(p=profile()){if(!p?.nama)return'guest';return encodeURIComponent(`${String(p.nama).trim().toLowerCase()}|${String(p.unit||'').trim().toLowerCase()}`)}
  function userKey(p=profile()){return `riwayat_setor_user::${profileId(p)}`}
  function userHistory(p=profile()){try{const x=JSON.parse(localStorage.getItem(userKey(p))||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}}

  const PRICE_KEY='bank_sampah_price_master_v22';
  function defaultMaster(){
    const out=[];
    try{
      if(typeof dbSubKategori!=='undefined'){
        Object.entries(dbSubKategori).forEach(([cat,arr])=>(arr||[]).forEach(x=>out.push({category:cat,sub:x.name,price:0})));
      }
    }catch(_){}
    return out;
  }
  function getMaster(){
    try{
      const x=JSON.parse(localStorage.getItem(PRICE_KEY)||'null');
      if(Array.isArray(x)&&x.length)return x;
    }catch(_){}
    const d=defaultMaster();localStorage.setItem(PRICE_KEY,JSON.stringify(d));return d;
  }
  function saveMaster(x){localStorage.setItem(PRICE_KEY,JSON.stringify(x))}
  function priceOf(jenis){const x=getMaster().find(i=>String(i.sub).toLowerCase()===String(jenis||'').toLowerCase());return Number(x?.price)||0}
  function itemValue(i){return (Number(i?.berat)||0)*priceOf(i?.jenis)}

  function allUsers(){
    const rows=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i)||'';
      if(!key.startsWith('riwayat_setor_user::'))continue;
      let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch(_){}
      if(!Array.isArray(items)||!items.length)continue;
      const id=key.slice('riwayat_setor_user::'.length);
      let decoded='';try{decoded=decodeURIComponent(id)}catch(_){decoded=id}
      const [namaRaw,unitRaw='']=decoded.split('|');
      rows.push({id,nama:namaRaw||'Pegawai',unit:unitRaw,items});
    }
    const p=profile();
    if(p?.nama&&!rows.some(r=>r.id===profileId(p))){
      const items=userHistory(p);if(items.length)rows.push({id:profileId(p),nama:p.nama,unit:p.unit||'',items});
    }
    return rows;
  }

  function aggregateKinds(items){
    const m=new Map();
    items.forEach(i=>{const k=i.jenis||'Lainnya';m.set(k,(m.get(k)||0)+(Number(i.berat)||0))});
    return [...m.entries()].sort((a,b)=>b[1]-a[1]);
  }
  function donutDataUrl(entries,size=180){
    const total=entries.reduce((s,x)=>s+x[1],0)||1;
    const colors=['#12b886','#20c997','#63e6be','#74c0fc','#ffd43b','#ffa94d','#ff8787','#9775fa'];
    let acc=0;const seg=[];
    entries.slice(0,8).forEach((x,i)=>{const p=x[1]/total*100;seg.push(`${colors[i%colors.length]} ${acc}% ${acc+p}%`);acc+=p});
    if(!seg.length)seg.push('#dfeee7 0% 100%');
    return `conic-gradient(${seg.join(',')})`;
  }

  function styles(){
    if($('portal-v22-style'))return;
    const s=document.createElement('style');s.id='portal-v22-style';s.textContent=`
      .clean-bottom-nav{grid-template-columns:repeat(2,1fr)!important;}
      .clean-bottom-nav [data-action="profile"],.clean-bottom-nav [data-action="scan"]{display:none!important;}
      .clean-bottom-nav [data-action="savings"]{display:flex!important;}
      #portal-book-page,#portal-admin-page{position:fixed;inset:0;z-index:18000;background:#edf9f5;overflow:auto;padding:22px 16px 92px;display:none;color:#173d2b}
      .portal-wrap{max-width:720px;margin:0 auto}.portal-top{display:flex;align-items:center;gap:12px;margin-bottom:16px}.portal-back{width:42px;height:42px;border:0;border-radius:14px;background:#fff;color:#174a34;font-size:22px;box-shadow:0 5px 18px rgba(20,86,58,.08)}.portal-title{font-size:24px;font-weight:900;flex:1}.portal-sub{font-size:12px;color:#789085;margin-top:2px}.portal-card{background:#fff;border:1px solid #e0eee8;border-radius:24px;box-shadow:0 12px 34px rgba(28,91,64,.08)}
      .portal-summary{padding:18px;display:grid;grid-template-columns:1fr 150px;gap:14px;align-items:center}.portal-total-label{font-size:12px;color:#6d867a;font-weight:800}.portal-total-value{font-size:34px;font-weight:950;margin:6px 0 2px}.portal-total-note{font-size:11px;color:#8ba096}.portal-donut-wrap{display:flex;align-items:center;justify-content:center;position:relative}.portal-donut{width:118px;height:118px;border-radius:50%;position:relative}.portal-donut::after{content:'';position:absolute;inset:24px;background:#fff;border-radius:50%}.portal-donut-center{position:absolute;font-size:11px;font-weight:900;color:#49695a;z-index:2;text-align:center}
      .portal-section-title{font-size:16px;font-weight:900;margin:20px 2px 10px}.portal-table-wrap{overflow:auto;background:#fff;border-radius:20px;border:1px solid #e2eee9}.portal-table{width:100%;border-collapse:collapse;min-width:560px}.portal-table th{font-size:10px;text-transform:uppercase;letter-spacing:.03em;color:#789086;text-align:left;padding:12px;border-bottom:1px solid #e8f1ed}.portal-table td{padding:13px 12px;border-bottom:1px solid #edf3f0;font-size:12px}.portal-table tr:last-child td{border-bottom:0}.portal-value{font-weight:900;color:#168a5d}.portal-empty{text-align:center;padding:34px;color:#82958c}
      .portal-legend{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.portal-chip{font-size:10px;background:#e9f7f1;color:#366452;border-radius:999px;padding:5px 8px}
      #portal-admin-login{position:fixed;inset:0;z-index:22000;display:none;align-items:flex-end;justify-content:center;background:rgba(13,37,27,.46);backdrop-filter:blur(7px)}.admin-login-card{width:100%;max-width:430px;background:#fff;border-radius:28px 28px 0 0;padding:22px 20px 28px}.admin-login-card h3{margin:0;font-size:22px;color:#173d2b}.admin-login-card p{font-size:12px;color:#71857b}.admin-login-card input{height:54px;border:1px solid #d9e8e1;border-radius:16px;background:#f9fcfb;color:#173d2b;text-shadow:none;font-size:20px;text-align:center;letter-spacing:.14em}.admin-login-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:10px;margin-top:14px}.admin-login-actions button,.portal-btn{height:48px;border:0;border-radius:15px;font-weight:850}.admin-cancel{background:#edf3f0;color:#315b48}.admin-submit,.portal-btn.primary{background:#19bd83;color:#063824}.portal-btn.secondary{background:#edf3f0;color:#315b48}
      .ranking-list{display:grid;gap:9px}.rank-row{background:#fff;border-radius:17px;border:1px solid #e2eee8;padding:12px 14px;display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:10px}.rank-no{width:30px;height:30px;border-radius:10px;background:#ddf8ed;color:#137450;display:flex;align-items:center;justify-content:center;font-weight:950}.rank-name{font-size:13px;font-weight:900}.rank-unit{font-size:10px;color:#84978e;margin-top:2px}.rank-weight{font-size:14px;font-weight:950;color:#168a5d}
      .master-form{display:grid;grid-template-columns:1fr 1fr 130px auto;gap:8px;padding:14px}.master-form input{height:42px;border:1px solid #dbe8e2;border-radius:12px;background:#f9fcfb;color:#173d2b;text-shadow:none;font-size:12px}.master-form button{border:0;border-radius:12px;background:#19bd83;color:#073824;font-weight:900;padding:0 14px}.master-list{padding:0 14px 14px;display:grid;gap:7px}.master-row{display:grid;grid-template-columns:1fr 1fr 110px auto;gap:8px;align-items:center;font-size:11px;padding:9px 0;border-top:1px solid #edf2ef}.master-row input{height:36px;border:1px solid #dbe8e2;border-radius:10px;background:#fff;color:#173d2b;text-shadow:none;font-size:11px}.master-delete{border:0;background:#fff0f0;color:#b23b3b;border-radius:10px;height:34px;padding:0 10px}
      @media(max-width:560px){.portal-summary{grid-template-columns:1fr 120px}.portal-total-value{font-size:29px}.portal-donut{width:104px;height:104px}.master-form{grid-template-columns:1fr 1fr}.master-form input:nth-child(3){grid-column:1/2}.master-form button{grid-column:2/3}.master-row{grid-template-columns:1fr 1fr}.master-row input{grid-column:1/2}.master-delete{grid-column:2/3}.portal-title{font-size:21px}}
    `;document.head.appendChild(s);
  }

  function ensurePages(){
    styles();
    if(!$('portal-book-page')){
      const el=document.createElement('div');el.id='portal-book-page';el.innerHTML=`<div class="portal-wrap"><div class="portal-top"><button class="portal-back" type="button">‹</button><div><div class="portal-title">Buku Tabungan</div><div class="portal-sub" id="book-page-owner">Riwayat setoran sampah</div></div></div><div class="portal-card portal-summary"><div><div class="portal-total-label">TOTAL SAMPAH TERKUMPUL</div><div class="portal-total-value" id="book-page-total">0 Kg</div><div class="portal-total-note" id="book-page-count">0 setoran</div></div><div><div class="portal-donut-wrap"><div class="portal-donut" id="book-page-donut"></div><div class="portal-donut-center">Jenis<br>Sampah</div></div><div class="portal-legend" id="book-page-legend"></div></div></div><div class="portal-section-title">Rincian Tabungan Sampah</div><div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Tanggal</th><th>Jenis Sampah</th><th>Berat</th><th>Potensi Nilai</th></tr></thead><tbody id="book-page-body"></tbody></table></div></div>`;document.body.appendChild(el);el.querySelector('.portal-back').onclick=closeBook;
    }
    if(!$('portal-admin-login')){
      const el=document.createElement('div');el.id='portal-admin-login';document.body.appendChild(el);
    }
    if(!$('portal-admin-page')){
      const el=document.createElement('div');el.id='portal-admin-page';el.innerHTML=`<div class="portal-wrap"><div class="portal-top"><button class="portal-back" type="button">‹</button><div><div class="portal-title">Dashboard Admin</div><div class="portal-sub">Monitoring Bank Sampah Kecamatan Sukolilo</div></div><button class="portal-btn secondary" id="admin-logout" style="width:auto;padding:0 14px">Keluar</button></div><div class="portal-card portal-summary"><div><div class="portal-total-label">TOTAL SAMPAH SELURUH PEGAWAI</div><div class="portal-total-value" id="admin-total">0 Kg</div><div class="portal-total-note" id="admin-count">0 pegawai</div></div><div><div class="portal-donut-wrap"><div class="portal-donut" id="admin-donut"></div><div class="portal-donut-center">Jenis<br>Sampah</div></div><div class="portal-legend" id="admin-legend"></div></div></div><div class="portal-section-title">Ranking Pegawai</div><div class="ranking-list" id="admin-ranking"></div><div class="portal-section-title">Master Jenis Sampah & Harga</div><div class="portal-card"><div class="master-form"><input id="master-category" placeholder="Jenis sampah"><input id="master-sub" placeholder="Sub sampah"><input id="master-price" inputmode="numeric" placeholder="Harga / Kg"><button id="master-add">Tambah</button></div><div class="master-list" id="master-list"></div></div><div class="portal-section-title">Rekapitulasi Terbaru</div><div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Tanggal</th><th>Nama</th><th>Jenis Sampah</th><th>Volume</th><th>Potensi Nilai</th></tr></thead><tbody id="admin-recap"></tbody></table></div></div>`;document.body.appendChild(el);el.querySelector('.portal-back').onclick=closeAdmin;$('admin-logout').onclick=()=>{closeAdmin();localStorage.removeItem('bank_admin_session_v22')};$('master-add').onclick=addMaster;
    }
  }

  function renderLegend(id,entries){const el=$(id);if(!el)return;el.innerHTML=entries.slice(0,5).map(x=>`<span class="portal-chip">${esc(x[0])}</span>`).join('')}
  function openBook(){
    ensurePages();const p=profile();const items=userHistory(p);const total=items.reduce((s,i)=>s+(Number(i.berat)||0),0);$('book-page-owner').textContent=p?`${p.nama} • ${p.unit||''}`:'Riwayat setoran';$('book-page-total').textContent=kg(total);$('book-page-count').textContent=`${items.length} setoran`;const kinds=aggregateKinds(items);$('book-page-donut').style.background=donutDataUrl(kinds);renderLegend('book-page-legend',kinds);$('book-page-body').innerHTML=items.length?[...items].reverse().map(i=>`<tr><td>${fmtDate(i.waktu)}</td><td>${esc(i.jenis||'-')}</td><td>${kg(i.berat)}</td><td class="portal-value">${money(itemValue(i))}</td></tr>`).join(''):`<tr><td colspan="4" class="portal-empty">Belum ada setoran sampah.</td></tr>`;$('portal-book-page').style.display='block';
  }
  function closeBook(){$('portal-book-page').style.display='none'}

  function adminPin(){return localStorage.getItem('bank_admin_pin_v22')||''}
  function openAdminLogin(){
    ensurePages();const first=!adminPin();const el=$('portal-admin-login');el.innerHTML=`<div class="admin-login-card"><h3>${first?'Buat PIN Admin':'Login Admin'}</h3><p>${first?'Buat PIN 4–6 digit untuk mengamankan menu admin di perangkat ini.':'Masukkan PIN admin untuk membuka dashboard.'}</p><input id="admin-pin-input" type="password" inputmode="numeric" maxlength="6" placeholder="••••"><div id="admin-pin-error" style="color:#c44747;font-size:11px;margin-top:7px;display:none">PIN tidak sesuai.</div><div class="admin-login-actions"><button class="admin-cancel">Batal</button><button class="admin-submit">${first?'Simpan PIN':'Masuk'}</button></div></div>`;el.style.display='flex';el.querySelector('.admin-cancel').onclick=()=>el.style.display='none';el.querySelector('.admin-submit').onclick=()=>{const pin=$('admin-pin-input').value.trim();if(!/^\d{4,6}$/.test(pin)){const er=$('admin-pin-error');er.textContent='Gunakan PIN 4–6 digit.';er.style.display='block';return}if(first){localStorage.setItem('bank_admin_pin_v22',pin);localStorage.setItem('bank_admin_session_v22','1');el.style.display='none';openAdmin()}else if(pin===adminPin()){localStorage.setItem('bank_admin_session_v22','1');el.style.display='none';openAdmin()}else $('admin-pin-error').style.display='block'};setTimeout(()=>$('admin-pin-input')?.focus(),80);
  }
  function openAdmin(){
    ensurePages();if(localStorage.getItem('bank_admin_session_v22')!=='1')return openAdminLogin();const users=allUsers();const all=users.flatMap(u=>u.items);const total=all.reduce((s,i)=>s+(Number(i.berat)||0),0);$('admin-total').textContent=kg(total);$('admin-count').textContent=`${users.length} pegawai`;const kinds=aggregateKinds(all);$('admin-donut').style.background=donutDataUrl(kinds);renderLegend('admin-legend',kinds);
    const ranked=users.map(u=>({...u,total:u.items.reduce((s,i)=>s+(Number(i.berat)||0),0)})).sort((a,b)=>b.total-a.total);$('admin-ranking').innerHTML=ranked.length?ranked.map((u,i)=>`<div class="rank-row"><div class="rank-no">${i+1}</div><div><div class="rank-name">${esc(u.nama)}</div><div class="rank-unit">${esc(u.unit||'')}</div></div><div class="rank-weight">${kg(u.total)}</div></div>`).join(''):`<div class="portal-empty portal-card">Belum ada data pegawai.</div>`;
    renderMaster();
    const latest=users.map(u=>{const item=[...u.items].sort((a,b)=>new Date(b.waktu)-new Date(a.waktu))[0];return item?{...u,item}:null}).filter(Boolean).sort((a,b)=>new Date(b.item.waktu)-new Date(a.item.waktu));$('admin-recap').innerHTML=latest.length?latest.map(r=>`<tr><td>${fmtDate(r.item.waktu)}</td><td>${esc(r.nama)}</td><td>${esc(r.item.jenis||'-')}</td><td>${kg(r.item.berat)}</td><td class="portal-value">${money(itemValue(r.item))}</td></tr>`).join(''):`<tr><td colspan="5" class="portal-empty">Belum ada data setoran.</td></tr>`;$('portal-admin-page').style.display='block';
  }
  function closeAdmin(){$('portal-admin-page').style.display='none'}

  function renderMaster(){const data=getMaster();$('master-list').innerHTML=data.map((x,i)=>`<div class="master-row" data-i="${i}"><div>${esc(x.category)}</div><div>${esc(x.sub)}</div><input class="master-price-edit" inputmode="numeric" value="${Number(x.price)||0}" aria-label="Harga ${esc(x.sub)}"><button class="master-delete">Hapus</button></div>`).join('');document.querySelectorAll('.master-price-edit').forEach(inp=>inp.onchange=e=>{const row=e.target.closest('.master-row');const i=Number(row.dataset.i);const d=getMaster();d[i].price=Math.max(0,Number(String(e.target.value).replace(/\D/g,''))||0);saveMaster(d);openAdmin()});document.querySelectorAll('.master-delete').forEach(btn=>btn.onclick=e=>{const i=Number(e.target.closest('.master-row').dataset.i);const d=getMaster();d.splice(i,1);saveMaster(d);renderMaster()})}
  function addMaster(){const c=$('master-category').value.trim(),s=$('master-sub').value.trim(),p=Math.max(0,Number(String($('master-price').value).replace(/\D/g,''))||0);if(!c||!s)return;const d=getMaster();d.push({category:c,sub:s,price:p});saveMaster(d);$('master-category').value='';$('master-sub').value='';$('master-price').value='';renderMaster()}

  function rewireNav(){
    const nav=document.querySelector('.clean-bottom-nav');if(!nav)return;const home=nav.querySelector('[data-action="home"]');const savings=nav.querySelector('[data-action="savings"]');if(home){home.innerHTML='<span style="font-size:18px">⌂</span><small>Beranda</small>';home.onclick=()=>{closeBook();closeAdmin();$('halaman-beranda')?.scrollTo({top:0,behavior:'smooth'})}}if(savings){savings.innerHTML='<span style="font-size:17px">▤</span><small>Buku Tabungan</small>';savings.onclick=openBook}
  }
  function recycleAdmin(){const home=$('halaman-beranda');if(!home)return;let target=home.querySelector('.profile-section')?.parentElement?.querySelector('.clean-recycle-badge, .recycle-badge, [data-recycle-admin]');if(!target){target=[...home.querySelectorAll('button,div')].find(el=>/♻|recycle/i.test(el.textContent||''))}if(target){target.style.cursor='pointer';target.setAttribute('data-recycle-admin','1');target.onclick=openAdminLogin}}

  function run(){ensurePages();setTimeout(()=>{rewireNav();recycleAdmin()},60);setTimeout(()=>{rewireNav();recycleAdmin()},500);const old=window.bukaBukuSampah;window.bukaBukuSampah=openBook;window.bukaAdminBankSampah=openAdminLogin}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();window.addEventListener('load',run,{once:true});
})();
