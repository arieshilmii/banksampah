const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { webcrypto } = require('node:crypto');
const vm = require('node:vm');

async function main() {
  let calls = 0, manual = 0, frames = 0, localOCR = 0;
  const nodes = new Map();
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, { style: {}, disabled: false, hidden: false, readyState: 4,
      videoWidth: 1280, videoHeight: 720, pause() {},
      getContext() { return { drawImage() {}, clearRect() {} }; } });
    return nodes.get(id);
  };
  get('camera-ui').style.display = 'block';
  const video = get('kamera-video');
  const window = {
    mulaiKamera() { get('camera-ui').style.display = 'block'; },
    tutupKamera() { get('camera-ui').style.display = 'none'; },
    simpanKeDatabase() {},
    inputManual() { manual++; },
    suksesScan(weight) { window.lastWeight = weight; },
    ambilGambarTimbangan() { localOCR++; },
    addEventListener() {}
  };
  const document = {
    readyState: 'complete', getElementById: get,
    createElement(type) {
      assert.equal(type, 'canvas');
      return { width: 0, height: 0,
        getContext() { return { drawImage(source, x, y, w, h) {
          assert.equal(source, video); assert.equal(w, 1280); assert.equal(h, 720); frames++;
        } }; },
        toDataURL(format) { assert.equal(format, 'image/png'); return 'data:image/png;base64,AA=='; }
      };
    }
  };
  const context = { window, document, crypto: webcrypto, AbortController, setTimeout, clearTimeout, console,
    fetch: async (_, args) => {
      calls++;
      assert.equal(args.headers['Content-Type'], 'text/plain;charset=UTF-8');
      const body = JSON.parse(args.body);
      assert.equal(body.image, 'data:image/png;base64,AA==');
      assert.match(body.session, /^[a-f0-9]{32}$/);
      return new Response(JSON.stringify({ ok: true, status: 'unclear', weight: null, remaining: 5 - calls }), { status: 200 });
    }
  };
  vm.runInNewContext(readFileSync('scanner_gemini_scale.js', 'utf8'), context);
  window.mulaiKamera('PET');
  for (let i = 0; i < 5; i++) await window.ambilGambarTimbangan();
  assert.equal(calls, 5); assert.equal(frames, 5); assert.equal(manual, 1); assert.equal(localOCR, 0);
  await window.ambilGambarTimbangan();
  assert.equal(calls, 5, 'Sixth attempt must not call API');
  window.tutupKamera();
  window.mulaiKamera('PET');
  await window.ambilGambarTimbangan();
  assert.equal(calls, 6, 'New weighing must reset the session attempt counter');
  console.log('PASS: lossless PNG full frame, 5 tries, sixth manual, next weighing resets, no local OCR interception');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
