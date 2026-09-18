// AI Vision: five attempts PER WEIGHING SESSION; no code prompt and no daily quota.
// The server enforces the same five-attempt limit for a random session identifier.
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const originalCapture = window.ambilGambarTimbangan;
  const originalReset = window.resetUniversalCapture;
  const originalCancel = window.cancelUniversalCapture;
  const LIMIT = 5;
  let generation = 0, pending = false, controller = null;
  let session = null, attempts = 0, completed = false;

  function newSession() {
    const bytes = new Uint8Array(16);
    if (!window.crypto?.getRandomValues && !crypto?.getRandomValues) return false;
    (window.crypto || crypto).getRandomValues(bytes);
    session = Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('');
    attempts = 0;
    completed = false;
    return true;
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

  // Opening a new category/after leaving the camera starts a fresh weighing session.
  // Pressing 'Ambil Ulang' keeps the same session (and accumulated failed attempts).
  function wrapCameraLifecycle() {
    if (typeof window.mulaiKamera === 'function' && !window.mulaiKamera.__visionSession) {
      const original = window.mulaiKamera;
      const wrapped = function (name, ...rest) {
        if (!session || completed || $('camera-ui')?.style.display === 'none' || (window.jenisSampahAktif && name !== window.jenisSampahAktif)) newSession();
        return original.call(this, name, ...rest);
      };
      wrapped.__visionSession = true;
      window.mulaiKamera = wrapped;
    }
    if (typeof window.tutupKamera === 'function' && !window.tutupKamera.__visionSession) {
      const original = window.tutupKamera;
      const wrapped = function (...args) {
        cancelPending(); session = null; attempts = 0; completed = false;
        return original.apply(this, args);
      };
      wrapped.__visionSession = true;
      window.tutupKamera = wrapped;
    }
    if (typeof window.suksesScan === 'function' && !window.suksesScan.__visionSession) {
      const original = window.suksesScan;
      const wrapped = function (...args) { completed = true; return original.apply(this, args); };
      wrapped.__visionSession = true;
      window.suksesScan = wrapped;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrapCameraLifecycle, { once: true });
  else wrapCameraLifecycle();
  window.addEventListener('load', wrapCameraLifecycle, { once: true });

  function manualOnly(message) {
    status(message || 'Lima percobaan AI belum berhasil. Silakan input berat manual.', false);
    try { $('kamera-video')?.pause(); window.localScanner?.stop(); } catch (_) {}
    const preview = $('capture-preview');
    if (preview) { preview.hidden = true; preview.style.display = 'none'; }
    const capture = $('btn-capture');
    if (capture) { capture.style.display = 'none'; capture.disabled = true; }
    const actions = $('camera-ui')?.querySelector('.scanner-actions');
    actions?.classList.remove('success-v19');
    if ($('ai-result')) $('ai-result').style.display = 'none';
    if ($('btn-lanjut')) $('btn-lanjut').style.display = 'none';
    if ($('btn-retake-v19')) $('btn-retake-v19').style.display = 'none';
    const manual = $('btn-manual');
    if (manual) { manual.style.display = 'flex'; manual.textContent = '⌨️ Input Berat Manual'; }
    setTimeout(() => { if ($('camera-ui')?.style.display !== 'none') window.inputManual?.(); }, 0);
  }
  function retryOrManual(message) {
    if (attempts >= LIMIT) return manualOnly('Percobaan ke-5 belum berhasil. Silakan input berat manual.');
    status(`${message} Percobaan ${attempts}/${LIMIT}. Ambil ulang atau input manual.`, false);
    const capture = $('btn-capture');
    if (capture) capture.style.display = 'none';
    if ($('btn-lanjut')) $('btn-lanjut').style.display = 'none';
    if ($('ai-result')) $('ai-result').style.display = 'none';
    const actions = $('camera-ui')?.querySelector('.scanner-actions');
    actions?.classList.add('success-v19');
    const manual = $('btn-manual');
    if (manual) { manual.style.display = 'flex'; manual.textContent = '⌨️ Input Manual'; }
    const retry = $('btn-retake-v19');
    if (retry) { retry.style.display = 'flex'; retry.textContent = '↻ Ambil Ulang'; }
  }

  window.ambilGambarTimbangan = async function () {
    const url = endpoint();
    if (!url) return originalCapture?.();
    if (pending) return;
    if (attempts >= LIMIT) return manualOnly();
    if (!session && !newSession()) return manualOnly('Kamera tidak dapat membuat sesi. Silakan input manual.');
    const scanner = window.localScanner;
    const camera = $('camera-ui'), box = $('scanner-box');
    if (!scanner?.drawCrop || !camera || !box || camera.style.display === 'none') {
      return retryOrManual('Kamera belum siap.');
    }
    const photo = document.createElement('canvas');
    photo.width = 760;
    photo.height = Math.max(1, Math.round(760 * box.clientHeight / Math.max(1, box.clientWidth)));
    if (!scanner.drawCrop(photo, photo.width, photo.height)) return retryOrManual('Gambar gagal diambil.');
    const token = ++generation;
    pending = true;
    attempts++; // Count a submitted photo before network activity; do not exceed five attempts.
    const capture = $('btn-capture');
    if (capture) capture.disabled = true;
    status(`Sedang Dibaca AI · Percobaan ${attempts}/${LIMIT}`, true);
    const abort = new AbortController(); controller = abort;
    const deadline = setTimeout(() => abort.abort(), 14500);
    try {
      const response = await fetch(url, {
        method: 'POST', mode: 'cors', credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ image: photo.toDataURL('image/jpeg', .72), session }),
        signal: abort.signal
      });
      const result = await response.json().catch(() => null);
      if (token !== generation || camera.style.display === 'none') return;
      if (response.status === 429 && result?.error === 'vision_limit_reached') {
        attempts = LIMIT;
        return manualOnly();
      }
      if (Number.isInteger(result?.remaining)) attempts = Math.max(attempts, LIMIT - result.remaining);
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
        completed = true;
        window.suksesScan?.(weight, 'ai');
        status('Berat terbaca. Periksa angka sebelum menyimpan.', false);
        if ($('btn-manual')) $('btn-manual').style.display = 'flex';
        if ($('btn-lanjut')) $('btn-lanjut').style.display = 'block';
        return;
      }
      return retryOrManual('Angka belum terbaca pasti.');
    } catch (_) {
      if (token === generation && camera.style.display !== 'none') return retryOrManual('Koneksi AI gagal.');
    } finally {
      clearTimeout(deadline);
      if (controller === abort) controller = null;
      if (token === generation) { pending = false; if (capture) capture.disabled = false; }
    }
  };
})();
