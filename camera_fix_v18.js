// Mobile camera initializer. OCR and save logic live in their existing modules.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  function setStatus(text,spinner=false){
    if($('status-text'))$('status-text').textContent=text;
    if($('spinner'))$('spinner').style.display=spinner?'block':'none';
  }
  function clearPreviousCapture(){
    // The OCR module owns its session counter and cached photo.
    if(typeof window.resetUniversalCapture==='function')window.resetUniversalCapture();
    const preview=$('capture-preview');
    if(preview){preview.style.display='none';preview.hidden=true;const ctx=preview.getContext('2d');if(ctx)ctx.clearRect(0,0,preview.width,preview.height);}
    const box=$('scanner-box');if(box)box.classList.remove('photo-captured');
    ['ai-result','btn-lanjut','btn-manual','btn-retake-v19'].forEach(id=>{const el=$(id);if(el)el.style.display='none';});
    $('camera-ui')?.querySelector('.scanner-actions')?.classList.remove('success-v19');
    const tip=$('scanner-tip');if(tip)tip.textContent='Posisikan angka timbangan di dalam area, lalu tekan Ambil Gambar.';
  }
  function stopStreams(){
    try{if(window.localScanner){window.localScanner.stop();window.localScanner=null;}}catch(_){}
    try{if(window.streamKamera){window.streamKamera.getTracks().forEach(t=>t.stop());window.streamKamera=null;}}catch(_){}
    const v=$('kamera-video');if(v){try{v.pause();}catch(_){}try{v.srcObject=null;}catch(_){} }
  }
  function withTimeout(p,ms){return Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error('camera-timeout')),ms))]);}
  async function getStream(){
    const constraints=[
      {video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false},
      {video:{facingMode:'environment'},audio:false},
      {video:true,audio:false}
    ];
    let lastError;
    for(const c of constraints){try{return await withTimeout(navigator.mediaDevices.getUserMedia(c),9000);}catch(err){lastError=err;}}
    throw lastError||new Error('camera-unavailable');
  }
  async function readyVideo(video){
    video.muted=true;video.playsInline=true;video.setAttribute('playsinline','');
    await withTimeout(video.play(),5000);
    const started=Date.now();
    while((!video.videoWidth||!video.videoHeight)&&Date.now()-started<5000)await new Promise(resolve=>setTimeout(resolve,100));
    if(!video.videoWidth||!video.videoHeight)throw new Error('video-no-frame');
  }
  function captureButton(retry=false){
    const btn=$('btn-capture');if(!btn)return;
    btn.style.display='block';btn.disabled=false;btn.style.opacity='1';btn.style.pointerEvents='auto';
    btn.textContent=retry?'↻ Coba Kamera Lagi':'📸 Ambil Gambar';
    btn.onclick=retry?()=>window.mulaiKamera(window.jenisSampahAktif||'Sampah'):()=>window.ambilGambarTimbangan?.();
  }
  function install(){
    window.mulaiKamera=async function(namaSampah){
      try{window.tutupModalPaksa?.();}catch(_){}
      window.jenisSampahAktif=namaSampah;
      try{jenisSampahAktif=namaSampah;}catch(_){}
      clearPreviousCapture();
      stopStreams();
      const ui=$('camera-ui');if(ui)ui.style.display='block';
      const btn=$('btn-capture');if(btn){btn.style.display='block';btn.disabled=true;btn.textContent='📷 Menyiapkan Kamera…';btn.style.opacity='.55';}
      setStatus('Menyiapkan kamera…',true);
      if(!navigator.mediaDevices?.getUserMedia){
        setStatus('Browser tidak mendukung kamera. Gunakan input manual.',false);
        if($('btn-manual'))$('btn-manual').style.display='block';captureButton(true);return;
      }
      try{
        const stream=await getStream();
        window.streamKamera=stream;try{streamKamera=stream;}catch(_){}
        const video=$('kamera-video');if(!video)throw new Error('video-element-missing');
        video.srcObject=stream;await readyVideo(video);
        const track=stream.getVideoTracks()[0];
        const caps=track&&track.getCapabilities?track.getCapabilities():{};
        try{if(Array.isArray(caps.focusMode)&&caps.focusMode.includes('continuous'))await track.applyConstraints({advanced:[{focusMode:'continuous'}]});}catch(_){}
        if($('btn-torch'))$('btn-torch').style.display='none';
        if(typeof window.ScaleLocalScanner==='function'){
          try{
            const scanner=new window.ScaleLocalScanner({video,scannerBox:$('scanner-box'),workCanvas:$('canvas-local'),onStatus:()=>{},onFallback:()=>{},onReading:value=>window.suksesScan?.(value,'lokal')});
            window.localScanner=scanner;try{localScanner=scanner;}catch(_){}
            scanner.stop();
          }catch(err){console.warn('Scanner initialization skipped:',err);}
        }
        captureButton();setStatus('Kamera siap. Arahkan angka lalu tekan Ambil Gambar.',false);
      }catch(err){
        console.error('Camera initialization failed:',err);stopStreams();
        const msg=err?.name==='NotAllowedError'?'Izin kamera ditolak. Aktifkan izin kamera dan coba lagi.':err?.name==='NotFoundError'?'Kamera tidak ditemukan. Gunakan input manual.':'Kamera tidak dapat dibuka. Coba lagi atau input manual.';
        setStatus(msg,false);if($('btn-manual'))$('btn-manual').style.display='block';captureButton(true);
      }
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>setTimeout(install,0),{once:true});
})();