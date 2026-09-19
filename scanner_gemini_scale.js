// Gemini scale reader: lossless full camera frame, no grayscale, crop, resize or user PIN.
// Five captures belong to one weighing session; saving/closing resets the counter.
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const CAP = 5;
  const ENDPOINT = 'https://banksampahsukolilo.netlify.app/api/gemini-scale';
  let session = '', attempts = 0, pending = false, abort = null, sequence = 0, activeWaste = '';
  const previousCapture = window.ambilGambarTimbangan;
  const previousStart = window.mulaiKamera;
  const previousClose = window.tutupKamera;
  const previousSave = window.simpanKeDatabase;
  function freshSession() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    session = Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
    attempts = 0;
  }
  function cancel() { sequence++; abort?.abort(); abort = null; pending = false; }
  function status(message, loading = false) {
    if ($('status-text')) $('status-text').textContent = message;
    if ($('spinner')) $('spinner').style.display = loading ? 'block' : 'none';
  }
  function showManual() {
    if ($('btn-manual')) { $('btn-manual').style.display = 'flex'; $('btn-manual').textContent = '⌨️ Input Manual'; }
  }
  function finalManual(message) {
    status(message || 'Lima percobaan belum berhasil. Silakan isi berat manual.');
    const btn = $('btn-capture');
    if (btn) { btn.disabled = true; btn.style.display = 'none'; }
    if ($('btn-lanjut')) $('btn-lanjut').style.display = 'none';
    showManual();
    window.inputManual?.();
  }
  function retry(message) {
    if (attempts >= CAP) return finalManual(message);
    status(`${message} Silakan ambil ulang (${attempts}/${CAP}).`);
    const btn = $('btn-capture');
    if (btn) { btn.style.display = 'block'; btn.disabled = false; btn.textContent = `↻ Ambil Ulang (${attempts + 1}/${CAP})`; }
    showManual();
  }
  window.mulaiKamera = function (waste, ...rest) {
    const sameWeighing = !!session && activeWaste === waste && $('camera-ui')?.style.display !== 'none';
    if (!sameWeighing) { cancel(); freshSession(); }
    activeWaste = waste;
    const result = previousStart?.call(this, waste, ...rest);
    // Make the manual option available without waiting for a failed AI request.
    setTimeout(showManual, 350);
    return result;
  };
  window.tutupKamera = function (...args) { cancel(); session = ''; attempts = 0; activeWaste = ''; return previousClose?.apply(this, args); };
  window.simpanKeDatabase = function (...args) { const result = previousSave?.apply(this, args); cancel(); session = ''; attempts = 0; return result; };
  window.ambilGambarTimbangan = async function () {
    if (pending) return;
    if (!session) freshSession();
    if (attempts >= CAP) return finalManual();
    const video = $('kamera-video');
    if (!video?.videoWidth || !video?.videoHeight || video.readyState < 2) return retry('Kamera belum siap.');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    // PNG is lossless. The entire native-resolution camera frame goes to Gemini.
    const image = canvas.toDataURL('image/png');
    attempts++;
    pending = true;
    const token = ++sequence;
    const button = $('btn-capture');
    if (button) button.disabled = true;
    status(`Gemini membaca foto asli · Percobaan ${attempts}/${CAP}`, true);
    abort = new AbortController();
    const deadline = setTimeout(() => abort?.abort(), 42000);
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST', mode: 'cors', credentials: 'omit',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ image, session }), signal: abort.signal
      });
      const data = await response.json().catch(() => null);
      if (token !== sequence || $('camera-ui')?.style.display === 'none') return;
      if (data?.error === 'session_limit') { attempts = CAP; return finalManual(); }
      const value = data?.weight;
      if (response.ok && data?.ok === true && typeof value === 'string' && /^\d{1,3}\.\d{1,3}$/.test(value) && Number(value) > 0 && Number(value) <= 50) {
        const preview = $('capture-preview');
        if (preview) {
          preview.width = canvas.width; preview.height = canvas.height;
          preview.getContext('2d').drawImage(canvas, 0, 0);
          preview.hidden = false; preview.style.display = 'block';
        }
        try { video.pause(); window.localScanner?.stop(); } catch (_) {}
        if (button) button.style.display = 'none';
        window.suksesScan?.(value, 'gemini');
        status('Berat terbaca. Periksa angka lalu pilih Simpan Berat.');
        showManual();
        if ($('btn-lanjut')) $('btn-lanjut').style.display = 'block';
        return;
      }
      const message = data?.error === 'image_too_large'
        ? 'Foto asli terlalu besar untuk server.'
        : data?.error === 'gemini_unavailable' ? 'Gemini sedang tidak tersedia.' : 'Angka belum terbaca pasti.';
      retry(message);
    } catch (error) {
      if (token === sequence && $('camera-ui')?.style.display !== 'none') retry('Koneksi Gemini gagal.');
    } finally {
      clearTimeout(deadline);
      if (token === sequence) { pending = false; abort = null; if (button && attempts < CAP && button.style.display !== 'none') button.disabled = false; }
    }
  };
  // Retain local OCR as an explicit emergency path if the camera override is unavailable.
  window.banksampahLocalCaptureFallback = previousCapture;
})();
