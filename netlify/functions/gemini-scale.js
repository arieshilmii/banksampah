// Dedicated scale reading endpoint. OpenAI Vision stays disabled.
import { getStore } from '@netlify/blobs';

const ORIGINS = new Set(['https://arieshilmii.github.io', 'https://banksampahsukolilo.netlify.app']);
const FLASH = 'gemini-3.8-flash';
const PRO = 'gemini-2.5-pro';
const MAX_BODY = 5_500_000;
const LIMIT = 5;
const PROMPT = 'Baca angka berat yang tertera pada layar digital timbangan berwarna hijau ini. Abaikan pantulan cahaya dan karakter lainnya jika ada. Kembalikan hanya angkanya saja, tidak perlu kata, satuan, atau penjelasan. Pertahankan semua digit yang tampak termasuk nol sesudah titik desimal, misalnya 0.660. Jangan mengarang digit, mengubah posisi titik, atau membulatkan. Jika satu digit pun tidak jelas, jawab tepat TIDAK_JELAS.';
function reply(status, data, origin) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'Vary': 'Origin', ...(ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {})
  }});
}
// Reserve once before any model call. One photo = exactly one model request.
async function reserve(session) {
  const store = getStore({ name: 'banksampah-gemini-scale-sessions', consistency: 'strong' });
  const key = `weigh/${session}`;
  for (let i = 0; i < 10; i++) {
    const item = await store.getWithMetadata(key, { consistency: 'strong', type: 'json' });
    const count = Number(item?.data?.count) || 0;
    if (count >= LIMIT) return { allowed: false, remaining: 0 };
    const condition = item ? { onlyIfMatch: item.etag } : { onlyIfNew: true };
    const written = await store.setJSON(key, { count: count + 1 }, condition);
    if (written.modified) return { allowed: true, remaining: LIMIT - count - 1, attempt: count + 1 };
  }
  throw new Error('quota_contention');
}
function parseWeight(answer) {
  const raw = String(answer || '').trim();
  if (!/^\d{1,3}[.,]\d{1,3}$/.test(raw)) return null;
  const result = raw.replace(',', '.');
  const value = Number(result);
  return Number.isFinite(value) && value > 0 && value <= 50 ? result : null;
}
async function read(apiKey, model, imageData) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST', signal: AbortSignal.timeout(model === FLASH ? 14000 : 24000),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents: [{ parts: [
      { text: PROMPT }, { inline_data: { mime_type: 'image/png', data: imageData } }
    ] }], generationConfig: { maxOutputTokens: 512, thinkingConfig: { thinkingLevel: 'low' } } })
  });
  if (!response.ok) { console.warn('Scale Gemini HTTP:', model, response.status); return { error: true, status: response.status }; }
  const result = await response.json();
  const answer = (result.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  return { weight: parseWeight(answer) };
}
export default async function handler(request) {
  const origin = request.headers.get('origin') || '';
  if (!ORIGINS.has(origin)) return reply(403, { ok: false, error: 'origin_not_allowed' }, origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin'
  }});
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' }, origin);
  const key = Netlify.env.get('GEMINI_API_KEY');
  if (!key) return reply(503, { ok: false, error: 'gemini_not_configured' }, origin);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return reply(413, { ok: false, error: 'image_too_large' }, origin);
  let body;
  try { const raw = await request.text(); if (raw.length > MAX_BODY) return reply(413, { ok: false, error: 'image_too_large' }, origin); body = JSON.parse(raw); }
  catch (_) { return reply(400, { ok: false, error: 'invalid_json' }, origin); }
  if (typeof body?.session !== 'string' || !/^[a-f0-9]{32}$/.test(body.session)) return reply(400, { ok: false, error: 'invalid_session' }, origin);
  if (typeof body?.image !== 'string' || body.image.length > MAX_BODY || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(body.image)) return reply(400, { ok: false, error: 'invalid_image' }, origin);
  let quota;
  try { quota = await reserve(body.session); }
  catch (_) { return reply(503, { ok: false, error: 'quota_unavailable' }, origin); }
  if (!quota.allowed) return reply(429, { ok: false, error: 'session_limit', remaining: 0 }, origin);
  const imageData = body.image.slice('data:image/png;base64,'.length);
  // Start with Flash for speed; subsequent unclear captures use Pro for accuracy.
  const model = quota.attempt <= 2 ? FLASH : PRO;
  try {
    const result = await read(key, model, imageData);
    if (result.error) return reply(result.status === 429 ? 429 : 502, { ok: false, error: 'gemini_unavailable', remaining: quota.remaining }, origin);
    return reply(200, { ok: true, weight: result.weight || null, status: result.weight ? 'read' : 'unclear', model, remaining: quota.remaining }, origin);
  } catch (error) {
    console.warn('Scale Gemini unavailable:', error?.name || 'unknown');
    return reply(503, { ok: false, error: 'gemini_unavailable', remaining: quota.remaining }, origin);
  }
}
export const config = { path: '/api/gemini-scale', rateLimit: { windowLimit: 10, windowSize: 180, aggregateBy: ['ip', 'domain'] } };
