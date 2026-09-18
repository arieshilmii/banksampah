// AI Vision capture path. This is a real feature module, not another camera initializer.
// GitHub Pages has no server: set BANK_SAMPAH_VISION_ENDPOINT only after securing and deploying a backend.
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const originalCapture = window.ambilGambarTimbangan;
  const originalReset = window.resetUniversalCapture;
  const originalCancel = window.cancelUniversalCapture;
  let generation = 0;
  let pending = false;

  window.resetUniversalCapture = function (...args) {
    generation++;
    pending = false;
    return originalReset?.apply(this, args);
  };
  window.cancelUniversalCapture = function (...args) {
    generation++;
    pending = false;
    return originalCancel?.apply(this, args);
  };

  function endpoint() {
    const explicit = window.BANK_SAMPAH_VISION_ENDPOINT;
    if (typeof explicit === 'string' && /^https:\/\//.test(explicit)) return explicit;
    if (location.hostname === 'banksampahsukolilo.netlify.app') return '/api/vision';
    return null; // No secret or server-side code can run on GitHub Pages.
  }
  function status(text, loading = false) {
    if ($('status-text')) $('status-text').textContent = text;
    if ($('spinner')) $('spinner').style.display = loading ? 'block' : 'none';
  }
  function restoreLocal() {
    const preview = $('capture-preview');
    if (preview) {
      preview.hidden = true;
      preview.style.display = 'none';
      preview.getContext('2d')?.clearRect(0, 0, preview.width, preview.height);
    }
    originalCapture?.();
  }

  window.ambilGambarTimbangan = async function () {
    const url = endpoint();
    if (!url) return originalCapture?.();
    if (pending) return;
    const scanner = window.localScanner;
    const camera = $('camera-ui');
    const frame = $('scanner-box');
    if (!scanner?.drawCrop || !camera || !frame || camera.style.display === 'none') {
      return originalCapture?.();
    }
    const photo = document.createElement('canvas');
    photo.width = 900;
    photo.height = Math.max(1, Math.round(900 * frame.clientHeight / Math.max(1, frame.clientWidth)));
    if (!scanner.drawCrop(photo, photo.width, photo.height)) return originalCapture?.();

    const token = ++generation;
    pending = true;
    const captureButton = $('btn-capture');
    if (captureButton) captureButton.disabled = true;
    status('Sedang Dibaca AI', true);
    const abort = new AbortController();
    const deadline = setTimeout(() => abort.abort(), 14500);
    try {
      // Image is a JPEG of scanner/LCD only; never send the full camera frame.
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo.toDataURL('image/jpeg', .82) }),
        signal: abort.signal
      });
      if (!response.ok) throw new Error('vision_http_' + response.status);
      const result = await response.json();
      if (token !== generation || camera.style.display === 'none') return;
      const weight = result?.weight;
      if (result?.ok !== true || typeof weight !== 'string' || !/^\d{1,3}\.\d{3}$/.test(weight) || !(Number(weight) > 0 && Number(weight) <= 50)) {
        restoreLocal();
        return;
      }
      // Store the photographed ROI for visual review; do not auto-save the weight.
      const preview = $('capture-preview');
      if (preview) {
        preview.width = photo.width;
        preview.height = photo.height;
        preview.getContext('2d')?.drawImage(photo, 0, 0);
        preview.hidden = false;
        preview.style.display = 'block';
      }
      try { $('kamera-video')?.pause(); scanner.stop(); } catch (_) {}
      if (captureButton) captureButton.style.display = 'none';
      window.suksesScan?.(weight, 'ai');
      status('Berat terbaca. Periksa angka sebelum menyimpan.', false);
      if ($('btn-manual')) $('btn-manual').style.display = 'flex';
      if ($('btn-lanjut')) $('btn-lanjut').style.display = 'block';
    } catch (error) {
      if (token === generation && camera.style.display !== 'none') {
        console.info('Vision unavailable; switching to local OCR:', error?.message || error);
        status('AI Vision belum tersedia. Mencoba OCR lokal…', true);
        restoreLocal();
      }
    } finally {
      clearTimeout(deadline);
      if (token === generation) {
        pending = false;
        if (captureButton) captureButton.disabled = false;
      }
    }
  };
})();
