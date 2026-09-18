const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

async function run() {
  const storage = new Map();
  const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  };
  const nodes = new Map();
  function element(id) {
    if (!nodes.has(id)) nodes.set(id, {
      style: {}, disabled: false, hidden: false,
      clientHeight: 140, clientWidth: 340,
      pause() {},
      getContext() { return { drawImage() {}, clearRect() {} }; }
    });
    return nodes.get(id);
  }
  element('camera-ui').style.display = 'block';
  let requests = 0, manual = 0;
  const scanner = { drawCrop: () => true, stop() {} };
  const window = {
    BANK_SAMPAH_VISION_ENDPOINT: 'https://banksampahsukolilo.netlify.app/api/vision',
    localScanner: scanner,
    prompt: () => 'a-secure-test-code-of-32-characters',
    inputManual: () => { manual++; },
    suksesScan() {},
    ambilGambarTimbangan() { throw new Error('Unexpected local OCR'); }
  };
  const context = {
    window, localStorage, crypto: webcrypto,
    document: { getElementById: element, createElement: () => ({
      width: 0, height: 0, hidden: false, style: {},
      toDataURL: () => 'data:image/jpeg;base64,AA==',
      getContext: () => ({ drawImage() {}, clearRect() {} })
    }) },
    location: { hostname: 'arieshilmii.github.io' },
    fetch: async () => {
      requests++;
      return new Response(JSON.stringify({ ok: true, weight: '0.660', remaining: 5 - requests }), { status: 200 });
    },
    Response, AbortController, setTimeout, clearTimeout,
    console
  };
  vm.runInNewContext(readFileSync('scanner_vision.js', 'utf8'), context);
  for (let i = 0; i < 5; i++) await window.ambilGambarTimbangan();
  assert.equal(requests, 5, 'Five captures must send exactly five requests');
  await window.ambilGambarTimbangan();
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(requests, 5, 'Sixth capture must not send an API request');
  assert.equal(manual, 1, 'Sixth capture must open manual input');
  assert.equal(JSON.parse(storage.get('bs_vision_daily_usage_v1')).count, 5);
  console.log('PASS: five attempts only; sixth capture opens manual without API request');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
