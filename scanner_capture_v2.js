// Capture-first scanner v2: OCR foto generik lebih dulu, 7-segment hanya fallback ketat.
(function(){
  'use strict';

  let photoCanvas = null;
  let photoBase64 = null;
  let worker = null;
  let workerLoading = null;
  let busy = false;

  const $ = (id) => document.getElementById(id);

  function setStatus(text, spinner=false){
    const t=$('status-text'); if(t) t.textContent=text;
    const s=$('spinner'); if(s) s.style.display=spinner?'block':'none';
  }

  function ensureTopCaptureButton(){
    const btn=$('btn-capture');
    const actions=document.querySelector('.scanner-actions');
    const panel=document.querySelector('.kamera-bottom-panel');
    if(panel){
      panel.style.position='relative';
      panel.style.zIndex='10020';
      panel.style.pointerEvents='auto';
    }
    if(actions){
      actions.style.position='relative';
      actions.style.zIndex='10030';
      actions.style.pointerEvents='auto';
    }
    if(btn){
      btn.style.position='fixed';
      btn.style.left='50%';
      btn.style.bottom='calc(20px + env(safe-area-inset-bottom))';
      btn.style.transform='translateX(-50%)';
      btn.style.width='calc(100% - 40px)';
      btn.style.maxWidth='320px';
      btn.style.zIndex='10050';
      btn.style.pointerEvents='auto';
      btn.style.boxShadow='0 8px 24px rgba(0,0,0,.38)';
      btn.style.display='block';
    }
  }

  function hideCaptureButton(){
    const btn=$('btn-capture'); if(btn) btn.style.display='none';
  }

  function showCaptureState(){
    ensureTopCaptureButton();
    const retake=$('btn-retake'); if(retake) retake.style.display='none';
    const manual=$('btn-manual'); if(manual) manual.style.display='none';
    const ai=$('btn-ai'); if(ai) ai.style.display='none';
    const next=$('btn-lanjut'); if(next) next.style.display='none';
    const preview=$('capture-preview'); if(preview) preview.style.display='none';
    const result=$('ai-result'); if(result) result.style.display='none';
    const line=$('scan-line'); if(line) line.style.display='block';
    const source=$('scan-source'); if(source) source.textContent='FOTO • OCR LOKAL';
    setStatus('Arahkan angka ke kotak lalu tekan Ambil Gambar.',false);
  }

  function showPhotoState(){
    hideCaptureButton();
    const retake=$('btn-retake'); if(retake) retake.style.display='block';
    const manual=$('btn-manual'); if(manual) manual.style.display='block';
    const line=$('scan-line'); if(line) line.style.display='none';
    const preview=$('capture-preview'); if(preview) preview.style.display='block';
  }

  async function loadTesseract(){
    if(window.Tesseract) return window.Tesseract;
    if(workerLoading) return workerLoading;
    workerLoading=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      s.async=true;
      s.onload=()=>resolve(window.Tesseract);
      s.onerror=()=>reject(new Error('OCR lokal gagal dimuat'));
      document.head.appendChild(s);
    });
    return workerLoading;
  }

  async function getWorker(){
    if(worker) return worker;
    const T=await loadTesseract();
    worker=await T.createWorker('eng',1,{
      logger:m=>{
        if(m.status==='recognizing text' && typeof m.progress==='number'){
          setStatus(`Membaca angka… ${Math.round(m.progress*100)}%`,true);
        }
      }
    });
    await worker.setParameters({
      tessedit_char_whitelist:'0123456789.,',
      tessedit_pageseg_mode:T.PSM ? T.PSM.SINGLE_LINE : '7',
      preserve_interword_spaces:'0'
    });
    return worker;
  }

  function otsu(gray){
    const hist=new Uint32Array(256);
    for(const v of gray) hist[v]++;
    const total=gray.length;
    let sum=0; for(let i=0;i<256;i++) sum+=i*hist[i];
    let sumB=0,wB=0,max=-1,t=128;
    for(let i=0;i<256;i++){
      wB+=hist[i]; if(!wB) continue;
      const wF=total-wB; if(!wF) break;
      sumB+=i*hist[i];
      const mB=sumB/wB,mF=(sum-sumB)/wF;
      const variance=wB*wF*(mB-mF)*(mB-mF);
      if(variance>max){max=variance;t=i;}
    }
    return t;
  }

  function preprocess(src){
    const out=document.createElement('canvas');
    const targetW=1600;
    const targetH=Math.max(300,Math.round(targetW*src.height/src.width));
    out.width=targetW; out.height=targetH;
    const ctx=out.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(src,0,0,targetW,targetH);
    const img=ctx.getImageData(0,0,targetW,targetH);
    const gray=new Uint8Array(targetW*targetH);
    let min=255,max=0;
    for(let i=0,p=0;i<img.data.length;i+=4,p++){
      const g=Math.round(.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2]);
      gray[p]=g; if(g<min)min=g; if(g>max)max=g;
    }
    const span=Math.max(24,max-min);
    for(let i=0;i<gray.length;i++) gray[i]=Math.max(0,Math.min(255,Math.round((gray[i]-min)*255/span)));
    const th=otsu(gray);
    for(let i=0,p=0;i<img.data.length;i+=4,p++){
      const v=gray[p] < th ? 0 : 255;
      img.data[i]=img.data[i+1]=img.data[i+2]=v;
      img.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);
    return out;
  }

  function parseWeight(text){
    if(!text) return null;
    const cleaned=String(text).replace(/\s+/g,'').replace(/,/g,'.');
    const matches=cleaned.match(/\d+(?:\.\d{1,3})?/g);
    if(!matches) return null;
    // Utamakan angka desimal karena timbangan umumnya menampilkan pecahan kg.
    matches.sort((a,b)=>{
      const ad=a.includes('.')?1:0, bd=b.includes('.')?1:0;
      return (bd-ad) || (b.length-a.length);
    });
    for(const m of matches){
      const n=Number(m);
      if(Number.isFinite(n) && n>0 && n<1000) return m;
    }
    return null;
  }

  async function readPhotoLocally(){
    if(!photoCanvas || busy) return;
    busy=true;
    try{
      setStatus('Membaca foto secara lokal…',true);

      // 1) OCR generik lebih dulu. Ini mencegah font biasa seperti 0.650
      //    salah dianggap sebagai pola seven-segment.
      const w=await getWorker();
      const prepared=preprocess(photoCanvas);
      const result=await w.recognize(prepared);
      const raw=result?.data?.text||'';
      const confidence=Number(result?.data?.confidence||0);
      const parsed=parseWeight(raw);
      if(parsed && confidence>=40){
        const src=$('scan-source'); if(src) src.textContent=`OCR FOTO • ${Math.round(confidence)}%`;
        window.suksesScan(parsed,'lokal');
        setStatus('Siap disimpan',false);
        return;
      }

      // 2) Fallback 7-segment hanya bila confidence tinggi DAN hasil punya desimal.
      try{
        if(typeof localScanner!=='undefined' && localScanner && typeof localScanner.analyzeFrame==='function'){
          const seg=localScanner.analyzeFrame();
          if(seg?.text && seg.text.includes('.') && seg.confidence>=0.90){
            const src=$('scan-source'); if(src) src.textContent=`7-SEG • ${Math.round(seg.confidence*100)}%`;
            window.suksesScan(seg.text,'lokal');
            setStatus('Siap disimpan',false);
            return;
          }
        }
      }catch(_){}

      const src=$('scan-source'); if(src) src.textContent='FOTO TERSIMPAN';
      setStatus('Angka belum yakin terbaca. Ambil ulang, gunakan AI 1×, atau input manual.',false);
      const ai=$('btn-ai'); if(ai) ai.style.display='block';
      const manual=$('btn-manual'); if(manual) manual.style.display='block';
    }catch(err){
      console.error('OCR foto lokal gagal:',err);
      setStatus('OCR lokal belum berhasil. Gunakan AI 1× atau input manual.',false);
      const ai=$('btn-ai'); if(ai) ai.style.display='block';
      const manual=$('btn-manual'); if(manual) manual.style.display='block';
    }finally{
      busy=false;
    }
  }

  window.addEventListener('load',()=>{
    const originalStart=window.mulaiKamera;
    const originalClose=window.tutupKamera;
    const originalSave=window.simpanKeDatabase;

    window.mulaiKamera=async function(nama){
      await originalStart(nama);
      try{ if(typeof localScanner!=='undefined'&&localScanner) localScanner.stop(); }catch(_){}
      photoCanvas=null; photoBase64=null; busy=false;
      showCaptureState();
      // Warm-up OCR tanpa menghalangi kamera.
      getWorker().catch(()=>{});
    };

    window.ambilGambarTimbangan=async function(){
      if(busy) return;
      if(typeof localScanner==='undefined' || !localScanner){ setStatus('Kamera belum siap.',false); return; }
      const box=$('scanner-box');
      photoCanvas=document.createElement('canvas');
      const width=1400;
      const ratio=box.clientHeight/Math.max(1,box.clientWidth);
      const height=Math.round(width*ratio);
      if(!localScanner.drawCrop(photoCanvas,width,height)){ setStatus('Gagal mengambil gambar. Coba lagi.',false); return; }
      photoBase64=photoCanvas.toDataURL('image/jpeg',.94).split(',')[1];

      const preview=$('capture-preview');
      if(preview){
        preview.width=photoCanvas.width; preview.height=photoCanvas.height;
        preview.getContext('2d').drawImage(photoCanvas,0,0);
        preview.style.display='block';
      }
      try{$('kamera-video').pause();}catch(_){}
      try{localScanner.stop();}catch(_){}
      showPhotoState();
      await readPhotoLocally();
    };

    window.ambilUlangTimbangan=function(){
      photoCanvas=null; photoBase64=null; busy=false;
      const preview=$('capture-preview'); if(preview) preview.style.display='none';
      try{$('kamera-video').play();}catch(_){}
      showCaptureState();
    };

    window.mintaBantuanAI=async function(){
      if(!photoBase64){ setStatus('Ambil gambar dulu sebelum memakai AI.',false); return; }
      const btn=$('btn-ai');
      if(btn){btn.disabled=true;btn.textContent='✨ AI sedang membaca…';}
      setStatus('Membaca foto dengan AI…',true);
      try{
        const response=await fetch('/.netlify/functions/gemini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:photoBase64})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok||data.error){
          setStatus((data.status||response.status)===429?'Kuota AI sedang penuh. Gunakan input manual.':'AI belum berhasil membaca. Gunakan input manual.',false);
          return;
        }
        const text=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'';
        const parsed=parseWeight(text);
        if(parsed){ window.suksesScan(parsed,'AI'); setStatus('Siap disimpan',false); }
        else setStatus('AI belum yakin. Gunakan input manual.',false);
      }catch(err){
        console.error(err); setStatus('Koneksi AI bermasalah. Gunakan input manual.',false);
      }finally{
        if(btn){btn.disabled=false;btn.textContent='✨ Bantu Baca dengan AI (1×)';}
      }
    };

    window.tutupKamera=function(){
      photoCanvas=null; photoBase64=null; busy=false;
      return originalClose();
    };

    function toastSaved(){
      let toast=$('weight-saved-toast');
      if(!toast){
        toast=document.createElement('div');
        toast.id='weight-saved-toast';
        toast.style.cssText='position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:20000;background:#173f2b;color:#fff;padding:14px 22px;border-radius:28px;font-weight:800;box-shadow:0 8px 28px rgba(0,0,0,.35);white-space:nowrap;opacity:0;transition:opacity .2s ease;';
        document.body.appendChild(toast);
      }
      toast.textContent='Timbangan Berhasil Dicatat';
      toast.style.opacity='1';
      setTimeout(()=>{toast.style.opacity='0';},2200);
    }

    window.simpanKeDatabase=function(){
      originalSave();
      toastSaved();
    };
  });
})();
