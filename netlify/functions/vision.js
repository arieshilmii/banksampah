// AI Vision: maximum five attempts for ONE weighing session, not per day or user.
// No employee access-code prompt; the API key stays in Netlify environment variables.
import { getStore } from '@netlify/blobs';

const ORIGINS = new Set(['https://arieshilmii.github.io', 'https://banksampahsukolilo.netlify.app']);
const LIMIT = 5;
const MAX_BODY = 460000;
const reply = (status, body, origin) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    ...(ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {})
  }
});

// Each fresh weighing flow receives a random session ID from the frontend. A retry
// uses the SAME session ID; a new weighing flow receives a new ID. Conditional
// writes ensure parallel calls cannot exceed five reservations in one session.
async function reserveAttempt(session) {
  const store = getStore({ name: 'banksampah-vision-sessions', consistency: 'strong' });
  const key = `session/${session}`;
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
  if (!ORIGINS.has(origin)) return reply(403, { ok: false, error: 'origin_not_allowed' }, origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600',
    Vary: 'Origin'
  }});
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' }, origin);
  if (Netlify.env.get('VISION_ENABLED') !== 'true') return reply(503, { ok: false, error: 'vision_disabled' }, origin);
  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  if (!apiKey) return reply(503, { ok: false, error: 'vision_not_configured' }, origin);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return reply(413, { ok: false, error: 'image_too_large' }, origin);

  let input;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return reply(413, { ok: false, error: 'image_too_large' }, origin);
    input = JSON.parse(raw);
  } catch (_) { return reply(400, { ok: false, error: 'invalid_json' }, origin); }
  const session = input?.session;
  if (typeof session !== 'string' || !/^[a-f0-9]{32}$/.test(session)) {
    return reply(400, { ok: false, error: 'invalid_session' }, origin);
  }
  const image = input?.image;
  if (typeof image !== 'string' || image.length > MAX_BODY || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image)) {
    return reply(400, { ok: false, error: 'invalid_image' }, origin);
  }

  let quota;
  try { quota = await reserveAttempt(session); }
  catch (error) {
    console.warn('Vision session counter unavailable:', error?.name || 'unknown');
    return reply(503, { ok: false, error: 'quota_unavailable' }, origin); // Fail closed.
  }
  if (!quota.allowed) return reply(429, { ok: false, error: 'vision_limit_reached', remaining: 0 }, origin);

  try {
    const provider = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', signal: AbortSignal.timeout(13500),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5-mini', store: false, max_output_tokens: 64,
        input: [{ role: 'user', content: [
          { type: 'input_text', text: 'Baca hanya angka berat utama pada layar timbangan digital. Abaikan tulisan LOCK, Kg, merek dan angka lainnya. Jawab satu angka persis dengan titik dan tiga desimal (contoh 0.500 atau 1.650). Jangan menebak atau membulatkan. Jika tidak jelas, layar kosong atau berat nol, jawab TIDAK_JELAS tanpa kata lain.' },
          { type: 'input_image', image_url: image, detail: 'high' }
        ] }]
      })
    });
    if (!provider.ok) {
      console.warn('Vision provider status:', provider.status);
      return reply(provider.status === 429 ? 429 : 502, { ok: false, error: 'vision_unavailable', remaining: quota.remaining }, origin);
    }
    const data = await provider.json();
    const answer = (data.output || []).flatMap(item => item.content || []).filter(part => part.type === 'output_text').map(part => part.text || '').join('').trim();
    if (!/^\d{1,3}\.\d{3}$/.test(answer) || !(Number(answer) > 0 && Number(answer) <= 50)) {
      return reply(200, { ok: true, status: 'unclear', weight: null, remaining: quota.remaining }, origin);
    }
    return reply(200, { ok: true, status: 'read', weight: answer, remaining: quota.remaining }, origin);
  } catch (error) {
    console.warn('Vision provider failed:', error?.name || 'unknown');
    return reply(503, { ok: false, error: 'vision_unavailable', remaining: quota.remaining }, origin);
  }
}

// Additional rapid-request abuse throttle, separate from five-attempt session UX.
export const config = {
  path: '/api/vision',
  rateLimit: { windowLimit: 10, windowSize: 180, aggregateBy: ['ip', 'domain'] }
};
