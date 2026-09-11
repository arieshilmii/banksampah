// Capture-first scanner patch is initialized after the page's inline app script finishes.
(function(){
  'use strict';

  let capturedCanvas = null;
  let capturedBase64 = null;
  let previewCanvas = null;
  let tesseractWorker = null;
  let tesseractLoading = null;
  let ocrBusy = false;
  let originalMulaiKamera = null;
  let originalTutupKamera = null;
  let originalMintaBantuanAI = null;

  function ensureUI(){
    const actions = document.querySelector('.scanner-actions');
    const scannerBox = document.getElementById('scanner-box');
    if(!actions || !scannerBox) return;

    if(!document.getElementById('btn-capture')){
      const capture = document.createElement('button');
      capture.id='btn-capture';
      capture.type='button';
      capture.textContent='📸 Ambil Gambar';
      capture.style.cssText='width:100%;border-radius:28px;padding:15px 18px;cursor:pointer;font-weight:800;background:#00d978;color:#08291a;border:0;display:block;font-size:15px;';
      capture.onclick=()=>window.ambilGambarTimbangan();
      actions.insertBefore(capture, actions.firstChild);
    }

    if(!document.getElementById('btn-retake')){
      const retake = document.createElement('button');
      retake.id='btn-retake';
      retake.type='button';
      retake.textContent='↻ Ambil Ulang';
      retake.style.cssText='width:100%;border-radius:28px;padding:13px 18px;cursor:pointer;font-weight:750;background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.38);display:none;';
      retake.onclick=()=>window.ambilUlangTimbangan();
      const manual = document.getElementById('btn-manual');
      actions.insertBefore(retake, manual || null);
    }

    if(!document.getElementById('capture-preview')){
      previewCanvas = document.createElement('canvas');
      previewCanvas.id='capture-preview';
      previewCanvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:none;border-radius:12px;z-index:2;background:#fff;';
      scannerBox.appendChild(previewCanvas);
    } else previewCanvas=document.getElementById('capture-preview');

    const small=document.querySelector('.kamera-title-area small');
    if(small) small.textContent='Foto dulu • OCR lokal • AI hanya bila diperlukan';
    const tip=document.getElementById('scanner-tip');
    if(tip) tip.textContent='Arahkan angka ke kotak, lalu tekan Ambil Gambar. Setelah foto dibekukan, aplikasi membaca angka secara lokal.';
  }

  function setStatusPatch(text, spinner=false){
    const el=document.getElementById('status-text'); if(el) el.textContent=text;
    const sp=document.getElementById('spinner'); if(sp) sp.style.display=spinner?'block':'none';
  }

  function showCaptureMode(){
    const capture=document.getElementById('btn-capture');
    const retake=document.getElementById('btn-retake');
    const manual=document.getElementById('btn-manual');
    const ai=document.getElementById('btn-ai');
    const lanjut=document.getElementById('btn-lanjut');
    if(capture) capture.style.display='block';
    if(retake) retake.style.display='none';
    if(manual) manual.style.display='block';
    if(ai) ai.style.display='none';
    if(lanjut) lanjut.style.display='none';
    if(previewCanvas) previewCanvas.style.display='none';
    const line=document.getElementById('scan-line'); if(line) line.style.display='block';
    const result=document.getElementById('ai-result'); if(result) result.style.display='none';
    const source=document.getElementById('scan-source'); if(source) source.textContent='CAPTURE-FIRST • LOCAL OCR';
    setStatusPatch('Arahkan angka ke kotak lalu tekan Ambil Gambar.',false);
  }

  function showCapturedMode(){
    const capture=document.getElementById('btn-capture');
    const retake=document.getElementById('btn-retake');
    if(capture) capture.style.display='none';
    if(retake) retake.style.display='block';
    const line=document.getElementById('scan-line'); if(line) line.style.display='none';
    if(previewCanvas) previewCanvas.style.display='block';
  }

  async function lazyLoadTesseract(){
    if(window.Tesseract) return window.Tesseract;
    if(tesseractLoading) return tesseractLoading;
    tesseractLoading=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      s.async=true;
      s.onload=()=>resolve(window.Tesseract);
      s.onerror=()=>reject(new Error('Gagal memuat OCR lokal'));
      document.head.appendChild(s);
    });
    return tesseractLoading;
  }

  async function getWorker(){
    if(tesseractWorker) return tesseractWorker;
    const T=await lazyLoadTesseract();
    tesseractWorker=await T.createWorker('eng', 1, {
      logger:m=>{
        if(m.status==='recognizing text' && typeof m.progress==='number'){
          setStatusPatch(`Membaca angka lokal… ${Math.round(m.progress*100)}%`,true);
        }
      }
    });
    await tesseractWorker.setParameters({
      tessedit_char_whitelist:'0123456789.,',
      tessedit_pageseg_mode: T.PSM ? T.PSM.SINGLE_LINE : '7',
      preserve_interword_spaces:'0'
    });
    return tesseractWorker;
  }

  function otsu(gray){
    const hist=new Uint32Array(256); gray.forEach(v=>hist[v]++);
    const total=gray.length; let sum=0; for(let i=0;i<256;i++) sum+=i*hist[i];
    let sumB=0,wB=0,max=-1,t=128;
    for(let i=0;i<256;i++){
      wB+=hist[i]; if(!wB) continue; const wF=total-wB; if(!wF) break;
      sumB+=i*hist[i]; const mB=sumB/wB,mF=(sum-sumB)/wF;
      const v=wB*wF*(mB-mF)*(mB-mF); if(v>max){max=v;t=i;}
    }
    return t;
  }

  function preprocessForOCR(src){
    const out=document.createElement('canvas');
    const targetW=1400;
    const targetH=Math.max(260,Math.round(targetW*src.height/src.width));
    out.width=targetW; out.height=targetH;
    const ctx=out.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(src,0,0,targetW,targetH);
    const img=ctx.getImageData(0,0,targetW,targetH);
    const gray=new Uint8Array(targetW*targetH);
    let min=255,max=0;
    for(let i=0,p=0;i<img.data.length;i+=4,p++){
      const g=Math.round(.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2]);
      gray[p]=g; if(g<min)min=g; if(g>max)max=g;
    }
    const span=Math.max(20,max-min);
    for(let i=0;i<gray.length;i++) gray[i]=Math.max(0,Math.min(255,Math.round((gray[i]-min)*255/span)));
    const th=otsu(gray);
    for(let i=0,p=0;i<img.data.length;i+=4,p++){
      const v=gray[p] < th ? 0 : 255;
      img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);
    return out;
  }

  function parseWeight(text){
    if(!text) return null;
    const cleaned=String(text).replace(/\s+/g,'').replace(/,/g,'.');
    const matches=cleaned.match(/\d+(?:\.\d{1,3})?/g);
    if(!matches||!matches.length) return null;
    const ranked=matches.sort((a,b)=>b.length-a.length);
    for(const m of ranked){ const n=Number(m); if(Number.isFinite(n)&&n>0&&n<10000) return m; }
    return null;
  }

  async function localOCRStill(){
    if(!capturedCanvas || ocrBusy) return;
    ocrBusy=true;
    try{
      setStatusPatch('Menganalisis foto secara lokal…',true);

      // Pertama coba pembaca seven-segment yang sudah ada pada frame beku.
      try{
        if(typeof localScanner!=='undefined' && localScanner && typeof localScanner.analyzeFrame==='function'){
          const seg=localScanner.analyzeFrame();
          if(seg?.text && seg.confidence>=0.70){
            const src=document.getElementById('scan-source'); if(src) src.textContent=`LOCAL 7-SEG • ${Math.round(seg.confidence*100)}%`;
            suksesScan(seg.text,'lokal');
            return;
          }
        }
      }catch(e){ console.debug('7-seg OCR tidak cocok:',e); }

      // Lalu OCR generik lokal untuk font biasa maupun LCD yang jelas.
      const worker=await getWorker();
      const prepared=preprocessForOCR(capturedCanvas);
      const result=await worker.recognize(prepared);
      const raw=result?.data?.text||'';
      const weight=parseWeight(raw);
      const conf=Number(result?.data?.confidence||0);
      if(weight && conf>=45){
        const src=document.getElementById('scan-source'); if(src) src.textContent=`LOCAL OCR FOTO • ${Math.round(conf)}%`;
        suksesScan(weight,'lokal');
        return;
      }

      const source=document.getElementById('scan-source'); if(source) source.textContent='FOTO TERSIMPAN • OCR BELUM YAKIN';
      setStatusPatch('Angka belum terbaca dengan yakin. Coba Ambil Ulang, AI 1×, atau input manual.',false);
      const manual=document.getElementById('btn-manual'); if(manual) manual.style.display='block';
      const ai=document.getElementById('btn-ai'); if(ai) ai.style.display='block';
    }catch(err){
      console.error('OCR foto lokal gagal:',err);
      setStatusPatch('OCR lokal belum berhasil. Foto tetap tersimpan; kamu bisa pakai AI 1× atau input manual.',false);
      const manual=document.getElementById('btn-manual'); if(manual) manual.style.display='block';
      const ai=document.getElementById('btn-ai'); if(ai) ai.style.display='block';
    }finally{ ocrBusy=false; }
  }

  window.ambilGambarTimbangan=async function(){
    if(ocrBusy) return;
    if(typeof localScanner==='undefined' || !localScanner){
      setStatusPatch('Kamera belum siap.',false); return;
    }
    capturedCanvas=document.createElement('canvas');
    const width=1200;
    const ratio=document.getElementById('scanner-box').clientHeight/Math.max(1,document.getElementById('scanner-box').clientWidth);
    const height=Math.round(width*ratio);
    if(!localScanner.drawCrop(capturedCanvas,width,height)){
      setStatusPatch('Gagal mengambil gambar. Coba lagi.',false); return;
    }
    capturedBase64=capturedCanvas.toDataURL('image/jpeg',.93).split(',')[1];

    if(!previewCanvas) previewCanvas=document.getElementById('capture-preview');
    previewCanvas.width=capturedCanvas.width; previewCanvas.height=capturedCanvas.height;
    previewCanvas.getContext('2d').drawImage(capturedCanvas,0,0);
    const video=document.getElementById('kamera-video'); try{video.pause();}catch(_){}
    if(typeof localScanner!=='undefined'&&localScanner) localScanner.stop();
    showCapturedMode();
    const source=document.getElementById('scan-source'); if(source) source.textContent='FOTO DIBEKUKAN • OCR LOKAL';
    await localOCRStill();
  };

  window.ambilUlangTimbangan=function(){
    capturedCanvas=null; capturedBase64=null; ocrBusy=false;
    const video=document.getElementById('kamera-video');
    if(previewCanvas) previewCanvas.style.display='none';
    try{video.play();}catch(_){}
    showCaptureMode();
  };

  async function aiFromCaptured(){
    if(!capturedBase64){
      setStatusPatch('Ambil gambar dulu sebelum memakai bantuan AI.',false); return;
    }
    if(typeof aiSedangProses!=='undefined' && aiSedangProses) return;
    aiSedangProses=true;
    const btn=document.getElementById('btn-ai'); if(btn){btn.disabled=true;btn.textContent='✨ AI sedang membaca foto…';}
    const src=document.getElementById('scan-source'); if(src) src.textContent='GEMINI FALLBACK • 1 FOTO';
    setStatusPatch('Mengirim foto yang sudah dibekukan ke AI…',true);
    try{
      const response=await fetch('/.netlify/functions/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:capturedBase64})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.error){
        if((data.status||response.status)===429) setStatusPatch('Kuota AI sedang penuh. Ambil ulang foto atau input manual.',false);
        else setStatusPatch('AI belum berhasil membaca foto. Ambil ulang atau input manual.',false);
        return;
      }
      const text=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'';
      const weight=parseWeight(text);
      if(weight) suksesScan(weight,'AI');
      else setStatusPatch('AI tidak yakin pada angkanya. Ambil ulang atau input manual.',false);
    }catch(err){
      console.error(err); setStatusPatch('Koneksi AI bermasalah. Foto tetap aman; gunakan input manual.',false);
    }finally{
      aiSedangProses=false;
      if(btn){btn.disabled=false;btn.textContent='✨ Bantu Baca dengan AI (1×)';}
    }
  }

  window.addEventListener('load',()=>{
    ensureUI();
    originalMulaiKamera=window.mulaiKamera;
    originalTutupKamera=window.tutupKamera;
    originalMintaBantuanAI=window.mintaBantuanAI;

    window.mulaiKamera=async function(namaSampah){
      // Jalankan setup kamera yang sudah stabil, lalu hentikan loop OCR live.
      await originalMulaiKamera(namaSampah);
      try{ if(typeof localScanner!=='undefined'&&localScanner) localScanner.stop(); }catch(_){}
      capturedCanvas=null; capturedBase64=null; ocrBusy=false;
      if(previewCanvas) previewCanvas.style.display='none';
      showCaptureMode();
    };

    window.tutupKamera=function(){
      capturedCanvas=null; capturedBase64=null; ocrBusy=false;
      if(previewCanvas) previewCanvas.style.display='none';
      return originalTutupKamera();
    };

    window.mintaBantuanAI=aiFromCaptured;
  });
})();
