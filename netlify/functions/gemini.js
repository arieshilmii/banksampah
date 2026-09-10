// File: netlify/functions/gemini.js

const JSON_HEADERS = { "Content-Type": "application/json" };
const MODEL = "gemini-3.8-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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

    // Health check aman: tidak pernah mengembalikan nilai API key.
    // GET /.netlify/functions/gemini akan menguji koneksi Netlify -> Gemini.
    if (request.method === "GET") {
        try {
            const { response, data } = await callGemini(API_KEY, {
                contents: [{
                    parts: [{ text: "Jawab tepat satu kata: OK" }]
                }],
                generationConfig: {
                    thinkingConfig: { thinkingLevel: "low" }
                }
            });

            if (!response.ok) {
                return new Response(JSON.stringify({
                    ok: false,
                    keyConfigured: true,
                    model: MODEL,
                    upstreamStatus: response.status,
                    error: data?.error?.message || `Gemini API gagal dengan HTTP ${response.status}`
                }), {
                    status: 200,
                    headers: JSON_HEADERS
                });
            }

            return new Response(JSON.stringify({
                ok: true,
                keyConfigured: true,
                model: MODEL,
                upstreamStatus: 200
            }), {
                status: 200,
                headers: JSON_HEADERS
            });
        } catch (error) {
            return new Response(JSON.stringify({
                ok: false,
                keyConfigured: true,
                model: MODEL,
                upstreamStatus: null,
                error: error instanceof Error ? error.message : "Health check gagal."
            }), {
                status: 200,
                headers: JSON_HEADERS
            });
        }
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

        const { response: geminiResponse, data } = await callGemini(API_KEY, {
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
        });

        if (!geminiResponse.ok) {
            const googleMessage = data?.error?.message || `Gemini API gagal dengan HTTP ${geminiResponse.status}`;
            console.error("Gemini API error:", geminiResponse.status, googleMessage);

            return new Response(JSON.stringify({
                error: googleMessage,
                status: geminiResponse.status
            }), {
                status: geminiResponse.status,
                headers: JSON_HEADERS
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
