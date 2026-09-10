// File: netlify/functions/gemini.js

const JSON_HEADERS = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
};
const MODEL = "gemini-3.8-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getRetrySeconds(data) {
    const message = data?.error?.message || "";
    const match = message.match(/retry in\s+([0-9.]+)s/i);
    if (!match) return 10;
    const seconds = Math.ceil(Number(match[1]));
    return Number.isFinite(seconds) ? Math.max(2, seconds + 1) : 10;
}

async function callGemini(apiKey, body) {
    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
        },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    return { response, data };
}

async function callGeminiWithBackoff(apiKey, body) {
    let result = await callGemini(apiKey, body);

    if (result.response.status !== 429) return result;

    const retrySeconds = getRetrySeconds(result.data);

    // Netlify Function jangan ditahan terlalu lama. Untuk retry singkat (umumnya RPM),
    // tunggu sesuai arahan Gemini lalu coba satu kali lagi. Jika jedanya terlalu lama,
    // kembalikan 429 agar client tidak membuat request bertubi-tubi.
    if (retrySeconds <= 22) {
        console.warn(`Gemini rate limited. Retrying once in ${retrySeconds}s.`);
        await sleep(retrySeconds * 1000);
        result = await callGemini(apiKey, body);
    }

    return result;
}

export default async (request) => {
    const API_KEY = Netlify.env.get("GEMINI_API_KEY");

    if (!API_KEY) {
        return new Response(JSON.stringify({
            ok: false,
            error: "Variabel GEMINI_API_KEY kosong di server Netlify."
        }), {
            status: request.method === "GET" ? 200 : 500,
            headers: JSON_HEADERS
        });
    }

    // Health check ringan: cukup memastikan environment variable tersedia.
    // Tidak memanggil Gemini supaya pengecekan ini tidak ikut menghabiskan quota.
    if (request.method === "GET") {
        return new Response(JSON.stringify({
            ok: true,
            keyConfigured: true,
            model: MODEL,
            note: "API key tersedia di Netlify. Health check ini tidak memakai quota Gemini."
        }), {
            status: 200,
            headers: JSON_HEADERS
        });
    }

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
            headers: JSON_HEADERS
        });
    }

    try {
        const body = await request.json();
        const base64Image = body?.image;

        if (!base64Image || typeof base64Image !== "string") {
            return new Response(JSON.stringify({
                error: "Data gambar tidak ditemukan atau formatnya tidak valid."
            }), {
                status: 400,
                headers: JSON_HEADERS
            });
        }

        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "Baca HANYA angka berat pada layar timbangan digital di gambar. Jika terbaca jelas dan nilainya lebih dari 0, jawab hanya angka desimal dengan titik, tanpa satuan atau kalimat. Pertahankan jumlah digit desimal yang terlihat. Contoh: 0.260 atau 2.5. Jika layar kosong, tidak terlihat, terlalu buram, atau menunjukkan 0, jawab tepat: KOSONG. Jangan menebak."
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                thinkingConfig: {
                    thinkingLevel: "low"
                }
            }
        };

        const { response: geminiResponse, data } = await callGeminiWithBackoff(API_KEY, requestBody);

        if (!geminiResponse.ok) {
            const googleMessage = data?.error?.message || `Gemini API gagal dengan HTTP ${geminiResponse.status}`;
            const retryAfter = geminiResponse.status === 429 ? getRetrySeconds(data) : null;
            console.error("Gemini API error:", geminiResponse.status, googleMessage);

            return new Response(JSON.stringify({
                error: googleMessage,
                status: geminiResponse.status,
                retryAfter
            }), {
                status: geminiResponse.status,
                headers: retryAfter
                    ? { ...JSON_HEADERS, "Retry-After": String(retryAfter) }
                    : JSON_HEADERS
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: JSON_HEADERS
        });
    } catch (error) {
        console.error("Gemini function error:", error);

        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : "Terjadi kesalahan pada server."
        }), {
            status: 500,
            headers: JSON_HEADERS
        });
    }
};
