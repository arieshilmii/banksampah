// Optional AI Vision capture route. This module is loaded LAST, after the existing camera UI.
// No API key or server access secret is embedded in this public frontend.
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const originalCapture = window.ambilGambarTimbangan;
  const originalReset = window.resetUniversalCapture;
  const originalCancel = window.cancelUniversalCapture;
  const LIMIT = 5;
  const DEVICE_KEY = 'bs_vision_device_v1';
  const USAGE_KEY = 'bs_vision_daily_usage_v1';
  let generation = 0, pending = false, controller = null, accessCode = '';

  const jakartaDay = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  function usage() {
    try {
      const value = JSON.parse(localStorage.getItem(USAGE_KEY) || 'null');
      if (value?.day === jakartaDay() && Number.isInteger(value.count)) {
        return { day: value.day, count: Math.min(LIMIT, Math.max(0, value.count)) };
      }
    } catch (_) { /* Use zero on first visit or invalid local state. */ }
    return { day: jakartaDay(), count: 0 };
  }
  function saveCount(count) {
    localStorage.setItem(USAGE_KEY, JSON.stringify({ day: jakartaDay(), count: Math.min(LIMIT, Math.max(0, count)) }));
  }
  function remaining() { return Math.max(0, LIMIT - usage().count); }
  function deviceID() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (id && /^[a-f0-9]{32}$/.test(id)) return id;
    if (!crypto?.getRandomValues) return null;
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    id = Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(DEVICE_KEY, id);
    return id;
  }
  function endpoint() {
    const configured = window.BANK_SAMPAH_VISION_ENDPOINT;
    if (typeof configured === 'string' && /^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(configured)) return configured;
    if (location.hostname === 'banksampahsukolilo.netlify.app') return '/api/vision';
    return null; // GitHub Pages uses local OCR until an explicit HTTPS backend is configured.
  }
  function status(text, loading = false) {
    if ($('status-text')) $('status-text').textContent = text;
    if ($('spinner')) $('spinner').style.display = loading ? 'block' : 'none';
  }
  function cancelPending() {
    generation++;
    controller?.abort();
    controller = null;
    pending = false;
  }
  window.resetUniversalCapture = function (...args) {
    cancelPending();
    return originalReset?.apply(this, args);
  };
  window.cancelUniversalCapture = function (...args) {
    cancelPending();
    return originalCancel?.apply(this, args);
  };
  function manualOnly(message) {
    status(message || 'Batas 5 pembacaan AI hari ini tercapai. Silakan input berat manual.', false);
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
    // Use the custom manual modal already implemented by ui_camera_v17.js.
    setTimeout(() => { if ($('camera-ui')?.style.display !== 'none') window.inputManual?.(); }, 0);
  }
  function localFallback() {
    const preview = $('capture-preview');
    if (preview) {
      preview.hidden = true;
      preview.style.display = 'none';
      preview.getContext('2d')?.clearRect(0, 0, preview.width, preview.height);
    }
    return originalCapture?.();
  }
  function obtainAccessCode() {
    if (accessCode) return accessCode;
    const value = window.prompt('Masukkan kode akses AI Vision dari admin Bank Sampah:');
    if (value === null) return null;
    accessCode = String(value).trim();
    return accessCode.length >= 16 ? accessCode : null;
  }
  window.ambilGambarTimbangan = async function () {
    const url = endpoint();
    if (!url) return originalCapture?.();
    if (pending) return;
    if (remaining() === 0) return manualOnly();
    const scanner = window.localScanner;
    const camera = $('camera-ui'), box = $('scanner-box');
    if (!scanner?.drawCrop || !camera || !box || camera.style.display === 'none') return originalCapture?.();
    const code = obtainAccessCode();
    if (!code) return manualOnly('Kode akses AI belum tersedia. Silakan input berat manual.');
    const id = deviceID();
    if (!id) return manualOnly('Perangkat tidak mendukung identitas aman. Silakan input manual.');
    const photo = document.createElement('canvas');
    photo.width = 760;
    photo.height = Math.max(1, Math.round(760 * box.clientHeight / Math.max(1, box.clientWidth)));
    if (!scanner.drawCrop(photo, photo.width, photo.height)) return localFallback();
    const token = ++generation;
    pending = true;
    saveCount(usage().count + 1); // Reserve locally BEFORE sending, including failed/unclear readings.
    const capture = $('btn-capture');
    if (capture) capture.disabled = true;
    status(`Sedang Dibaca AI · Percobaan ${LIMIT - remaining()}/${LIMIT}`, true);
    const abort = new AbortController();
    controller = abort;
    const deadline = setTimeout(() => abort.abort(), 14500);
    try {
      // Plain text avoids a browser CORS preflight counting as another Netlify request.
      const response = await fetch(url, {
        method: 'POST', mode: 'cors', credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ image: photo.toDataURL('image/jpeg', .72), device: id, accessCode: code }),
        signal: abort.signal
      });
      const result = await response.json().catch(() => null);
      if (token !== generation || camera.style.display === 'none') return;
      if (response.status === 429 && result?.error === 'vision_limit_reached') {
        saveCount(LIMIT);
        return manualOnly();
      }
      if (response.status === 401) {
        accessCode = '';
        return manualOnly('Kode akses AI tidak sesuai. Silakan input manual atau hubungi admin.');
      }
      if (typeof result?.remaining === 'number') saveCount(Math.max(usage().count, LIMIT - result.remaining));
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
    } catch (error) {
      if (token === generation && camera.style.display !== 'none') {
        if (remaining() === 0) return manualOnly();
        status('Koneksi AI gagal. Mencoba OCR lokal…', true);
        return localFallback();
      }
    } finally {
      clearTimeout(deadline);
      if (controller === abort) controller = null;
      if (token === generation) {
        pending = false;
        if (capture) capture.disabled = false;
      }
    }
  };
})();
