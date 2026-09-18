// AI Vision wraps the existing camera handler; no access-code prompt or API key in browser.
// Server enforces five TOTAL AI attempts per Surabaya day across the entire application.
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const originalCapture = window.ambilGambarTimbangan;
  const originalReset = window.resetUniversalCapture;
  const originalCancel = window.cancelUniversalCapture;
  const LIMIT = 5, USAGE_KEY = 'bs_vision_global_quota_v2';
  let generation = 0, pending = false, controller = null;
  const day = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  function remaining() {
    try {
      const stored = JSON.parse(localStorage.getItem(USAGE_KEY) || 'null');
      if (stored?.day === day() && Number.isInteger(stored.remaining)) return Math.max(0, Math.min(LIMIT, stored.remaining));
    } catch (_) {}
    return LIMIT; // Server remains authoritative across users/devices.
  }
  function remember(value) {
    try { localStorage.setItem(USAGE_KEY, JSON.stringify({ day: day(), remaining: Math.max(0, Math.min(LIMIT, value)) })); } catch (_) {}
  }
  function endpoint() {
    const explicit = window.BANK_SAMPAH_VISION_ENDPOINT;
    if (typeof explicit === 'string' && /^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(explicit)) return explicit;
    if (location.hostname === 'banksampahsukolilo.netlify.app') return '/api/vision';
    return null;
  }
  function status(message, loading = false) {
    if ($('status-text')) $('status-text').textContent = message;
    if ($('spinner')) $('spinner').style.display = loading ? 'block' : 'none';
  }
  function cancelPending() {
    generation++;
    controller?.abort(); controller = null; pending = false;
  }
  window.resetUniversalCapture = function (...args) { cancelPending(); return originalReset?.apply(this, args); };
  window.cancelUniversalCapture = function (...args) { cancelPending(); return originalCancel?.apply(this, args); };
  function manualOnly(message) {
    status(message || 'Jatah 5 pembacaan AI aplikasi hari ini habis. Silakan isi berat manual.', false);
    try { $('kamera-video')?.pause(); window.localScanner?.stop(); } catch (_) {}
    const preview = $('capture-preview');
    if (preview) { preview.hidden = true; preview.style.display = 'none'; }
    const capture = $('btn-capture');
    if (capture) { capture.style.display = 'none'; capture.disabled = true; }
    if ($('ai-result')) $('ai-result').style.display = 'none';
    if ($('btn-lanjut')) $('btn-lanjut').style.display = 'none';
    if ($('btn-retake-v19')) $('btn-retake-v19').style.display = 'none';
    const manual = $('btn-manual');
    if (manual) { manual.style.display = 'flex'; manual.textContent = '⌨️ Input Berat Manual'; }
    setTimeout(() => { if ($('camera-ui')?.style.display !== 'none') window.inputManual?.(); }, 0);
  }
  function localFallback() {
    const preview = $('capture-preview');
    if (preview) {
      preview.hidden = true; preview.style.display = 'none';
      preview.getContext('2d')?.clearRect(0, 0, preview.width, preview.height);
    }
    return originalCapture?.();
  }
  window.ambilGambarTimbangan = async function () {
    const url = endpoint();
    if (!url) return originalCapture?.();
    if (pending) return;
    if (remaining() === 0) return manualOnly();
    const scanner = window.localScanner;
    const camera = $('camera-ui'), box = $('scanner-box');
    if (!scanner?.drawCrop || !camera || !box || camera.style.display === 'none') return originalCapture?.();
    const photo = document.createElement('canvas');
    photo.width = 760;
    photo.height = Math.max(1, Math.round(760 * box.clientHeight / Math.max(1, box.clientWidth)));
    if (!scanner.drawCrop(photo, photo.width, photo.height)) return localFallback();
    const token = ++generation;
    pending = true;
    const capture = $('btn-capture');
    if (capture) capture.disabled = true;
    status('Sedang Dibaca AI…', true);
    const abort = new AbortController(); controller = abort;
    const deadline = setTimeout(() => abort.abort(), 14500);
    try {
      const response = await fetch(url, {
        method: 'POST', mode: 'cors', credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ image: photo.toDataURL('image/jpeg', .72) }),
        signal: abort.signal
      });
      const result = await response.json().catch(() => null);
      if (token !== generation || camera.style.display === 'none') return;
      if (response.status === 429 && result?.error === 'vision_limit_reached') {
        remember(0);
        return manualOnly();
      }
      if (Number.isInteger(result?.remaining)) remember(result.remaining);
      const weight = result?.weight;
      if (response.ok && result?.ok === true && typeof weight === 'string' && /^\d{1,3}\.\d{3}$/.test(weight) && Number(weight) > 0 && Number(weight) <= 50) {
        const preview = $('capture-preview');
        if (preview) {
          preview.width = photo.width; preview.height = photo.height;
          preview.getContext('2d')?.drawImage(photo, 0, 0);
          preview.hidden = false; preview.style.display = 'block';
        }
        try { $('kamera-video')?.pause(); scanner.stop(); } catch (_) {}
        if (capture) capture.style.display = 'none';
        window.suksesScan?.(weight, 'ai');
        status('Berat terbaca. Periksa angka sebelum menyimpan.', false);
        if ($('btn-manual')) $('btn-manual').style.display = 'flex';
        if ($('btn-lanjut')) $('btn-lanjut').style.display = 'block';
        return;
      }
      if (remaining() === 0) return manualOnly();
      status('AI belum bisa membaca. Mencoba OCR lokal…', true);
      return localFallback();
    } catch (_) {
      if (token === generation && camera.style.display !== 'none') {
        if (remaining() === 0) return manualOnly();
        status('Koneksi AI gagal. Mencoba OCR lokal…', true);
        return localFallback();
      }
    } finally {
      clearTimeout(deadline);
      if (controller === abort) controller = null;
      if (token === generation) { pending = false; if (capture) capture.disabled = false; }
    }
  };
})();
