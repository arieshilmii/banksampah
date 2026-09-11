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

  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const median=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;};

  function percentileThreshold(gray,q){
    const h=new Uint32Array(256); for(const v of gray)h[v]++;
    const target=Math.max(1,Math.round(gray.length*q));
    let n=0; for(let i=0;i<256;i++){n+=h[i];if(n>=target)return i;}
    return 128;
  }
  function makeMask(gray,threshold){
    const m=new Uint8Array(gray.length);
    for(let i=0;i<gray.length;i++)m[i]=gray[i]<=threshold?1:0;
    return m;
  }
  function closeGaps(a,maxGap){
    a=Uint8Array.from(a); let i=0;
    while(i<a.length){
      if(a[i]){i++;continue;}
      const s=i; while(i<a.length&&!a[i])i++;
      if(s>0&&i<a.length&&i-s<=maxGap)for(let j=s;j<i;j++)a[j]=1;
    }
    return a;
  }
  function runs(a){
    const out=[]; let i=0;
    while(i<a.length){
      if(!a[i]){i++;continue;}
      const s=i; while(i<a.length&&a[i])i++;
      out.push({start:s,end:i-1,width:i-s});
    }
    return out;
  }
  function regionMaxRow(mask,W,H,x0,x1,y0,y1){
    x0=Math.max(0,Math.floor(x0));x1=Math.min(W,Math.ceil(x1));y0=Math.max(0,Math.floor(y0));y1=Math.min(H,Math.ceil(y1));
    let best=0; for(let y=y0;y<y1;y++){let n=0;for(let x=x0;x<x1;x++)n+=mask[y*W+x];best=Math.max(best,n/Math.max(1,x1-x0));} return best;
  }
  function regionMaxCol(mask,W,H,x0,x1,y0,y1){
    x0=Math.max(0,Math.floor(x0));x1=Math.min(W,Math.ceil(x1));y0=Math.max(0,Math.floor(y0));y1=Math.min(H,Math.ceil(y1));
    let best=0; for(let x=x0;x<x1;x++){let n=0;for(let y=y0;y<y1;y++)n+=mask[y*W+x];best=Math.max(best,n/Math.max(1,y1-y0));} return best;
  }
  function yExtent(mask,W,H,x0,x1,y0,y1){
    let min=H,max=-1,count=0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<=x1;x++)if(mask[y*W+x]){min=Math.min(min,y);max=Math.max(max,y);count++;}
    return count?{min,max,span:max-min+1,count}:null;
  }

  function detectDecimal(mask,W,H,left,right,y0,h,digitW){
    if(right-left<4)return false;
    const ya=Math.max(0,Math.floor(y0+h*.56)), yb=Math.min(H,Math.ceil(y0+h*.99));
    const active=new Uint8Array(Math.max(0,right-left));
    for(let x=left;x<right;x++){
      let n=0; for(let y=ya;y<yb;y++)n+=mask[y*W+x];
      active[x-left]=(n/Math.max(1,yb-ya))>.05?1:0;
    }
    for(const r of runs(closeGaps(active,2))){
      if(r.width<3||r.width>Math.max(8,digitW*.28))continue;
      const xa=left+r.start, xb=left+r.end;
      let minY=H,maxY=-1,count=0,sumY=0;
      for(let y=ya;y<yb;y++)for(let x=xa;x<=xb;x++)if(mask[y*W+x]){minY=Math.min(minY,y);maxY=Math.max(maxY,y);sumY+=y;count++;}
      if(!count)continue;
      const span=maxY-minY+1, cy=sumY/count;
      if(span>=3&&span<=h*.26&&cy>y0+h*.68)return true;
    }
    return false;
  }

  function decodeWithQuantile(gray,W,H,q){
    const threshold=percentileThreshold(gray,q);
    const mask=makeMask(gray,threshold);
    const yA=Math.floor(H*.05), yB=Math.ceil(H*.88);
    const active=new Uint8Array(W);
    for(let x=0;x<W;x++){
      let n=0;for(let y=yA;y<yB;y++)n+=mask[y*W+x];
      active[x]=(n/Math.max(1,yB-yA))>.03?1:0;
    }
    const rawRuns=runs(closeGaps(active,Math.max(3,Math.round(W*.0045))));
    let digitRuns=[];
    for(const r of rawRuns){
      if(r.width<W*.025||r.width>W*.19||r.start<W*.04||r.end>W*.96)continue;
      const ext=yExtent(mask,W,H,r.start,r.end,yA,yB);
      if(ext&&ext.span>=H*.46)digitRuns.push({...r,...ext});
    }
    if(digitRuns.length<2||digitRuns.length>6)return null;
    digitRuns.sort((a,b)=>a.start-b.start);

    const medW=median(digitRuns.map(r=>r.width));
    digitRuns=digitRuns.filter(r=>r.width>=medW*.58&&r.width<=medW*1.48);
    if(digitRuns.length<2||digitRuns.length>6)return null;

    const y0=Math.round(median(digitRuns.map(r=>r.min)));
    const y1=Math.round(median(digitRuns.map(r=>r.max)));
    const h=y1-y0+1;
    if(h<H*.42)return null;

    const decoded=[];
    for(const r of digitRuns){
      const x0=r.start,w=r.width;
      const scores=[
        regionMaxRow(mask,W,H,x0+.18*w,x0+.82*w,y0+.00*h,y0+.18*h),
        regionMaxCol(mask,W,H,x0+.68*w,x0+.98*w,y0+.10*h,y0+.46*h),
        regionMaxCol(mask,W,H,x0+.68*w,x0+.98*w,y0+.54*h,y0+.90*h),
        regionMaxRow(mask,W,H,x0+.18*w,x0+.82*w,y0+.82*h,y0+1.00*h),
        regionMaxCol(mask,W,H,x0+.02*w,x0+.32*w,y0+.54*h,y0+.90*h),
        regionMaxCol(mask,W,H,x0+.02*w,x0+.32*w,y0+.10*h,y0+.46*h),
        regionMaxRow(mask,W,H,x0+.28*w,x0+.72*w,y0+.43*h,y0+.57*h)
      ];

      let ranked=[];
      for(const [digit,pat] of Object.entries(PATTERNS)){
        let cost=0;
        for(let i=0;i<7;i++){
          const expected=pat[i],s=scores[i];
          const d=expected?1-s:s;
          cost+=d*d;
        }
        // LCD reflective: middle segment of 0 can get a faint ghost. Do not
        // promote 0 to 8 unless the middle segment is genuinely strong.
        if(digit==='8'&&scores[6]<.58)cost+=.42;
        if(digit==='0'&&scores[6]<.32)cost-=.10;
        ranked.push({digit,pat,cost});
      }
      ranked.sort((a,b)=>a.cost-b.cost);
      const best=ranked[0],second=ranked[1];
      const on=[],off=[];best.pat.forEach((v,i)=>(v?on:off).push(scores[i]));
      const onAvg=avg(on),offAvg=avg(off),margin=second.cost-best.cost;
      if(best.cost>2.15||onAvg<.43||offAvg>.52)return null;
      const confidence=Math.max(0,Math.min(1,.55+(1-best.cost/2.15)*.28+Math.min(.17,margin*.16)));
      decoded.push({digit:best.digit,confidence,scores});
    }

    // Dot uses a slightly more permissive threshold than the digit segments,
    // because decimal points on LCDs are often lighter than the main segments.
    const dotMask=makeMask(gray,percentileThreshold(gray,Math.min(.20,q+.025)));
    let text='';
    for(let i=0;i<digitRuns.length;i++){
      text+=decoded[i].digit;
      if(i<digitRuns.length-1){
        const left=digitRuns[i].end+1,right=digitRuns[i+1].start;
        if(detectDecimal(dotMask,W,H,left,right,y0,h,medW))text+='.';
      }
    }
    if(!/^\d+(?:\.\d+)?$/.test(text)||Number(text)<=0)return null;

    const widthCV=Math.sqrt(avg(digitRuns.map(r=>(r.width-medW)*(r.width-medW))))/Math.max(1,medW);
    const confidence=avg(decoded.map(d=>d.confidence))*Math.max(.72,1-widthCV*.8);
    return {text,confidence,q,digits:digitRuns.length};
  }

  function recognizeSevenSegment(src){
    const W=900,H=Math.max(260,Math.round(src.height*W/src.width));
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(src,0,0,W,H);
    const img=ctx.getImageData(0,0,W,H),gray=new Uint8Array(W*H);
    for(let i=0,p=0;i<img.data.length;i+=4,p++)gray[p]=Math.round(.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2]);

    const candidates=[];
    for(const q of [.08,.10,.12,.14,.16,.18]){
      try{const r=decodeWithQuantile(gray,W,H,q);if(r)candidates.push(r);}catch(_){}
    }
    if(!candidates.length)return null;
    candidates.sort((a,b)=>{
      const aDecimal=a.text.includes('.')?1:0,bDecimal=b.text.includes('.')?1:0;
      return (bDecimal-aDecimal)||(b.confidence-a.confidence);
    });

    // Consensus across thresholds is stronger than a single threshold.
    const counts={};for(const r of candidates)counts[r.text]=(counts[r.text]||0)+1;
    candidates.sort((a,b)=>{
      const ca=counts[a.text]||0,cb=counts[b.text]||0;
      const ad=a.text.includes('.')?1:0,bd=b.text.includes('.')?1:0;
      return (cb-ca)||(bd-ad)||(b.confidence-a.confidence);
    });
    const best=candidates[0];
    const consensus=Math.min(1,(counts[best.text]||1)/3);
    best.confidence=Math.min(1,best.confidence*.82+consensus*.18);
    if(best.confidence<.66)return null;
    return best;
  }

  window.addEventListener('load',()=>{
    const originalCapture=window.ambilGambarTimbangan;
    if(typeof originalCapture!=='function')return;

    window.ambilGambarTimbangan=async function(){
      try{
        if(typeof localScanner!=='undefined'&&localScanner&&typeof localScanner.drawCrop==='function'){
          const box=$('scanner-box');
          const c=document.createElement('canvas');
          const width=1400,ratio=box.clientHeight/Math.max(1,box.clientWidth);c.width=width;c.height=Math.round(width*ratio);
          if(localScanner.drawCrop(c,c.width,c.height)){
            const result=recognizeSevenSegment(c);
            if(result){
              const preview=$('capture-preview');
              if(preview){preview.width=c.width;preview.height=c.height;preview.getContext('2d').drawImage(c,0,0);preview.style.display='block';}
              try{$('kamera-video').pause();}catch(_){}
              try{localScanner.stop();}catch(_){}
              const cap=$('btn-capture');if(cap)cap.style.display='none';
              const retake=$('btn-retake');if(retake)retake.style.display='none';
              const line=$('scan-line');if(line)line.style.display='none';
              window.suksesScan(result.text,'lokal');
              const src=$('scan-source');if(src)src.textContent=`7-SEG FOTO • ${Math.round(result.confidence*100)}%`;
              const status=$('status-text');if(status)status.textContent='Berat terbaca. Simpan atau koreksi manual.';
              const spinner=$('spinner');if(spinner)spinner.style.display='none';
              return;
            }
          }
        }
      }catch(err){console.warn('7-seg photo reader:',err);}
      return originalCapture();
    };
  });
})();
