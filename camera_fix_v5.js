// Camera startup v5: robust mobile initialization for capture-first scanner.
(function(){
  'use strict';
  const $ = id => document.getElementById(id);

  function setStatus(text, spinner=false){
    const t=$('status-text'); if(t) t.textContent=text;
    const s=$('spinner'); if(s) s.style.display=spinner?'block':'none';
  }

  function setCapturePreparing(){
    const b=$('btn-capture');
    if(!b) return;
    b.style.display='block';
    b.disabled=true;
    b.textContent='📷 Menyiapkan Kamera…';
    b.style.opacity='.58';
    b.style.pointerEvents='none';
  }

  function setCaptureReady(){
    const b=$('btn-capture');
    if(!b) return;
    b.disabled=false;
    b.textContent='📸 Ambil Gambar';
    b.style.opacity='1';
    b.style.pointerEvents='auto';
    b.onclick=()=>window.ambilGambarTimbangan();
  }

  function setCaptureRetry(){
    const b=$('btn-capture');
    if(!b) return;
    b.disabled=false;
    b.textContent='↻ Coba Kamera Lagi';
    b.style.opacity='1';
    b.style.pointerEvents='auto';
    b.onclick=()=>window.mulaiKamera(jenisSampahAktif);
  }

  function stopCurrentCamera(){
    try { if(localScanner){ localScanner.stop(); localScanner=null; } } catch(_) {}
    try { if(streamKamera){ streamKamera.getTracks().forEach(t=>t.stop()); streamKamera=null; } } catch(_) {}
    const video=$('kamera-video');
    if(video){
      try{ video.pause(); }catch(_){}
      try{ video.srcObject=null; }catch(_){}
    }
  }

  function withTimeout(promise, ms, label){
    let timer;
    const timeout=new Promise((_,reject)=>{
      timer=setTimeout(()=>reject(new Error(label||'timeout')),ms);
    });
    return Promise.race([promise,timeout]).finally(()=>clearTimeout(timer));
  }

  async function requestStream(){
    const constraints={
      video:{
        facingMode:{ideal:'environment'},
        width:{ideal:1280},
        height:{ideal:720}
      },
      audio:false
    };
    const pending=navigator.mediaDevices.getUserMedia(constraints);
    try{
      return await withTimeout(pending,8000,'camera-timeout');
    }catch(err){
      // If the timed-out request resolves later, stop it so it cannot keep the camera locked.
      if(err?.message==='camera-timeout'){
        pending.then(s=>s.getTracks().forEach(t=>t.stop())).catch(()=>{});
      }
      throw err;
    }
  }

  async function waitForVideo(video){
    video.muted=true;
    video.setAttribute('playsinline','');
    video.playsInline=true;
    await withTimeout(video.play(),4000,'video-play-timeout');
    const start=performance.now();
    while((!video.videoWidth || !video.videoHeight) && performance.now()-start<4000){
      await new Promise(r=>setTimeout(r,80));
    }
    if(!video.videoWidth || !video.videoHeight) throw new Error('video-no-frames');
  }

  window.addEventListener('load',()=>{
    // Loaded last, so this becomes the canonical camera initializer after older wrappers.
    window.mulaiKamera=async function(namaSampah){
      try{ if(typeof tutupModalPaksa==='function') tutupModalPaksa(); }catch(_){}

      jenisSampahAktif=namaSampah;
      beratTerbaca=0;
      beratTeksTerbaca='';
      torchAktif=false;
      stopCurrentCamera();

      const ui=$('camera-ui'); if(ui) ui.style.display='block';
      const title=$('cam-title'); if(title) title.textContent=`Menimbang ${namaSampah}`;
      const result=$('ai-result'); if(result) result.style.display='none';
      const next=$('btn-lanjut'); if(next) next.style.display='none';
      const manual=$('btn-manual'); if(manual) manual.style.display='none';
      const retake=$('btn-retake'); if(retake) retake.style.display='none';
      const line=$('scan-line'); if(line) line.style.display='block';
      const source=$('scan-source'); if(source) source.textContent='LOCAL OCR';
      const preview=$('capture-preview'); if(preview) preview.style.display='none';
      const torch=$('btn-torch'); if(torch) torch.style.display='none';

      setCapturePreparing();
      setStatus('Menyiapkan kamera…',true);

      if(!navigator.mediaDevices?.getUserMedia){
        setStatus('Browser tidak mendukung akses kamera. Silakan input berat manual.',false);
        if(manual) manual.style.display='block';
        setCaptureRetry();
        return;
      }

      try{
        streamKamera=await requestStream();
        const video=$('kamera-video');
        video.srcObject=streamKamera;
        await waitForVideo(video);

        const track=streamKamera.getVideoTracks()[0];
        const caps=track?.getCapabilities ? track.getCapabilities() : {};
        try{
          if(Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')){
            await track.applyConstraints({advanced:[{focusMode:'continuous'}]});
          }
        }catch(_){}
        if(torch) torch.style.display=caps.torch?'flex':'none';

        localScanner=new ScaleLocalScanner({
          video,
          scannerBox:$('scanner-box'),
          workCanvas:$('canvas-local'),
          onStatus:()=>{},
          onFallback:()=>{},
          onReading:(text)=>window.suksesScan(text,'lokal')
        });
        // Capture-first: scanner exists only to crop the frame; do not start live OCR loop.
        try{ localScanner.stop(); }catch(_){}

        setCaptureReady();
        setStatus('Kamera siap. Arahkan angka lalu tekan Ambil Gambar.',false);
      }catch(err){
        console.error('Camera startup failed:',err);
        stopCurrentCamera();
        const msg=err?.name==='NotAllowedError'
          ? 'Izin kamera belum diberikan. Aktifkan izin kamera lalu coba lagi.'
          : err?.name==='NotFoundError'
            ? 'Kamera tidak ditemukan. Silakan input berat manual.'
            : err?.message==='camera-timeout'
              ? 'Kamera belum merespons. Tekan Coba Kamera Lagi.'
              : 'Kamera tidak dapat dibuka. Coba kamera lagi atau input manual.';
        setStatus(msg,false);
        if(manual) manual.style.display='block';
        setCaptureRetry();
      }
    };
  });
})();
