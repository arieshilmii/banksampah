// One photo -> one OCR session. Never silently truncate a scale's third decimal.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  let paddle=null,paddleLoading=null,tesseract=null,tesseractLoading=null;
  let busy=false,captured=null,session=0;
  const THREE_DECIMALS=/^\d{1,4}\.\d{3}$/;

  function status(message,loading=false){
    if($('status-text'))$('status-text').textContent=message;
    if($('spinner'))$('spinner').style.display=loading?'block':'none';
  }
  function ensureUI(){
    const actions=document.querySelector('#camera-ui .scanner-actions'),box=$('scanner-box');
    if(!actions||!box)return;
    if(!$('btn-capture')){
      const button=document.createElement('button');button.id='btn-capture';button.type='button';
      button.textContent='📸 Ambil Gambar';
      button.style.cssText='position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);width:calc(100% - 40px);max-width:320px;z-index:14000;border:0;border-radius:28px;padding:15px 18px;background:#20d979;color:#052315;font-weight:850;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.34);cursor:pointer';
      button.onclick=()=>window.ambilGambarTimbangan();actions.insertBefore(button,actions.firstChild);
    }
    if(!$('capture-preview')){
      const canvas=document.createElement('canvas');canvas.id='capture-preview';
      canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:none;border-radius:12px;z-index:3;background:#fff';
      canvas.hidden=true;box.appendChild(canvas);
    }
    const tip=$('scanner-tip');if(tip)tip.textContent='Pastikan tiga digit setelah koma terlihat jelas. Periksa berat sebelum menyimpan.';
  }
  function resetCapture(){
    session++;busy=false;captured=null;
    ensureUI();
    const preview=$('capture-preview');
    if(preview){preview.style.display='none';preview.hidden=true;const context=preview.getContext('2d');if(context)context.clearRect(0,0,preview.width,preview.height);}
    ['ai-result','btn-lanjut','btn-manual','btn-retake-v19'].forEach(id=>{const el=$(id);if(el)el.style.display='none';});
    $('camera-ui')?.querySelector('.scanner-actions')?.classList.remove('success-v19');
    const capture=$('btn-capture');if(capture){capture.style.display='block';capture.disabled=false;}
  }
  // Camera initializer calls this on every new opening, including Ambil Ulang.
  window.resetUniversalCapture=resetCapture;
  window.cancelUniversalCapture=function(){session++;busy=false;captured=null;};

  async function loadPaddle(){
    if(paddle)return paddle;
    if(paddleLoading)return paddleLoading;
    paddleLoading=(async()=>{
      status('Sedang Dibaca AI',true);
      const mod=await import('https://cdn.jsdelivr.net/npm/@paddleocr/paddleocr-js@0.4.2/+esm');
      if(!mod?.PaddleOCR)throw new Error('PaddleOCR unavailable');
      paddle=await mod.PaddleOCR.create({lang:'en',ocrVersion:'PP-OCRv5',worker:false,textDetectionBatchSize:1,textRecognitionBatchSize:4,ortOptions:{backend:'wasm',wasmPaths:'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/',numThreads:1,simd:true}});
      return paddle;
    })().catch(error=>{paddleLoading=null;throw error;});
    return paddleLoading;
  }
  async function loadTesseract(){
    if(tesseract)return tesseract;
    if(tesseractLoading)return tesseractLoading;
    tesseractLoading=(async()=>{
      if(!window.Tesseract){
        await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>reject(new Error('Tesseract unavailable'));document.head.appendChild(script);});
      }
      tesseract=await window.Tesseract.createWorker('eng',1);
      await tesseract.setParameters({tessedit_char_whitelist:'0123456789.,OoQDIil|SBGkgKG ',tessedit_pageseg_mode:window.Tesseract.PSM?.SINGLE_LINE||'7',preserve_interword_spaces:'1'});
      return tesseract;
    })().catch(error=>{tesseractLoading=null;throw error;});
    return tesseractLoading;
  }
  function variant(source,mode){
    const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=Math.max(220,Math.round(canvas.width*source.height/source.width));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,0,0,canvas.width,canvas.height);
    if(mode==='original')return canvas;
    const image=ctx.getImageData(0,0,canvas.width,canvas.height);const gray=new Uint8Array(canvas.width*canvas.height);
    const hist=new Uint32Array(256);let min=255,max=0;
    for(let i=0,j=0;i<image.data.length;i+=4,j++){const g=Math.round(.299*image.data[i]+.587*image.data[i+1]+.114*image.data[i+2]);gray[j]=g;min=Math.min(min,g);max=Math.max(max,g);}
    const span=Math.max(35,max-min);let total=0,sum=0;
    for(let i=0;i<gray.length;i++){gray[i]=Math.max(0,Math.min(255,Math.round((gray[i]-min)*255/span)));hist[gray[i]]++;}
    for(let i=0;i<256;i++){total+=hist[i];sum+=i*hist[i];}
    let threshold=128,variance=-1,back=0,backSum=0;
    for(let t=0;t<256;t++){back+=hist[t];if(!back)continue;const fore=total-back;if(!fore)break;backSum+=t*hist[t];const diff=backSum/back-(sum-backSum)/fore;const score=back*fore*diff*diff;if(score>variance){variance=score;threshold=t;}}
    for(let i=0,j=0;i<image.data.length;i+=4,j++){
      const g=mode==='gray'?gray[j]:mode==='binary'?(gray[j]<threshold?0:255):(gray[j]<threshold?255:0);
      image.data[i]=image.data[i+1]=image.data[i+2]=g;image.data[i+3]=255;
    }
    ctx.putImageData(image,0,0);return canvas;
  }
  function candidatesFrom(text,confidence=0.5,engine='ocr'){
    if(!text)return [];
    let raw=String(text).replace(/kg/gi,'').replace(/[，,]/g,'.').replace(/[：:;]/g,'.');
    if(/\d/.test(raw))raw=raw.replace(/[OoQD]/g,'0').replace(/[Il|!]/g,'1').replace(/[Ss]/g,'5').replace(/[Bb]/g,'8').replace(/[Gg]/g,'6');
    raw=raw.replace(/\b(\d)\s+(\d{3})\b/g,'$1.$2').replace(/\s+/g,' ').trim();
    const results=[];
    const regex=/(?:^|[^\d.])(\d{1,4}(?:\.\d{1,3})?)(?![\d.])/g;
    for(const found of raw.matchAll(regex)){
      let display=found[1];
      if(/^0\d{3}$/.test(display))display=`0.${display.slice(1)}`;
      const value=Number(display);
      if(!Number.isFinite(value)||value<=0||value>=10000)continue;
      results.push({display,value,confidence:Math.max(0,Math.min(1,Number(confidence)||0)),engine});
    }
    return results;
  }
  function choosePrecise(candidates){
    // A 2-decimal recognition is incomplete for this three-decimal scale. Never append a guessed digit.
    const precise=candidates.filter(c=>THREE_DECIMALS.test(c.display));
    if(!precise.length)return null;
    const groups=new Map();
    for(const c of precise){if(!groups.has(c.display))groups.set(c.display,[]);groups.get(c.display).push(c);}
    const ranked=[...groups].map(([display,items])=>{
      const best=Math.max(...items.map(i=>i.confidence));
      const sources=new Set(items.map(i=>i.engine)).size;
      return {display,best,sources,score:best+Math.min(.30,(sources-1)*.1)};
    }).sort((a,b)=>b.score-a.score);
    const first=ranked[0],second=ranked[1];
    // Single recognition needs high confidence; multiple preprocessing views must agree otherwise.
    if(first.best<.65 || (first.sources<2&&first.best<.87))return null;
    if(second&&first.score-second.score<.16)return null;
    return first;
  }
  function collectPaddle(results,images){
    const out=[];
    (results||[]).forEach((result,index)=>{
      const items=Array.isArray(result?.items)?result.items:[];
      const joined=items.map(i=>i.text||'').join(' ');
      if(joined){const avg=items.length?items.reduce((sum,item)=>sum+(Number(item.score)||0),0)/items.length:.3;out.push(...candidatesFrom(joined,avg,`paddle-joined-${index}`));}
      for(const item of items)out.push(...candidatesFrom(item.text,item.score,`paddle-${index}`));
    });
    return out;
  }
  async function readWeight(photo,token){
    const images=['original','gray','binary','invert'].map(mode=>variant(photo,mode));
    let candidates=[];
    try{
      const model=await loadPaddle();if(token!==session)return null;
      status('Sedang Dibaca AI',true);
      candidates.push(...collectPaddle(await model.predict(images,{textDetLimitSideLen:960,textDetLimitType:'max',textDetThresh:.22,textDetBoxThresh:.30,textDetUnclipRatio:1.25,textRecScoreThresh:.15}),images));
      if(token!==session)return null;
      const first=choosePrecise(candidates);if(first)return first;
    }catch(err){console.warn('Primary local OCR failed:',err);}
    if(token!==session)return null;
    try{
      const worker=await loadTesseract();if(token!==session)return null;
      for(let i=0;i<2;i++){
        status('Sedang Dibaca AI',true);
        const image=images[i===0?0:2],recognized=await worker.recognize(image);
        if(token!==session)return null;
        const data=recognized?.data||{};const confidence=(Number(data.confidence)||0)/100;
        candidates.push(...candidatesFrom(data.text,confidence,`tesseract-${i}`));
        for(const word of data.words||[])candidates.push(...candidatesFrom(word.text,(Number(word.confidence??word.conf)||0)/100,`tesseract-word-${i}`));
      }
    }catch(err){console.warn('Fallback local OCR failed:',err);}
    return token===session?choosePrecise(candidates):null;
  }
  function capturedUI(){
    const capture=$('btn-capture');if(capture)capture.style.display='none';
    const preview=$('capture-preview');if(preview){preview.hidden=false;preview.style.display='block';}
    if($('scan-line'))$('scan-line').style.display='none';
  }
  function fallback(){
    status('Tiga digit di belakang koma belum terbaca dengan pasti. Periksa foto, lalu input berat manual atau ambil ulang.',false);
    const manual=$('btn-manual');if(manual){manual.style.display='flex';manual.textContent='⌨️ Input Manual';}
    if($('btn-lanjut'))$('btn-lanjut').style.display='none';
    const retake=$('btn-retake-v19');
    if(retake){$('camera-ui')?.querySelector('.scanner-actions')?.classList.add('success-v19');retake.style.display='flex';}
  }
  window.ambilGambarTimbangan=async function(){
    ensureUI();if(busy)return;
    const scanner=window.localScanner||((typeof localScanner!=='undefined')?localScanner:null);
    if(!scanner||typeof scanner.drawCrop!=='function'){
      status('Kamera belum siap. Coba lagi atau input manual.',false);
      if($('btn-manual'))$('btn-manual').style.display='block';return;
    }
    busy=true;const token=++session;
    try{
      const box=$('scanner-box');const ratio=box.clientHeight/Math.max(1,box.clientWidth);
      const photo=document.createElement('canvas');photo.width=1400;photo.height=Math.max(1,Math.round(photo.width*ratio));
      if(!scanner.drawCrop(photo,photo.width,photo.height)){if(token===session)fallback();return;}
      captured=photo;
      const preview=$('capture-preview');if(preview){preview.width=photo.width;preview.height=photo.height;preview.getContext('2d').drawImage(photo,0,0);}
      try{$('kamera-video')?.pause();}catch(_){}
      try{scanner.stop();}catch(_){}
      capturedUI();status('Sedang Dibaca AI',true);
      const result=await readWeight(photo,token);
      if(token!==session)return;
      if(!result){fallback();return;}
      // Keep the OCR display text exactly (including any trailing zero), no toFixed(2) or rounding.
      window.suksesScan?.(result.display,'lokal');
      status('Berat terbaca. Periksa tiga digit desimal sebelum menyimpan.',false);
      if($('btn-manual'))$('btn-manual').style.display='flex';
      if($('btn-lanjut'))$('btn-lanjut').style.display='block';
    }catch(err){console.error('Photo OCR failed:',err);if(token===session)fallback();}
    finally{if(token===session)busy=false;}
  };
  // Other camera modules set their own opener on load. Reset is therefore exposed and
  // explicitly invoked from camera_fix_v18.js rather than relying on wrapping order.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUI,{once:true});else ensureUI();
})();