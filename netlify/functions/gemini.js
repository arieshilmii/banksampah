// File: netlify/functions/gemini.js

const JSON_HEADERS = { "Content-Type": "application/json" };

export default async (request) => {
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
            status: 405,
            headers: JSON_HEADERS
        });
    }

    const API_KEY = Netlify.env.get("GEMINI_API_KEY");

    if (!API_KEY) {
        return new Response(JSON.stringify({
            error: "Variabel GEMINI_API_KEY kosong di server Netlify."
        }), {
            status: 500,
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

        const geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: "Kamu adalah AI pembaca timbangan digital. Perhatikan layar timbangan pada gambar. Jika angka berat terbaca jelas dan nilainya lebih dari 0, kembalikan HANYA angka desimalnya menggunakan titik sebagai pemisah desimal, tanpa satuan, tanpa kalimat, tanpa markdown. Contoh: 2.5 atau 10.3. Jika layar timbangan kosong, tidak terlihat, terlalu buram untuk dibaca dengan yakin, atau menunjukkan 0, kembalikan tepat satu kata: KOSONG. Jangan menebak angka jika tidak yakin."
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
                        temperature: 0,
                        maxOutputTokens: 20
                    }
                })
            }
        );

        const data = await geminiResponse.json().catch(() => ({}));

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
