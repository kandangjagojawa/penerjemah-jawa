import OpenAI from 'openai';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text, targetStyle } = req.body;
    if (!text || !targetStyle) return res.status(400).json({ error: 'Teks dan target style wajib diisi.' });

    try {
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            // OpenRouter menyarankan pengiriman header ini untuk model gratis
            defaultHeaders: {
                "HTTP-Referer": "https://kandangjago.github.io/penerjemah-jawa",
                "X-Title": "Penerjemah Jawa"
            }
        });

        const systemInstruction = `Kamu ahli tata bahasa Jawa. Terjemahkan teks dari Bahasa Indonesia ke Bahasa Jawa ragam ${targetStyle}.
Ngoko Alus: Kosakata ngoko, imbuhan ngoko. Kata ganti/kerja untuk orang yang dihormati wajib Krama Inggil.
Krama Inggil: Kosakata krama, imbuhan krama. Kata ganti/kerja untuk orang yang dihormati wajib Krama Inggil.
Hanya berikan hasil terjemahannya saja tanpa penjelasan tambahan.`;

        const completion = await openai.chat.completions.create({
            // Memperbaiki nama model menggunakan tanda hubung (-)
            model: "meta-llama/llama-3-8b-instruct:free",
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Terjemahkan ke ${targetStyle}:\n"${text}"` }
            ],
            temperature: 0.2,
        });

        const responseText = completion.choices[0].message.content;
        return res.status(200).json({ result: responseText.trim() });
    } catch (error) {
        // Log ini akan mencatat penyebab pasti jika masih gagal
        console.error("Error detail dari OpenRouter:", error.message || error);
        return res.status(500).json({ error: 'Gagal memproses permintaan AI. Cek Log Vercel.' });
    }
}
