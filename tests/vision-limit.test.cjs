const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

async function run() {
  const nodes = new Map();
  function element(id) {
    if (!nodes.has(id)) nodes.set(id, {
      style: {}, disabled: false, hidden: false, textContent: '',
      clientHeight: 140, clientWidth: 340,
      classList: { add() {}, remove() {} },
      querySelector: () => ({ classList: { add() {}, remove() {} } }),
      pause() {},
      getContext() { return { drawImage() {}, clearRect() {} }; }
    });
    return nodes.get(id);
  }
  element('camera-ui').style.display = 'none';
  let requests = 0, manual = 0;
  const submittedSessions = [];
  const scanner = { drawCrop: () => true, stop() {} };
  const window = {
    crypto: webcrypto,
    BANK_SAMPAH_VISION_ENDPOINT: 'https://banksampahsukolilo.netlify.app/api/vision',
    localScanner: scanner,
    addEventListener() {},
    inputManual: () => { manual++; },
    suksesScan() {},
    tutupKamera() { element('camera-ui').style.display = 'none'; },
    mulaiKamera(name) { this.jenisSampahAktif = name; element('camera-ui').style.display = 'block'; },
    ambilGambarTimbangan() { throw new Error('Unexpected local OCR'); }
  };
  const context = {
    window, crypto: webcrypto,
    document: {
      readyState: 'complete', getElementById: element,
      createElement: () => ({
        width: 0, height: 0, hidden: false, style: {},
        toDataURL: () => 'data:image/jpeg;base64,AA==',
        getContext: () => ({ drawImage() {}, clearRect() {} })
      })
    },
    location: { hostname: 'arieshilmii.github.io' },
    fetch: async (_url, options) => {
      requests++;
      const sent = JSON.parse(options.body);
      assert.match(sent.session, /^[a-f0-9]{32}$/);
      assert.equal(sent.accessCode, undefined, 'No access code is requested or sent');
      submittedSessions.push(sent.session);
      return new Response(JSON.stringify({ ok: true, status: 'unclear', weight: null, remaining: Math.max(0, 5 - requests) }), { status: 200 });
    },
    Response, AbortController, setTimeout, clearTimeout, console
  };
  vm.runInNewContext(readFileSync('scanner_vision.js', 'utf8'), context);
  window.mulaiKamera('PET');
  for (let i = 0; i < 5; i++) {
    await window.ambilGambarTimbangan();
    if (i < 4) window.mulaiKamera('PET'); // Re-take in the SAME weighing flow.
  }
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(requests, 5, 'Exactly five AI requests in a failed weighing session');
  assert.equal(manual, 1, 'Fifth failure opens manual input immediately');
  assert.equal(new Set(submittedSessions).size, 1, 'Re-takes use the same server session ID');
  await window.ambilGambarTimbangan();
  assert.equal(requests, 5, 'No sixth request within the same weighing session');

  window.tutupKamera();
  window.mulaiKamera('PET');
  await window.ambilGambarTimbangan();
  assert.equal(requests, 6, 'A NEW weighing session may start again at attempt one');
  assert.notEqual(submittedSessions[5], submittedSessions[0], 'New weighing has a fresh session ID');
  console.log('PASS: five failures -> manual; no sixth request; new session restarts at one; no code prompt');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
