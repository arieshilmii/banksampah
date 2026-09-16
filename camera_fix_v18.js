// Camera v18 — robust mobile camera fallback without changing scanner/OCR business logic.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);

  function setStatus(text,spinner=false){
    const t=$('status-text'); if(t)t.textContent=text;
    const s=$('spinner'); if(s)s.style.display=spinner?'block':'none';
  }
  function stopStreams(){
    try{ if(window.localScanner){window.localScanner.stop();window.localScanner=null;} }catch(_){}
    try{ if(window.streamKamera){window.streamKamera.getTracks().forEach(t=>t.stop());window.streamKamera=null;} }catch(_){}
    const v=$('kamera-video');
    if(v){try{v.pause();}catch(_){} try{v.srcObject=null;}catch(_){} }
  }
  function timeout(p,ms){
    return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('camera-timeout')),ms))]);
  }
  async function getStream(){
    const tries=[
      {video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false},
      {video:{facingMode:'environment'},audio:false},
      {video:true,audio:false}
    ];
    let lastErr;
    for(const c of tries){
      try{return await timeout(navigator.mediaDevices.getUserMedia(c),9000);}catch(e){lastErr=e;}
    }
    throw lastErr||new Error('camera-unavailable');
  }
  async function readyVideo(video){
    video.muted=true;video.playsInline=true;video.setAttribute('playsinline','');
    await timeout(video.play(),5000);
    const start=Date.now();
    while((!video.videoWidth||!video.videoHeight)&&Date.now()-start<5000){await new Promise(r=>setTimeout(r,100));}
    if(!video.videoWidth||!video.videoHeight)throw new Error('video-no-frame');
  }
  function setCaptureRetry(){
    const b=$('btn-capture'); if(!b)return;
    b.style.display='block';b.disabled=false;b.textContent='↻ Coba Kamera Lagi';b.style.opacity='1';b.style.pointerEvents='auto';
    b.onclick=()=>window.mulaiKamera(window.jenisSampahAktif||'Sampah');
  }
  function setCaptureReady(){
    const b=$('btn-capture'); if(!b)return;
    b.style.display='block';b.disabled=false;b.textContent='📸 Ambil Gambar';b.style.opacity='1';b.style.pointerEvents='auto';
    b.onclick=()=>window.ambilGambarTimbangan&&window.ambilGambarTimbangan();
  }

  function install(){
    window.mulaiKamera=async function(namaSampah){
      try{if(typeof window.tutupModalPaksa==='function')window.tutupModalPaksa();}catch(_){}
      window.jenisSampahAktif=namaSampah;
      try{jenisSampahAktif=namaSampah;}catch(_){}
      stopStreams();

      const ui=$('camera-ui'); if(ui)ui.style.display='block';
      const result=$('ai-result'); if(result)result.style.display='none';
      const next=$('btn-lanjut'); if(next)next.style.display='none';
      const manual=$('btn-manual'); if(manual)manual.style.display='none';
      const retry=$('btn-capture'); if(retry){retry.style.display='block';retry.disabled=true;retry.textContent='📷 Menyiapkan Kamera…';retry.style.opacity='.55';}
      setStatus('Menyiapkan kamera…',true);

      if(!navigator.mediaDevices?.getUserMedia){
        setStatus('Browser tidak mendukung akses kamera. Gunakan input manual.',false);
        if(manual)manual.style.display='block';setCaptureRetry();return;
      }
      try{
        const stream=await getStream();
        window.streamKamera=stream; try{streamKamera=stream;}catch(_){}
        const video=$('kamera-video'); if(!video)throw new Error('video-element-missing');
        video.srcObject=stream; await readyVideo(video);

        const track=stream.getVideoTracks()[0];
        const caps=track&&track.getCapabilities?track.getCapabilities():{};
        try{if(Array.isArray(caps.focusMode)&&caps.focusMode.includes('continuous'))await track.applyConstraints({advanced:[{focusMode:'continuous'}]});}catch(_){}
        const torch=$('btn-torch'); if(torch)torch.style.display='none';

        if(typeof window.ScaleLocalScanner==='function'){
          try{
            const scanner=new window.ScaleLocalScanner({video,scannerBox:$('scanner-box'),workCanvas:$('canvas-local'),onStatus:()=>{},onFallback:()=>{},onReading:t=>window.suksesScan&&window.suksesScan(t,'lokal')});
            window.localScanner=scanner; try{localScanner=scanner;}catch(_){}
            try{scanner.stop();}catch(_){}
          }catch(e){console.warn('Scanner init skipped:',e);}
        }
        setCaptureReady();setStatus('Kamera siap. Arahkan angka lalu tekan Ambil Gambar.',false);
      }catch(err){
        console.error('Camera v18 failed:',err);stopStreams();
        const msg=err?.name==='NotAllowedError'?'Izin kamera ditolak. Aktifkan izin kamera di browser lalu coba lagi.':err?.name==='NotFoundError'?'Kamera tidak ditemukan. Gunakan input manual.':'Kamera tidak dapat dibuka. Coba kamera lagi atau input manual.';
        setStatus(msg,false);if(manual)manual.style.display='block';setCaptureRetry();
      }
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>setTimeout(install,0),{once:true});
})();
