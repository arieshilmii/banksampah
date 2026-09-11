// Robust seven-segment reader for captured scale photos.
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const PATTERNS={
    '0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],
    '3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],
    '6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],
    '9':[1,1,1,1,0,1,1]
  };

  function median(a){ const s=[...a].sort((x,y)=>x-y),n=s.length; return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2; }
  function avg(a){ return a.length?a.reduce((s,v)=>s+v,0)/a.length:0; }
  function otsu(gray){
    const h=new Uint32Array(256); for(const v of gray) h[v]++;
    const total=gray.length; let sum=0; for(let i=0;i<256;i++) sum+=i*h[i];
    let sumB=0,wB=0,best=-1,t=128;
    for(let i=0;i<256;i++){
      wB+=h[i]; if(!wB) continue; const wF=total-wB; if(!wF) break;
      sumB+=i*h[i]; const mB=sumB/wB,mF=(sum-sumB)/wF;
      const v=wB*wF*(mB-mF)*(mB-mF); if(v>best){best=v;t=i;}
    }
    return t;
  }
  function closeGaps(a,maxGap){
    a=Uint8Array.from(a); let i=0;
    while(i<a.length){
      if(a[i]){i++;continue;} const s=i; while(i<a.length&&!a[i])i++;
      if(s>0&&i<a.length&&i-s<=maxGap) for(let j=s;j<i;j++) a[j]=1;
    }
    return a;
  }
  function runs(a){
    const out=[]; let i=0;
    while(i<a.length){
      if(!a[i]){i++;continue;} const s=i; while(i<a.length&&a[i])i++;
      out.push({start:s,end:i-1,width:i-s});
    }
    return out;
  }
  function regionMaxRow(mask,W,H,x0,x1,y0,y1){
    x0=Math.max(0,Math.floor(x0));x1=Math.min(W,Math.ceil(x1));y0=Math.max(0,Math.floor(y0));y1=Math.min(H,Math.ceil(y1));
    let best=0; for(let y=y0;y<y1;y++){ let n=0; for(let x=x0;x<x1;x++)n+=mask[y*W+x]; best=Math.max(best,n/Math.max(1,x1-x0)); } return best;
  }
  function regionMaxCol(mask,W,H,x0,x1,y0,y1){
    x0=Math.max(0,Math.floor(x0));x1=Math.min(W,Math.ceil(x1));y0=Math.max(0,Math.floor(y0));y1=Math.min(H,Math.ceil(y1));
    let best=0; for(let x=x0;x<x1;x++){ let n=0; for(let y=y0;y<y1;y++)n+=mask[y*W+x]; best=Math.max(best,n/Math.max(1,y1-y0)); } return best;
  }

  function recognizeSevenSegment(src){
    const W=900,H=Math.max(260,Math.round(src.height*W/src.width));
    const c=document.createElement('canvas'); c.width=W;c.height=H;
    const ctx=c.getContext('2d',{willReadFrequently:true}); ctx.drawImage(src,0,0,W,H);
    const img=ctx.getImageData(0,0,W,H),gray=new Uint8Array(W*H);
    for(let i=0,p=0;i<img.data.length;i+=4,p++) gray[p]=Math.round(.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2]);
    const th=otsu(gray),mask=new Uint8Array(W*H); for(let i=0;i<gray.length;i++) mask[i]=gray[i]<th?1:0;

    const xA=Math.floor(W*.04),xB=Math.ceil(W*.96),yA=Math.floor(H*.04),yB=Math.ceil(H*.95);
    const active=new Uint8Array(xB-xA);
    for(let x=xA;x<xB;x++){
      let n=0; for(let y=yA;y<yB;y++) n+=mask[y*W+x];
      active[x-xA]=(n/Math.max(1,yB-yA))>.018?1:0;
    }
    const rawRuns=runs(closeGaps(active,Math.max(2,Math.round(W*.004))));
    const all=[];
    for(const r of rawRuns){
      const x0=r.start+xA,x1=r.end+xA; if(r.width<2)continue;
      let minY=H,maxY=-1,sumY=0,count=0;
      for(let y=yA;y<yB;y++) for(let x=x0;x<=x1;x++) if(mask[y*W+x]){minY=Math.min(minY,y);maxY=Math.max(maxY,y);sumY+=y;count++;}
      if(count) all.push({x0,x1,w:x1-x0+1,y0:minY,y1:maxY,span:maxY-minY+1,cy:sumY/count});
    }
    const digits=all.filter(r=>r.span>=H*.45&&r.w>=W*.025&&r.w<=W*.28&&r.x0>W*.05&&r.x1<W*.95);
    if(digits.length<2||digits.length>6) return null;
    digits.sort((a,b)=>a.x0-b.x0);
    const y0=Math.round(median(digits.map(r=>r.y0))), y1=Math.round(median(digits.map(r=>r.y1))), h=y1-y0+1;
    if(h<H*.42) return null;

    const decoded=[];
    for(const r of digits){
      const x0=r.x0,w=r.w;
      const scores=[
        regionMaxRow(mask,W,H,x0+.18*w,x0+.82*w,y0+.00*h,y0+.18*h),
        regionMaxCol(mask,W,H,x0+.68*w,x0+.98*w,y0+.10*h,y0+.46*h),
        regionMaxCol(mask,W,H,x0+.68*w,x0+.98*w,y0+.54*h,y0+.90*h),
        regionMaxRow(mask,W,H,x0+.18*w,x0+.82*w,y0+.82*h,y0+1.00*h),
        regionMaxCol(mask,W,H,x0+.02*w,x0+.32*w,y0+.54*h,y0+.90*h),
        regionMaxCol(mask,W,H,x0+.02*w,x0+.32*w,y0+.10*h,y0+.46*h),
        // Segmen tengah sengaja dibaca dari inti yang sempit. Pada LCD nyata,
        // ujung segmen vertikal dan pantulan sering masuk ke area tengah dan
        // membuat angka 0 terbaca sebagai 8 jika area sampelnya terlalu lebar.
        regionMaxRow(mask,W,H,x0+.28*w,x0+.72*w,y0+.43*h,y0+.57*h)
      ];
      const bits=scores.map((v,i)=>v>=(i===6?.42:.38)?1:0);

      // Koreksi khusus 0 vs 8. Enam segmen luar harus kuat, sedangkan segmen
      // tengah harus benar-benar kuat untuk mengubah 0 menjadi 8.
      const outer=scores.slice(0,6);
      const outerStrong=outer.filter(v=>v>=.55).length>=5 && avg(outer)>=.67;
      if(outerStrong && scores[6]<.62) bits[6]=0;

      let best=null;
      for(const [digit,pat] of Object.entries(PATTERNS)){
        const dist=bits.reduce((n,b,i)=>n+(b!==pat[i]?1:0),0);
        if(!best||dist<best.dist) best={digit,pat,dist};
      }
      const on=[],off=[]; best.pat.forEach((v,i)=>(v?on:off).push(scores[i]));
      const polarization=avg(on)-avg(off);
      const ambiguity=Math.min(...scores.map(v=>Math.abs(v-(v>=.5?1:0))));
      if(best.dist>1||polarization<.34) return null;
      decoded.push({digit:best.digit,dist:best.dist,polarization,ambiguity,scores});
    }

    let text='';
    for(let i=0;i<digits.length;i++){
      text+=decoded[i].digit;
      if(i<digits.length-1){
        const g0=digits[i].x1+1,g1=digits[i+1].x0-1;
        const dot=all.find(r=>r.x0>=g0&&r.x1<=g1&&r.span<H*.30&&r.cy>y0+h*.68);
        if(dot) text+='.';
      }
    }

    const confidence=decoded.reduce((s,d)=>{
      const fit=(d.dist===0?1:.78)*Math.min(1,Math.max(0,(d.polarization-.12)/.58));
      const center=d.scores[6];
      const centerPenalty=(d.digit==='0'&&center>.30)?Math.max(.62,1-(center-.30)*1.25):1;
      return s+fit*centerPenalty;
    },0)/decoded.length;

    if(!/^\d+(?:\.\d+)?$/.test(text)||Number(text)<=0||confidence<.70) return null;
    return {text,confidence};
  }

  window.addEventListener('load',()=>{
    const originalCapture=window.ambilGambarTimbangan;
    if(typeof originalCapture!=='function') return;

    window.ambilGambarTimbangan=async function(){
      try{
        if(typeof localScanner!=='undefined'&&localScanner&&typeof localScanner.drawCrop==='function'){
          const box=$('scanner-box');
          const c=document.createElement('canvas');
          const width=1400,ratio=box.clientHeight/Math.max(1,box.clientWidth); c.width=width;c.height=Math.round(width*ratio);
          if(localScanner.drawCrop(c,c.width,c.height)){
            const result=recognizeSevenSegment(c);
            if(result){
              const preview=$('capture-preview');
              if(preview){preview.width=c.width;preview.height=c.height;preview.getContext('2d').drawImage(c,0,0);preview.style.display='block';}
              try{$('kamera-video').pause();}catch(_){}
              try{localScanner.stop();}catch(_){}
              const cap=$('btn-capture'); if(cap)cap.style.display='none';
              const retake=$('btn-retake'); if(retake)retake.style.display='block';
              const line=$('scan-line'); if(line)line.style.display='none';
              window.suksesScan(result.text,'lokal');
              const src=$('scan-source'); if(src)src.textContent=`7-SEG FOTO • ${Math.round(result.confidence*100)}%`;
              const status=$('status-text'); if(status)status.textContent='Siap disimpan';
              const spinner=$('spinner'); if(spinner)spinner.style.display='none';
              return;
            }
          }
        }
      }catch(err){ console.warn('7-seg foto fallback:',err); }
      return originalCapture();
    };
  });
})();
