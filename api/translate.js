import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, targetStyle } = req.body;

    if (!text || !targetStyle) {
        return res.status(400).json({ error: 'Teks dan target style wajib diisi.' });
    }

    try {
        // Menggunakan pustaka @google/generative-ai
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Memilih model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `
Kamu adalah ahli tata bahasa Jawa (penerjemah profesional) yang sangat menguasai unggah-ungguh basa.
Tugasmu adalah menerjemahkan teks dari Bahasa Indonesia ke Bahasa Jawa ragam ${targetStyle}.

ATURAN RAGAM BAHASA:
1. "Ngoko Alus": Kosakata dasar menggunakan Ngoko. Imbuhan tetap Ngoko. Kata ganti, kata kerja, dan benda milik orang yang dihormati WAJIB menggunakan Krama Inggil. Kata kerja untuk diri sendiri tetap Ngoko.
2. "Krama Inggil" (Krama Alus): Kosakata dasar menggunakan Krama. Imbuhan menggunakan Krama. Kata kerja/benda untuk orang yang dihormati menggunakan Krama Inggil. Kata kerja/benda untuk diri sendiri menggunakan Krama Andhap.

INSTRUKSI AKHIR:
Hanya berikan hasil terjemahannya saja tanpa penjelasan tambahan, catatan, atau awalan/akhiran apa pun. Pastikan ejaan tepat.
            `
        });

        // Konfigurasi agar jawaban konsisten
        const generationConfig = {
            temperature: 0.2,
        };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: `Terjemahkan kalimat berikut ke ${targetStyle}:\n"${text}"` }] }],
            generationConfig,
        });
        
        const responseText = result.response.text();

        return res.status(200).json({ result: responseText.trim() });
    } catch (error) {
        console.error("Error dari Gemini:", error);
        return res.status(500).json({ error: 'Gagal memproses permintaan AI. Pastikan API Key valid.' });
    }
}
