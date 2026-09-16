// Base app v25: profile, categories, camera globals, and fallback functions.
'use strict';

window.dbSubKategori={
  'Kertas & Karton':[ {name:'Koran',icon:'📰'}, {name:'Kertas HVS',icon:'📄'}, {name:'Sak Semen',icon:'🛍️'}, {name:'Kertas Buram',icon:'📜'}, {name:'Majalah',icon:'🖵'}, {name:'Duplek',icon:'📦'} ],
  'Plastik Botol':[ {name:'PET Putih Bening',icon:'🍾'}, {name:'PET Biru Muda',icon:'🧴'}, {name:'PET Biru/Hijau',icon:'🫙'}, {name:'PET Kotor',icon:'🗑️'}, {name:'PET Minyak',icon:'🛢️'}, {name:'Botol Sirup',icon:'🍷'}, {name:'Botol Kecap',icon:'🍶'}, {name:'Beling Warna',icon:'🍼'} ],
  'Lembaran & Kemasan':[ {name:'Plastik Bening',icon:'🛍️'}, {name:'Plastik Kresek',icon:'🗑️'}, {name:'Sablon Tipis',icon:'🏷️'}, {name:'Plastik Foil',icon:'🍬'}, {name:'Plastik Karung',icon:'🌾'} ],
  'Keras, Ember & Tutup':[ {name:'Plastik PS',icon:'🥡'}, {name:'Tutup Galon',icon:'⏺️'}, {name:'Tutup Botol',icon:'🔘'}, {name:'Keping CD',icon:'💿'}, {name:'Bak / Ember',icon:'🪣'}, {name:'Galon / Pipa',icon:'🚰'} ],
  'Logam & Aluminium':[ {name:'Tembaga',icon:'🟤'}, {name:'Perunggu / Wajan',icon:'🍳'}, {name:'Kuningan',icon:'🔑'}, {name:'Plat Aluminium',icon:'📐'}, {name:'Kaleng / Panci',icon:'🥫'}, {name:'Besi Tebal',icon:'⛓️'} ],
  'Organik & Lainnya':[ {name:'Minyak Jelantah',icon:'🛢️'}, {name:'Karak / Nasi',icon:'🍚'}, {name:'Sepatu Bekas',icon:'👞'} ]
};

var streamKamera=null;
var localScanner=null;
var jenisSampahAktif='';
var beratTerbaca=0;
var beratTeksTerbaca='';
var torchAktif=false;

const $=id=>document.getElementById(id);
const inputNama=$('input-nama');
const inputUnit=$('input-unit');
const dropdownList=$('dropdown-list');

function getNamaPanggilan(fullName){const w=String(fullName||'').trim().split(/\s+/);return w.length>1?w[1]:w[0]||'Pegawai';}

if(inputNama){
  inputNama.addEventListener('input',function(){
    const q=this.value.trim().toLowerCase();
    dropdownList.innerHTML='';
    if(!q){dropdownList.style.display='none';inputUnit.value='';return;}
    const hasil=(typeof dataPegawai!=='undefined')?dataPegawai.filter(p=>(p.nama||'').toLowerCase().includes(q)||(p.unit||'').toLowerCase().includes(q)):[];
    if(!hasil.length){dropdownList.style.display='none';return;}
    dropdownList.style.display='block';
    hasil.slice(0,15).forEach(p=>{
      const d=document.createElement('div');d.className='dropdown-item';
      d.innerHTML=`<div class="item-nama">${p.nama}</div><div class="item-unit">📍 ${p.unit}</div>`;
      d.onclick=()=>{inputNama.value=p.nama;inputUnit.value=p.unit;dropdownList.style.display='none';};
      dropdownList.appendChild(d);
    });
  });
}

window.muatDataRekap=function(){
  let riwayat=[];try{riwayat=JSON.parse(localStorage.getItem('riwayat_setor')||'[]');}catch(_){}
  const total=(Array.isArray(riwayat)?riwayat:[]).reduce((s,i)=>s+(Number(i.berat)||0),0);
  if($('teks-total'))$('teks-total').textContent=total.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')+' Kg';
  if($('teks-terakhir')){
    if(riwayat.length){const t=new Date(riwayat[riwayat.length-1].waktu);$('teks-terakhir').textContent=`${t.getDate()}/${t.getMonth()+1}/${t.getFullYear()}`;}
    else $('teks-terakhir').textContent='Belum ada';
  }
};

