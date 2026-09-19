// Gemini scale reader: full-resolution lossless camera frame, no crop, grayscale, resize, or PIN.
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const CAP = 5;
  const URL = 'https://banksampahsukolilo.netlify.app/api/gemini-scale';
  let session = '', attempts = 0, pending = false, abort = null, sequence = 0, activeWaste = '';
  const previousCapture = window.ambilGambarTimbangan;
  function fresh() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    session = [...bytes].map(n => n.toString(16).padStart(2, '0')).join('');
    attempts = 0;
  }
  function cancel() { sequence++; abort?.abort(); abort = null; pending = false; }
  function status(message, loading = false) {
    if ($('status-text')) $('status-text').textContent = message;
    if ($('spinner')) $('spinner').style.display = loading ? 'block' : 'none';
  }
  function showManual() {
    const manual = $('btn-manual');
    if (manual) { manual.style.display = 'flex'; manual.textContent = '⌨️ Input Manual'; }
  }
  function manualOnly(message = 'Lima percobaan belum berhasil. Silakan isi berat manual.') {
    status(message);
    const capture = $('btn-capture');
    if (capture) { capture.disabled = true; capture.style.display = 'none'; }
    if ($('btn-lanjut')) $('btn-lanjut').style.display = 'none';
    showManual();
    window.inputManual?.();
  }
  function retry(message) {
    if (attempts >= CAP) return manualOnly(message + ' Silakan isi berat manual.');
    status(`${message} Silakan ambil ulang (${attempts}/${CAP}).`);
    const capture = $('btn-capture');
    if (capture) { capture.style.display = 'block'; capture.disabled = false; capture.textContent = `↻ Ambil Ulang (${attempts + 1}/${CAP})`; }
    showManual();
  }
  // Camera fixer and navigation shell replace their globals after parsing and on load.
  // Wrap the FINAL implementations, not the initial placeholders.
  function installLifecycle() {
    const start = window.mulaiKamera;
    if (typeof start === 'function' && !start.__geminiWeighSession) {
      const wrapped = function (waste, ...args) {
        const same = !!session && activeWaste === waste && $('camera-ui')?.style.display !== 'none';
        if (!same) { cancel(); fresh(); }
        activeWaste = waste;
        const result = start.call(this, waste, ...args);
        setTimeout(showManual, 350);
        return result;
      };
      wrapped.__geminiWeighSession = true;
      window.mulaiKamera = wrapped;
    }
    const close = window.tutupKamera;
    if (typeof close === 'function' && !close.__geminiWeighClose) {
      const wrapped = function (...args) {
        cancel(); session = ''; attempts = 0; activeWaste = '';
        return close.apply(this, args);
      };
      wrapped.__geminiWeighClose = true;
      window.tutupKamera = wrapped;
    }
    const save = window.simpanKeDatabase;
    if (typeof save === 'function' && !save.__geminiWeighSave) {
      const wrapped = function (...args) {
        const result = save.apply(this, args);
        cancel(); session = ''; attempts = 0; activeWaste = '';
        return result;
      };
      wrapped.__geminiWeighSave = true;
      window.simpanKeDatabase = wrapped;
    }
  }
  window.ambilGambarTimbangan = async function () {
    if (pending) return;
    if (!session) fresh();
    if (attempts >= CAP) return manualOnly();
    const video = $('kamera-video');
    if (!video?.videoWidth || !video?.videoHeight || video.readyState < 2) {
      status('Kamera belum siap. Tunggu sebentar lalu coba lagi.');
      showManual();
      return;
    }
    // Capture directly from video, bypassing scanner.drawCrop() and all LCD filters.
    const photo = document.createElement('canvas');
    photo.width = video.videoWidth;
    photo.height = video.videoHeight;
    photo.getContext('2d').drawImage(video, 0, 0, photo.width, photo.height);
    const image = photo.toDataURL('image/png'); // Lossless, original video dimensions.
    attempts++;
    pending = true;
    const token = ++sequence;
    const capture = $('btn-capture');
    if (capture) capture.disabled = true;
    status(`Gemini membaca foto asli · Percobaan ${attempts}/${CAP}`, true);
    const controller = new AbortController();
    abort = controller;
    const deadline = setTimeout(() => controller.abort(), 42000);
    try {
      const response = await fetch(URL, {
        method: 'POST', mode: 'cors', credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ image, session }), signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      if (token !== sequence || $('camera-ui')?.style.display === 'none') return;
      if (result?.error === 'session_limit') { attempts = CAP; return manualOnly(); }
      const weight = result?.weight;
      if (response.ok && result?.ok === true && typeof weight === 'string' && /^\d{1,3}\.\d{1,3}$/.test(weight) && Number(weight) > 0 && Number(weight) <= 50) {
        const preview = $('capture-preview');
        if (preview) {
          preview.width = photo.width; preview.height = photo.height;
          preview.getContext('2d').drawImage(photo, 0, 0);
          preview.hidden = false; preview.style.display = 'block';
        }
        try { video.pause(); window.localScanner?.stop(); } catch (_) {}
        if (capture) capture.style.display = 'none';
        window.suksesScan?.(weight, 'gemini');
        status('Berat terbaca. Periksa angka sebelum menyimpan.');
        showManual();
        if ($('btn-lanjut')) $('btn-lanjut').style.display = 'block';
        return;
      }
      const message = result?.error === 'image_too_large' ? 'Foto asli terlalu besar untuk dikirim.'
        : result?.error === 'gemini_unavailable' ? 'Layanan Gemini sedang tidak tersedia.'
        : 'Angka belum terbaca pasti.';
      retry(message);
    } catch (_) {
      if (token === sequence && $('camera-ui')?.style.display !== 'none') retry('Koneksi Gemini gagal.');
    } finally {
      clearTimeout(deadline);
      if (token === sequence) {
        pending = false;
        if (abort === controller) abort = null;
        if (capture && attempts < CAP && capture.style.display !== 'none') capture.disabled = false;
      }
    }
  };
  window.banksampahLocalCaptureFallback = previousCapture;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installLifecycle, { once: true });
  else installLifecycle();
  window.addEventListener('load', () => setTimeout(installLifecycle, 180), { once: true });
})();
