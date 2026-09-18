// Secure server-only OpenAI Vision proxy. Staged in preview branch; not enabled by default.
// Configure OPENAI_API_KEY and VISION_ENABLED=true on a dedicated backend before use.
const ORIGINS = new Set([
  'https://arieshilmii.github.io',
  'https://banksampahsukolilo.netlify.app'
]);
const MODEL = 'gpt-5.6-luna';
const MAX_BODY_LENGTH = 460000;
const responseHeaders = (origin) => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Vary': 'Origin',
  ...(ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {})
});
const reply = (status, body, origin) => new Response(JSON.stringify(body), {
  status, headers: responseHeaders(origin)
});

export default async function vision(request) {
  const origin = request.headers.get('origin') || '';
  if (origin && !ORIGINS.has(origin)) return reply(403, { ok: false, error: 'origin_not_allowed' }, origin);
  if (request.method === 'OPTIONS') {
    if (!ORIGINS.has(origin)) return reply(403, { ok: false }, origin);
    return new Response(null, { status: 204, headers: {
      ...responseHeaders(origin),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    }});
  }
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'method_not_allowed' }, origin);
  // Prevent accidental public paid endpoint activation. Origin checks are NOT authentication.
  if (Netlify.env.get('VISION_ENABLED') !== 'true') return reply(503, { ok: false, error: 'vision_not_enabled' }, origin);
  const key = Netlify.env.get('OPENAI_API_KEY');
  if (!key) return reply(503, { ok: false, error: 'vision_not_configured' }, origin);
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_LENGTH) return reply(413, { ok: false, error: 'image_too_large' }, origin);

  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_LENGTH) return reply(413, { ok: false, error: 'image_too_large' }, origin);
    let input;
    try { input = JSON.parse(raw); } catch { return reply(400, { ok: false, error: 'invalid_json' }, origin); }
    const image = input?.image;
    if (typeof image !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > MAX_BODY_LENGTH) {
      return reply(400, { ok: false, error: 'invalid_image' }, origin);
    }
    const call = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: AbortSignal.timeout(13500),
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        reasoning: { effort: 'none' },
        max_output_tokens: 64,
        input: [{ role: 'user', content: [
          { type: 'input_text', text: 'Baca HANYA angka berat pada layar timbangan tujuh-segmen di foto. Abaikan LOCK, Kg, merek, tulisan lain. Jawab tepat satu angka dengan titik dan TIGA angka setelah titik, misalnya 0.500 atau 1.650. Jangan mengarang digit, jangan membulatkan. Jika sebagian digit tidak terlihat pasti, layar kosong, nilai nol, atau tidak ada timbangan, jawab tepat TIDAK_JELAS. Tanpa penjelasan.' },
          { type: 'input_image', image_url: image, detail: 'high' }
        ] }]
      })
    });
    if (!call.ok) {
      console.warn('Vision provider status:', call.status);
      return reply(call.status === 429 ? 429 : 502, { ok: false, error: 'vision_unavailable' }, origin);
    }
    const data = await call.json();
    const answer = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text || '').join('').trim();
    if (!/^\d{1,3}\.\d{3}$/.test(answer) || !(Number(answer) > 0 && Number(answer) <= 50)) {
      return reply(200, { ok: true, weight: null, status: 'unclear' }, origin);
    }
    return reply(200, { ok: true, weight: answer, status: 'read' }, origin);
  } catch (error) {
    console.warn('Vision request failed:', error?.name || 'unknown');
    return reply(503, { ok: false, error: 'vision_unavailable' }, origin);
  }
}

// Built-in per-IP throttle; also set an OpenAI project spending limit before enabling.
// This is NOT authentication, so a public deployment still requires an abuse-control plan.
export const config = {
  path: '/api/vision',
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
