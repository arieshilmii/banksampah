// Bank Sampah OCR: compact seven-segment reader, reusable Tesseract fallback.
// Never infer missing digits; automatic readings must have three decimal places.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const PATTERNS={0:'1111110',1:'0110000',2:'1101101',3:'1111001',4:'0110011',5:'1011011',6:'1011111',7:'1110000',8:'1111111',9:'1111011'};
  const SEGMENTS=[[.18,.82,0,.16],[.74,1,.12,.46],[.74,1,.54,.88],[.18,.82,.84,1],[0,.26,.54,.88],[0,.26,.12,.46],[.18,.82,.42,.58]];
  const EXACT=/^\d{1,3}\.\d{3}$/;
  let worker=null,workerPromise=null,session=0,busy=false;

  function status(message,loading=false){
    if($('status-text'))$('status-text').textContent=message;
    if($('spinner'))$('spinner').style.display=loading?'block':'none';
  }
  function ensureUI(){
    const actions=$('camera-ui')?.querySelector('.scanner-actions'),box=$('scanner-box');
    if(!actions||!box)return;
    if(!$('btn-capture')){
      const b=document.createElement('button');b.id='btn-capture';b.type='button';
      b.style.cssText='position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);width:calc(100% - 40px);max-width:320px;z-index:14000;border:0;border-radius:28px;padding:15px 18px;background:#20d979;color:#052315;font-weight:850;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.34);cursor:pointer';
      b.textContent='📸 Ambil Gambar';b.onclick=()=>window.ambilGambarTimbangan?.();actions.prepend(b);
    }
    if(!$('capture-preview')){
      const canvas=document.createElement('canvas');canvas.id='capture-preview';canvas.hidden=true;
      canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:none;border-radius:12px;z-index:3;background:#fff';box.appendChild(canvas);
    }
    if($('scanner-tip'))$('scanner-tip').textContent='Arahkan tiga angka desimal ke dalam bingkai. Periksa berat sebelum menyimpan.';
  }
  function reset(){
    session++;busy=false;ensureUI();
    const preview=$('capture-preview');
    if(preview){preview.hidden=true;preview.style.display='none';preview.getContext('2d')?.clearRect(0,0,preview.width,preview.height);}
    ['ai-result','btn-lanjut','btn-manual','btn-retake-v19'].forEach(id=>{if($(id))$(id).style.display='none';});
    $('camera-ui')?.querySelector('.scanner-actions')?.classList.remove('success-v19');
    if($('btn-capture')){$('btn-capture').style.display='block';$('btn-capture').disabled=false;}
  }
  window.resetUniversalCapture=reset;
  window.cancelUniversalCapture=()=>{session++;busy=false;};

  async function warmTesseract(){
    if(worker)return worker;
    if(workerPromise)return workerPromise;
    workerPromise=(async()=>{
      if(!window.Tesseract){
        await new Promise((resolve,reject)=>{
          const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          script.onload=resolve;script.onerror=()=>reject(new Error('Tesseract script unavailable'));document.head.appendChild(script);
        });
      }
      const w=await window.Tesseract.createWorker('eng',1);
      await w.setParameters({tessedit_char_whitelist:'0123456789.,',tessedit_pageseg_mode:window.Tesseract.PSM?.SINGLE_LINE||'7',preserve_interword_spaces:'0'});
      worker=w;return worker;
    })().catch(err=>{workerPromise=null;console.warn('Tesseract initialization:',err);throw err;});
    return workerPromise;
  }
  window.warmUniversalOCR=()=>{warmTesseract().catch(()=>{});};
  function runs(active,minWidth){
    const result=[];let start=-1;
    for(let i=0;i<=active.length;i++){
      if(i<active.length&&active[i]){if(start<0)start=i;}
      else if(start>=0){if(i-start>=minWidth)result.push({start,end:i-1,width:i-start});start=-1;}
    }
    return result;
  }
  function fastAttempt(gray,w,h,threshold,bright){
    const mask=new Uint8Array(w*h);
    for(let i=0;i<mask.length;i++)mask[i]=bright?(gray[i]>threshold?1:0):(gray[i]<threshold?1:0);
    const upper=Math.floor(h*.065),lower=Math.ceil(h*.94),active=new Uint8Array(w);
    const required=Math.max(2,(lower-upper)*.022);
    for(let x=0;x<w;x++){
      let pixels=0;for(let y=upper;y<lower;y++)pixels+=mask[y*w+x];
      if(pixels>=required)active[x]=1;
    }
    for(let i=1;i<w-3;i++){
      if(!active[i-1]||active[i])continue;
      let end=i;while(end<Math.min(w,i+4)&&!active[end])end++;
      if(end<w&&end-i<=3&&active[end])active.fill(1,i,end);
    }
    const candidates=[];
    for(const r of runs(active,Math.max(3,Math.round(w*.006)))){
      let top=h,bottom=-1,count=0;
      for(let x=r.start;x<=r.end;x++)for(let y=upper;y<lower;y++)if(mask[y*w+x]){
        if(y<top)top=y;if(y>bottom)bottom=y;count++;
      }
      if(count)candidates.push({...r,top,bottom,height:bottom-top+1});
    }
    const digits=candidates.filter(r=>r.height>=h*.46&&r.width>=h*.11);
    if(digits.length<4||digits.length>6)return null;
    // The median ignores stray captions or borders attached to a single digit.
    const sortedTop=digits.map(d=>d.top).sort((a,b)=>a-b);
    const sortedBottom=digits.map(d=>d.bottom).sort((a,b)=>a-b);
    const firstTop=sortedTop[Math.floor(digits.length/2)];
    const lastBottom=sortedBottom[Math.floor(digits.length/2)]+1;
    const glyphHeight=lastBottom-firstTop;
    if(glyphHeight<h*.35)return null;
    const dots=candidates.filter(r=>!digits.includes(r)&&r.height<=glyphHeight*.29&&r.top>=firstTop+glyphHeight*.57&&r.width<=glyphHeight*.19);
    let dotIndex=-1;
    for(let i=0;i<digits.length-1;i++){
      if(dots.some(dot=>dot.start>digits[i].end&&dot.end<digits[i+1].start)){
        if(dotIndex!==-1)return null;
        dotIndex=i;
      }
    }
    if(dotIndex<0||digits.length-dotIndex-1!==3)return null;
    const widths=digits.map(d=>d.width).sort((a,b)=>a-b);
    const typicalWidth=widths[Math.floor(widths.length/2)];
    let text='',minMargin=1;
    for(let i=0;i<digits.length;i++){
      const d=digits[i],left=d.start,right=d.end+1,wd=right-left;
      // In seven-segment fonts, '1' is two thin vertical bars in a narrow glyph.
      // Sampling seven positions relative to that narrow bounding box makes its
      // vertical bars look like horizontal segments, falsely producing '5'.
      // Recognize the distinctive tall, narrow geometry before the segment grid.
      const narrowOne=d.height>=glyphHeight*.73 && (
        wd<=glyphHeight*.23 || (wd<=glyphHeight*.30&&wd<typicalWidth*.48)
      );
      if(narrowOne){
        text+='1';
        if(i===dotIndex)text+='.';
        continue;
      }
      let bits='';
      for(const [xa,xb,ya,yb] of SEGMENTS){
        const x0=Math.floor(left+xa*wd),x1=Math.max(x0+1,Math.ceil(left+xb*wd));
        const y0=Math.floor(firstTop+ya*glyphHeight),y1=Math.max(y0+1,Math.ceil(firstTop+yb*glyphHeight));
        let ink=0;
        for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++)ink+=mask[yy*w+xx];
        const density=ink/Math.max(1,(y1-y0)*(x1-x0));
        bits+=density>.22?'1':'0';minMargin=Math.min(minMargin,Math.abs(density-.22));
      }
      const digit=Object.keys(PATTERNS).find(key=>PATTERNS[key]===bits);
      if(digit===undefined)return null;
      text+=digit;if(i===dotIndex)text+='.';
    }
    return EXACT.test(text)&&minMargin>=.007?text:null;
  }
  function fastDigits(source){
    const w=640,h=Math.max(160,Math.round(w*source.height/source.width));
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0,w,h);
    const rgba=ctx.getImageData(0,0,w,h).data,gray=new Uint8Array(w*h),hist=new Uint32Array(256);
    let borderTotal=0,borderCount=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const index=y*w+x,p=index*4;
      const value=Math.round(.299*rgba[p]+.587*rgba[p+1]+.114*rgba[p+2]);
      gray[index]=value;hist[value]++;
      if(x<w*.04||x>w*.96||y<h*.04||y>h*.96){borderTotal+=value;borderCount++;}
    }
    function percentile(t){let sum=0;for(let i=0;i<256;i++){sum+=hist[i];if(sum>=w*h*t)return i;}return 255;}
    const low=percentile(.08),high=percentile(.92);
    if(high-low<48)return null;
    const bright=borderTotal/Math.max(1,borderCount)<(low+high)/2;
    // Require agreement among independent thresholds, not every threshold to pass.
    const votes=new Map();
    for(const ratio of [.32,.40,.48,.56,.64,.73,.79]){
      const threshold=Math.round(low*(1-ratio)+high*ratio);
      const result=fastAttempt(gray,w,h,threshold,bright);
      if(result)votes.set(result,(votes.get(result)||0)+1);
    }
    const valid=[...votes].filter(([,count])=>count>=2);
    return votes.size===1&&valid.length===1?valid[0][0]:null;
  }
  function cleaned(raw){
    let text=String(raw||'').replace(/kg/ig,'').replace(/[，,]/g,'.').trim();
    if(/\d/.test(text))text=text.replace(/[OoQD]/g,'0').replace(/[Il|!]/g,'1').replace(/[Ss]/g,'5').replace(/[Bb]/g,'8').replace(/[Gg]/g,'6');
    return text.replace(/\b(\d)\s+(\d{3})\b/g,'$1.$2');
  }
  function candidates(data){
    const out=[];
    const add=(value,confidence)=>{
      const matches=cleaned(value).match(/(?:^|[^\d.])\d{1,3}\.\d{3}(?![\d.])/g)||[];
      for(const match of matches){
        const display=(match.match(/\d{1,3}\.\d{3}$/)||[])[0];
        if(display&&Number(display)>0)out.push({display,confidence:confidence||0});
      }
    };
    add(data?.text,(Number(data?.confidence)||0)/100);
    for(const word of data?.words||[])add(word.text,(Number(word.confidence??word.conf)||0)/100);
    return out;
  }
  function choose(items){
    const groups=new Map();
    for(const item of items){const group=groups.get(item.display)||[];group.push(item);groups.set(item.display,group);}
    const ranked=[...groups].map(([display,group])=>({display,confidence:Math.max(...group.map(v=>v.confidence)),count:group.length})).sort((a,b)=>b.confidence-a.confidence);
    if(!ranked.length)return null;
    if(ranked.length>1&&ranked[0].confidence-ranked[1].confidence<.2)return null;
    return ranked[0].confidence>=.80?ranked[0].display:null;
  }
  function binary(source){
    const c=document.createElement('canvas');c.width=900;c.height=Math.max(200,Math.round(source.height/source.width*900));
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0,c.width,c.height);
    const img=ctx.getImageData(0,0,c.width,c.height);
    for(let i=0;i<img.data.length;i+=4){const g=Math.round(.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2]);const v=g>165?255:0;img.data[i]=img.data[i+1]=img.data[i+2]=v;}
    ctx.putImageData(img,0,0);return c;
  }
  async function readWeight(photo,token){
    const seven=fastDigits(photo);if(seven)return seven;
    const tess=await warmTesseract();if(token!==session)return null;
    const scaled=document.createElement('canvas');scaled.width=900;scaled.height=Math.max(200,Math.round(photo.height/photo.width*900));
    scaled.getContext('2d').drawImage(photo,0,0,scaled.width,scaled.height);
    status('Sedang Dibaca AI',true);
    const first=await tess.recognize(scaled);if(token!==session)return null;
    let seen=candidates(first.data);
    const initial=choose(seen);if(initial)return initial;
    status('Sedang Dibaca AI',true);
    const second=await tess.recognize(binary(photo));if(token!==session)return null;
    seen=seen.concat(candidates(second.data));
    const count=new Map();for(const item of seen)count.set(item.display,(count.get(item.display)||0)+1);
    const agreed=[...count].filter(([,n])=>n>=2);
    if(agreed.length===1)return agreed[0][0];
    return choose(seen);
  }
  function fallback(){
    status('Angka belum terbaca pasti. Coba ambil ulang atau input berat manual.',false);
    if($('btn-manual')){$('btn-manual').style.display='flex';$('btn-manual').textContent='⌨️ Input Manual';}
    if($('btn-lanjut'))$('btn-lanjut').style.display='none';
    const retry=$('btn-retake-v19');
    if(retry){$('camera-ui')?.querySelector('.scanner-actions')?.classList.add('success-v19');retry.style.display='flex';}
  }
  window.ambilGambarTimbangan=async function(){
    ensureUI();if(busy)return;
    const scanner=window.localScanner||((typeof localScanner!=='undefined')?localScanner:null);
    if(!scanner||typeof scanner.drawCrop!=='function'){status('Kamera belum siap. Coba lagi atau gunakan input manual.');return;}
    busy=true;const token=++session;
    try{
      const box=$('scanner-box'),photo=document.createElement('canvas');photo.width=1100;
      photo.height=Math.max(1,Math.round(photo.width*box.clientHeight/Math.max(1,box.clientWidth)));
      if(!scanner.drawCrop(photo,photo.width,photo.height)){if(token===session)fallback();return;}
      const preview=$('capture-preview');
      if(preview){preview.width=photo.width;preview.height=photo.height;preview.getContext('2d').drawImage(photo,0,0);preview.hidden=false;preview.style.display='block';}
      try{$('kamera-video')?.pause();scanner.stop();}catch(_){}
      if($('btn-capture'))$('btn-capture').style.display='none';
      if($('scan-line'))$('scan-line').style.display='none';
      status('Sedang Dibaca AI',true);
      const weight=await readWeight(photo,token);
      if(token!==session)return;
      if(!weight){fallback();return;}
      window.suksesScan?.(weight,'lokal');
      status('Berat terbaca. Periksa angka sebelum menyimpan.',false);
      if($('btn-manual'))$('btn-manual').style.display='flex';
      if($('btn-lanjut'))$('btn-lanjut').style.display='block';
    }catch(err){console.warn('Weight recognition:',err);if(token===session)fallback();}
    finally{if(token===session)busy=false;}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUI,{once:true});else ensureUI();
})();