window.simpanProfil=function(){
  if(!inputNama?.value||!inputUnit?.value)return alert('Silakan pilih nama dari daftar!');
  localStorage.setItem('userBankSampah',JSON.stringify({nama:inputNama.value,unit:inputUnit.value}));
  window.tampilBeranda(inputNama.value,inputUnit.value);
};

window.tampilBeranda=function(nama,unit){
  if($('form-login'))$('form-login').style.display='none';
  if($('halaman-beranda'))$('halaman-beranda').style.display='block';
  const p=getNamaPanggilan(nama);if($('teks-sapa'))$('teks-sapa').textContent=`Halo, ${p.charAt(0).toUpperCase()+p.slice(1).toLowerCase()}`;
  if($('teks-unit'))$('teks-unit').textContent=`📍 ${unit}`;
  window.muatDataRekap();
};

window.bukaModal=function(kategori){
  if($('modal-title'))$('modal-title').textContent=kategori;
  if($('modal-list'))$('modal-list').innerHTML=(window.dbSubKategori[kategori]||[]).map(i=>`<div class="subcat-card" onclick="mulaiKamera('${i.name.replace(/'/g,"\\'")}')"><div class="subcat-icon">${i.icon}</div><div class="subcat-name">${i.name}</div></div>`).join('');
  if($('modal-subkategori'))$('modal-subkategori').style.display='flex';
};
window.tutupModal=function(e){if(e.target.id==='modal-subkategori')window.tutupModalPaksa();};
window.tutupModalPaksa=function(){if($('modal-subkategori'))$('modal-subkategori').style.display='none';};

window.setStatus=function(text,showSpinner=true){if($('status-text'))$('status-text').textContent=text;if($('spinner'))$('spinner').style.display=showSpinner?'block':'none';};
window.tampilkanFallback=function(){if($('btn-manual'))$('btn-manual').style.display='block';};
window.sembunyikanFallback=function(){if($('btn-manual'))$('btn-manual').style.display='none';};

window.mulaiKamera=async function(namaSampah){
  window.tutupModalPaksa();jenisSampahAktif=namaSampah;beratTerbaca=0;beratTeksTerbaca='';
  if($('camera-ui'))$('camera-ui').style.display='block';
  window.setStatus('Menyiapkan kamera…',true);
};

window.suksesScan=function(nilaiTeks,sumber='lokal'){
  const normalized=String(nilaiTeks).trim().replace(',','.');const numeric=Number(normalized);if(!Number.isFinite(numeric)||numeric<=0)return;
  beratTeksTerbaca=normalized;beratTerbaca=numeric;
  if($('ai-result')){$('ai-result').innerHTML=`${beratTeksTerbaca} <span>Kg</span>`;$('ai-result').style.display='block';}
  if($('btn-lanjut'))$('btn-lanjut').style.display='block';
  window.setStatus(sumber==='manual'?'Berat berhasil diinput manual.':'Berat terbaca. Simpan atau koreksi manual.',false);
};

window.inputManual=function(){
  const manual=prompt(`Masukkan berat ${jenisSampahAktif} dalam Kg. Contoh: 0,260 atau 2,5.`,'0,000');if(manual===null)return;
  const raw=String(manual).trim().replace(',','.');if(!/^\d+(?:\.\d{1,3})?$/.test(raw)||Number(raw)<=0)return alert('Berat tidak valid.');window.suksesScan(raw,'manual');
};

window.toggleTorch=async function(){
  if(!streamKamera)return;const track=streamKamera.getVideoTracks()[0];const caps=track.getCapabilities?track.getCapabilities():{};if(!caps.torch)return;
  torchAktif=!torchAktif;try{await track.applyConstraints({advanced:[{torch:torchAktif}]});}catch(_){torchAktif=false;}
};

window.tutupKamera=function(){
  try{if(localScanner){localScanner.stop();localScanner=null;}}catch(_){}
  try{if(streamKamera){streamKamera.getTracks().forEach(t=>t.stop());streamKamera=null;}}catch(_){}
  if($('camera-ui'))$('camera-ui').style.display='none';
};

window.simpanKeDatabase=function(){
  let r=[];try{r=JSON.parse(localStorage.getItem('riwayat_setor')||'[]');}catch(_){}
  r.push({jenis:jenisSampahAktif,berat:beratTerbaca,berat_tampilan:beratTeksTerbaca,waktu:new Date().toISOString()});localStorage.setItem('riwayat_setor',JSON.stringify(r));window.tutupKamera();window.muatDataRekap();
};

window.addEventListener('load',()=>{try{const s=localStorage.getItem('userBankSampah');if(s){const u=JSON.parse(s);window.tampilBeranda(u.nama,u.unit);}}catch(_){}});
