// Universal OCR v7: one local OCR pipeline for ordinary fonts and digital scale displays.
// Primary engine: official PaddleOCR.js / PP-OCRv5 in browser. Generic Tesseract fallback only if needed.
(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  let paddle = null;
  let paddleLoading = null;
  let tesseractWorker = null;
  let tesseractLoading = null;
  let busy = false;
  let captureCanvas = null;

  function setStatus(text, spinner=false){
    const t=$('status-text'); if(t) t.textContent=text;
    const s=$('spinner'); if(s) s.style.display=spinner?'block':'none';
  }

  function ensureUI(){
    const actions=document.querySelector('.scanner-actions');
    const box=$('scanner-box');
    if(!actions || !box) return;

    let capture=$('btn-capture');
    if(!capture){
      capture=document.createElement('button');
      capture.id='btn-capture';
      capture.type='button';
      capture.textContent='📸 Ambil Gambar';
      capture.style.cssText='position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);width:calc(100% - 40px);max-width:320px;z-index:14000;border:0;border-radius:28px;padding:15px 18px;background:#20d979;color:#052315;font-weight:850;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.34);cursor:pointer;';
      capture.onclick=()=>window.ambilGambarTimbangan();
      actions.insertBefore(capture,actions.firstChild);
    }

    let preview=$('capture-preview');
    if(!preview){
      preview=document.createElement('canvas');
      preview.id='capture-preview';
      preview.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:none;border-radius:12px;z-index:3;background:#fff;';
      box.appendChild(preview);
    }

    const small=document.querySelector('.kamera-title-area small');
    if(small) small.textContent='Foto dulu • Universal OCR lokal';
    const tip=$('scanner-tip');
    if(tip) tip.textContent='Posisikan angka di dalam kotak lalu tekan Ambil Gambar. Jika hasil kurang tepat, gunakan Input / Koreksi Manual.';
  }

  function resetCaptureUI(){
    ensureUI();
    captureCanvas=null;
    busy=false;
    const preview=$('capture-preview'); if(preview) preview.style.display='none';
    const result=$('ai-result'); if(result) result.style.display='none';
    const next=$('btn-lanjut'); if(next) next.style.display='none';
    const manual=$('btn-manual'); if(manual) manual.style.display='none';
    const line=$('scan-line'); if(line) line.style.display='block';
    const source=$('scan-source'); if(source) source.textContent='UNIVERSAL OCR';
  }

  function capturedUI(){
    const capture=$('btn-capture'); if(capture) capture.style.display='none';
    const line=$('scan-line'); if(line) line.style.display='none';
    const preview=$('capture-preview'); if(preview) preview.style.display='block';
  }

  function failureUI(){
    const source=$('scan-source'); if(source) source.textContent='UNIVERSAL OCR • BELUM TERBACA';
    setStatus('Angka belum terbaca. Silakan input berat manual.',false);
    const manual=$('btn-manual'); if(manual){ manual.style.display='block'; manual.textContent='⌨️ Input / Koreksi Manual'; }
    const next=$('btn-lanjut'); if(next) next.style.display='none';
  }

  async function loadPaddle(){
    if(paddle) return paddle;
    if(paddleLoading) return paddleLoading;
    paddleLoading=(async()=>{
      setStatus('Memuat Universal OCR lokal…',true);
      const mod=await import('https://cdn.jsdelivr.net/npm/@paddleocr/paddleocr-js@0.4.2/+esm');
      if(!mod?.PaddleOCR) throw new Error('PaddleOCR SDK tidak tersedia');
      paddle=await mod.PaddleOCR.create({
        lang:'en',
        ocrVersion:'PP-OCRv5',
        worker:false,
        textDetectionBatchSize:1,
        textRecognitionBatchSize:4,
        ortOptions:{
          backend:'wasm',
          wasmPaths:'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/',
          numThreads:1,
          simd:true
        }
      });
      return paddle;
    })().catch(err=>{
      console.warn('PP-OCRv5 init gagal; fallback OCR lokal akan digunakan.',err);
      paddleLoading=null;
      throw err;
    });
    return paddleLoading;
  }

  async function loadTesseract(){
    if(tesseractWorker) return tesseractWorker;
    if(tesseractLoading) return tesseractLoading;
    tesseractLoading=(async()=>{
      if(!window.Tesseract){
        await new Promise((resolve,reject)=>{
          const s=document.createElement('script');
          s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          s.async=true;
          s.onload=resolve;
          s.onerror=()=>reject(new Error('Fallback OCR gagal dimuat'));
          document.head.appendChild(s);
        });
      }
      tesseractWorker=await window.Tesseract.createWorker('eng',1,{
        logger:m=>{
          if(m.status==='recognizing text' && typeof m.progress==='number'){
            setStatus(`Membaca angka lokal… ${Math.round(m.progress*100)}%`,true);
          }
        }
      });
      await tesseractWorker.setParameters({
        tessedit_char_whitelist:'0123456789.,OoQDIil|SBGkgKG ',
        tessedit_pageseg_mode:window.Tesseract.PSM ? window.Tesseract.PSM.SINGLE_LINE : '7',
        preserve_interword_spaces:'1'
      });
      return tesseractWorker;
    })().catch(err=>{ tesseractLoading=null; throw err; });
    return tesseractLoading;
  }

  function drawScaled(src,targetW=1100){
    const c=document.createElement('canvas');
    c.width=targetW;
    c.height=Math.max(220,Math.round(targetW*src.height/src.width));
    const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(src,0,0,c.width,c.height);
    return c;
  }

  function makeVariant(src,mode){
    const c=drawScaled(src,1100);
    if(mode==='original') return c;
    const ctx=c.getContext('2d',{willReadFrequently:true});
    const img=ctx.getImageData(0,0,c.width,c.height);
    const gray=new Uint8Array(c.width*c.height);
    let min=255,max=0;
    for(let i=0,p=0;i<img.data.length;i+=4,p++){
      const g=Math.round(.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2]);
      gray[p]=g; if(g<min)min=g; if(g>max)max=g;
    }
    const span=Math.max(35,max-min);
    const hist=new Uint32Array(256);
    for(let i=0;i<gray.length;i++){
      gray[i]=Math.max(0,Math.min(255,Math.round((gray[i]-min)*255/span)));
      hist[gray[i]]++;
    }
    let total=gray.length,sum=0; for(let i=0;i<256;i++)sum+=i*hist[i];
    let sumB=0,wB=0,best=-1,th=128;
    for(let i=0;i<256;i++){
      wB+=hist[i]; if(!wB)continue;
      const wF=total-wB; if(!wF)break;
      sumB+=i*hist[i]; const mB=sumB/wB,mF=(sum-sumB)/wF;
      const v=wB*wF*(mB-mF)*(mB-mF); if(v>best){best=v;th=i;}
    }
    for(let i=0,p=0;i<img.data.length;i+=4,p++){
      let v;
      if(mode==='gray') v=gray[p];
      else if(mode==='binary') v=gray[p] < th ? 0 : 255;
      else v=gray[p] < th ? 255 : 0;
      img.data[i]=img.data[i+1]=img.data[i+2]=v;
      img.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);
    return c;
  }

  function normalizeNumericText(raw){
    if(!raw) return '';
    let s=String(raw).trim();
    s=s.replace(/kg/ig,'').replace(/[，,]/g,'.').replace(/[：:;]/g,'.');
    // Correct common OCR confusions only when the token already contains a digit.
    if(/\d/.test(s)){
      s=s.replace(/[OoQD]/g,'0').replace(/[Il|!]/g,'1').replace(/[Ss]/g,'5').replace(/[Bb]/g,'8').replace(/[Gg]/g,'6');
    }
    // Decimal point sometimes disappears into whitespace: "0 260" -> "0.260".
    s=s.replace(/\b(\d)\s+(\d{3})\b/g,'$1.$2');
    s=s.replace(/\s+/g,'');
    return s;
  }

  function polyStats(poly,width,height){
    if(!Array.isArray(poly)||!poly.length) return {center:0.5,area:0.1};
    const pts=poly.map(p=>Array.isArray(p)?p:[p.x,p.y]).filter(p=>Number.isFinite(Number(p[0]))&&Number.isFinite(Number(p[1])));
    if(!pts.length) return {center:0.5,area:0.1};
    const xs=pts.map(p=>Number(p[0])),ys=pts.map(p=>Number(p[1]));
    const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const cx=(x0+x1)/2/Math.max(1,width),cy=(y0+y1)/2/Math.max(1,height);
    const dist=Math.hypot(cx-.5,(cy-.5)*.8);
    const center=Math.max(0,1-dist*1.8);
    const area=Math.min(1,((x1-x0)*(y1-y0))/Math.max(1,width*height)*8);
    return {center,area};
  }

  function extractCandidates(text,ocrScore=0.5,meta={}){
    const out=[];
    let normalized=normalizeNumericText(text);
    if(!normalized) return out;

    const variants=[normalized];
    // If OCR misses the dot in a common 0xxx scale display, recover it conservatively.
    if(/^0\d{3}$/.test(normalized)) variants.push(`${normalized[0]}.${normalized.slice(1)}`);

    for(const source of variants){
      const matches=source.match(/\d{1,4}(?:\.\d{1,3})?/g)||[];
      for(let display of matches){
        if(!display.includes('.') && display.length===1) continue;
        const value=Number(display);
        if(!Number.isFinite(value)||value<=0||value>=10000) continue;
        let score=Math.max(0,Math.min(1,Number(ocrScore)||0));
        if(display.includes('.')) score+=.35;
        if(display.length>=4) score+=.13;
        if(display.length===1) score-=.45;
        score+=(meta.center||0)*.16+(meta.area||0)*.08;
        if(/^0\.\d{3}$/.test(display)) score+=.08;
        out.push({display,value,score,raw:String(text),engine:meta.engine||'ocr'});
      }
    }
    return out;
  }

  function chooseCandidate(candidates){
    if(!candidates.length) return null;
    const groups=new Map();
    for(const c of candidates){
      const key=(Math.round(c.value*1000)/1000).toFixed(3);
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(c);
    }
    const ranked=[];
    for(const [key,items] of groups){
      const best=[...items].sort((a,b)=>b.score-a.score)[0];
      const count=items.length;
      const engineCount=new Set(items.map(i=>i.engine)).size;
      const consensus=Math.min(.55,(count-1)*.16+(engineCount-1)*.12);
      const finalScore=best.score+consensus;
      const display=[...items].sort((a,b)=>{
        const ad=(a.display.split('.')[1]||'').length,bd=(b.display.split('.')[1]||'').length;
        return bd-ad || b.score-a.score;
      })[0].display;
      ranked.push({key,display,value:best.value,finalScore,count,best});
    }
    ranked.sort((a,b)=>b.finalScore-a.finalScore);
    const top=ranked[0];
    const second=ranked[1];
    const margin=second?top.finalScore-second.finalScore:top.finalScore;
    if(top.count>=2 && top.finalScore>=.85) return top;
    if(top.display.includes('.') && top.best.score>=1.15 && margin>=.18) return top;
    if(top.best.score>=1.35 && margin>=.22) return top;
    return null;
  }

  async function paddleCandidates(variants){
    const engine=await loadPaddle();
    setStatus('Universal OCR sedang membaca…',true);
    const results=await engine.predict(variants,{
      textDetLimitSideLen:960,
      textDetLimitType:'max',
      textDetThresh:.22,
      textDetBoxThresh:.30,
      textDetUnclipRatio:1.25,
      textRecScoreThresh:.15
    });
    const candidates=[];
    (results||[]).forEach((result,variantIndex)=>{
      const width=result?.image?.width||variants[variantIndex]?.width||1;
      const height=result?.image?.height||variants[variantIndex]?.height||1;
      const items=Array.isArray(result?.items)?result.items:[];
      const joined=items.map(i=>i.text||'').join(' ');
      if(joined){
        const avgScore=items.length?items.reduce((s,i)=>s+(Number(i.score)||0),0)/items.length:.35;
        candidates.push(...extractCandidates(joined,avgScore,{center:.6,area:.3,engine:`paddle-${variantIndex}`}));
      }
      for(const item of items){
        const ps=polyStats(item.poly,width,height);
        candidates.push(...extractCandidates(item.text,item.score,{...ps,engine:`paddle-${variantIndex}`}));
      }
    });
    return candidates;
  }

  async function tesseractCandidates(variants){
    const worker=await loadTesseract();
    const candidates=[];
    for(let i=0;i<Math.min(2,variants.length);i++){
      setStatus(`Fallback OCR lokal ${i+1}/2…`,true);
      const r=await worker.recognize(variants[i]);
      const text=r?.data?.text||'';
      const conf=Math.max(0,Math.min(1,(Number(r?.data?.confidence)||0)/100));
      candidates.push(...extractCandidates(text,conf,{center:.65,area:.35,engine:`tesseract-${i}`}));
      const words=Array.isArray(r?.data?.words)?r.data.words:[];
      for(const w of words){
        const bbox=w.bbox||{};
        const cx=((bbox.x0||0)+(bbox.x1||0))/2/Math.max(1,variants[i].width);
        const cy=((bbox.y0||0)+(bbox.y1||0))/2/Math.max(1,variants[i].height);
        const center=Math.max(0,1-Math.hypot(cx-.5,(cy-.5)*.8)*1.8);
        const area=Math.min(1,Math.max(0,((bbox.x1||0)-(bbox.x0||0))*((bbox.y1||0)-(bbox.y0||0))/Math.max(1,variants[i].width*variants[i].height)*8));
        candidates.push(...extractCandidates(w.text,(Number(w.confidence??w.conf)||0)/100,{center,area,engine:`tesseract-${i}`}));
      }
    }
    return candidates;
  }

  async function readUniversal(src){
    const variants=[
      makeVariant(src,'original'),
      makeVariant(src,'gray'),
      makeVariant(src,'binary'),
      makeVariant(src,'invert')
    ];
    let candidates=[];
    try{
      candidates.push(...await paddleCandidates(variants));
      const chosen=chooseCandidate(candidates);
      if(chosen) return {...chosen,source:'PP-OCRv5'};
    }catch(err){
      console.warn('PP-OCRv5 gagal pada perangkat ini:',err);
    }

    try{
      candidates.push(...await tesseractCandidates([variants[0],variants[2]]));
    }catch(err){
      console.warn('Fallback OCR lokal gagal:',err);
    }
    const chosen=chooseCandidate(candidates);
    return chosen?{...chosen,source:'Universal OCR'}:null;
  }

  window.addEventListener('load',()=>{
    ensureUI();

    const originalStart=window.mulaiKamera;
    if(typeof originalStart==='function'){
      window.mulaiKamera=async function(nama){
        resetCaptureUI();
        // Warm-up OCR in parallel; camera remains responsive while models load.
        loadPaddle().catch(()=>{});
        return originalStart(nama);
      };
    }

    window.ambilGambarTimbangan=async function(){
      if(busy) return;
      if(typeof localScanner==='undefined'||!localScanner||typeof localScanner.drawCrop!=='function'){
        setStatus('Kamera belum siap. Silakan input berat manual.',false);
        const manual=$('btn-manual'); if(manual) manual.style.display='block';
        return;
      }

      busy=true;
      const box=$('scanner-box');
      captureCanvas=document.createElement('canvas');
      const width=1400;
      const ratio=box.clientHeight/Math.max(1,box.clientWidth);
      captureCanvas.width=width;
      captureCanvas.height=Math.round(width*ratio);

      if(!localScanner.drawCrop(captureCanvas,captureCanvas.width,captureCanvas.height)){
        busy=false;
        failureUI();
        return;
      }

      const preview=$('capture-preview');
      if(preview){
        preview.width=captureCanvas.width;
        preview.height=captureCanvas.height;
        preview.getContext('2d').drawImage(captureCanvas,0,0);
      }
      try{$('kamera-video').pause();}catch(_){}
      try{localScanner.stop();}catch(_){}
      capturedUI();
      const source=$('scan-source'); if(source) source.textContent='UNIVERSAL OCR • FOTO TERSIMPAN';

      try{
        const result=await readUniversal(captureCanvas);
        if(result){
          window.suksesScan(result.display,'lokal');
          const src=$('scan-source'); if(src) src.textContent=`UNIVERSAL OCR • ${result.source}`;
          setStatus('Berat terbaca. Simpan atau koreksi manual.',false);
          const manual=$('btn-manual'); if(manual){manual.style.display='block';manual.textContent='⌨️ Input / Koreksi Manual';}
          const next=$('btn-lanjut'); if(next) next.style.display='block';
        }else{
          failureUI();
        }
      }catch(err){
        console.error('Universal OCR error:',err);
        failureUI();
      }finally{
        busy=false;
      }
    };
  });
})();
