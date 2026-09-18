// AI Vision for Bank Sampah: disabled until explicitly enabled in Netlify.
// OPENAI_API_KEY and VISION_ACCESS_CODE must only exist in Netlify environment variables.
import { createHash, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';

const ORIGINS = new Set(['https://arieshilmii.github.io', 'https://banksampahsukolilo.netlify.app']);
const MODEL = 'gpt-5-mini';
const LIMIT = 5;
const MAX_BODY = 460000;
const text = (status, body, origin) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    ...(ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {})
  }
});
const secureEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};
const dayInSurabaya = () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

// Strong reads + conditional writes avoid simultaneous requests incrementing the same
// counter twice. Reserve BEFORE the paid API call, including unclear/failed attempts.
async function reserveAttempt(device, accessCode) {
  const digest = createHash('sha256').update(device + ':' + accessCode).digest('hex');
  const key = `${dayInSurabaya()}/${digest}`;
  const store = getStore({ name: 'banksampah-vision-quota', consistency: 'strong' });
  for (let retry = 0; retry < 10; retry++) {
    const current = await store.getWithMetadata(key, { consistency: 'strong', type: 'json' });
    const count = Number(current?.data?.count) || 0;
    if (count >= LIMIT) return { allowed: false, remaining: 0 };
    const options = current ? { onlyIfMatch: current.etag } : { onlyIfNew: true };
    const result = await store.setJSON(key, { count: count + 1 }, options);
    if (result.modified) return { allowed: true, remaining: LIMIT - count - 1 };
  }
  throw new Error('quota_contention');
}

export default async function vision(request) {
  const origin = request.headers.get('origin') || '';
  if (!ORIGINS.has(origin)) return text(403, { ok: false, error: 'origin_not_allowed' }, origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600',
    Vary: 'Origin'
  }});
  if (request.method !== 'POST') return text(405, { ok: false, error: 'method_not_allowed' }, origin);
  if (Netlify.env.get('VISION_ENABLED') !== 'true') return text(503, { ok: false, error: 'vision_disabled' }, origin);
  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  const accessCode = Netlify.env.get('VISION_ACCESS_CODE');
  if (!apiKey || !accessCode || accessCode.length < 16) return text(503, { ok: false, error: 'vision_not_configured' }, origin);
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY) return text(413, { ok: false, error: 'image_too_large' }, origin);

  let input;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return text(413, { ok: false, error: 'image_too_large' }, origin);
    input = JSON.parse(raw);
  } catch (_) { return text(400, { ok: false, error: 'invalid_json' }, origin); }
  if (!secureEqual(input?.accessCode, accessCode)) return text(401, { ok: false, error: 'access_denied' }, origin);
  const device = input?.device;
  if (typeof device !== 'string' || !/^[a-f0-9]{32}$/.test(device)) return text(400, { ok: false, error: 'invalid_device' }, origin);
  const image = input?.image;
  if (typeof image !== 'string' || image.length > MAX_BODY || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image)) {
    return text(400, { ok: false, error: 'invalid_image' }, origin);
  }

  let quota;
  try { quota = await reserveAttempt(device, accessCode); }
  catch (error) {
    console.warn('Vision quota storage unavailable:', error?.name || 'unknown');
    return text(503, { ok: false, error: 'quota_unavailable' }, origin); // Fail closed: never spend if counter unavailable.
  }
  if (!quota.allowed) return text(429, { ok: false, error: 'vision_limit_reached', remaining: 0 }, origin);
  try {
    const provider = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: AbortSignal.timeout(13500),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, store: false, max_output_tokens: 64,
        input: [{ role: 'user', content: [
          { type: 'input_text', text: 'Baca hanya angka berat utama pada layar timbangan digital. Abaikan tulisan LOCK, Kg, merek, dan angka kecil lainnya. Balas dengan satu angka yang terbaca persis, memakai titik dan tepat tiga digit desimal (contoh 0.500 atau 1.650). Jangan menebak atau membulatkan. Jika ada digit yang tidak jelas, layar kosong, atau berat nol, balas TIDAK_JELAS. Jangan menambahkan kata lain.' },
          { type: 'input_image', image_url: image, detail: 'high' }
        ] }]
      })
    });
    if (!provider.ok) {
      console.warn('Vision provider status:', provider.status);
      return text(provider.status === 429 ? 429 : 502, { ok: false, error: 'vision_unavailable', remaining: quota.remaining }, origin);
    }
    const data = await provider.json();
    const answer = (data.output || []).flatMap(item => item.content || []).filter(part => part.type === 'output_text').map(part => part.text || '').join('').trim();
    if (!/^\d{1,3}\.\d{3}$/.test(answer) || !(Number(answer) > 0 && Number(answer) <= 50)) {
      return text(200, { ok: true, status: 'unclear', weight: null, remaining: quota.remaining }, origin);
    }
    return text(200, { ok: true, status: 'read', weight: answer, remaining: quota.remaining }, origin);
  } catch (error) {
    console.warn('Vision provider failed:', error?.name || 'unknown');
    return text(503, { ok: false, error: 'vision_unavailable', remaining: quota.remaining }, origin);
  }
}

// Fast abuse throttle; durable five-per-device-per-day limit is enforced above.
// Netlify function rate-limit windows cannot exceed 180 seconds.
export const config = {
  path: '/api/vision',
  rateLimit: { windowLimit: 10, windowSize: 180, aggregateBy: ['ip', 'domain'] }
};
