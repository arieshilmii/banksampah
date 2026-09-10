// File: netlify/functions/gemini.js

export async function handler(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Variabel GEMINI_API_KEY kosong di server Netlify." }) 
        };
    }

    try {
        const body = JSON.parse(event.body);
        const base64Image = body.image;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Kamu adalah AI pembaca timbangan digital. Perhatikan gambar ini. Jika ada layar timbangan yang menunjukkan angka berat (mengandung titik desimal), kembalikan HANYA angkanya saja (misal: 2.5 atau 10.3). Jika layar timbangan KOSONG, TIDAK ADA, BURAM, atau HANYA MENUNJUKKAN ANGKA 0, kembalikan teks mutlak: KOSONG" },
                        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
        };
    }
};