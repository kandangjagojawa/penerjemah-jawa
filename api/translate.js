import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // Pengaturan CORS agar GitHub Pages dapat mengakses endpoint ini
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Menangani preflight request dari browser
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
        // Menginisialisasi Gemini menggunakan pustaka baru @google/generative-ai
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Memilih model versi TERBARU (3.8-flash) sesuai permintaan sistem Google
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.8-flash",
            systemInstruction: `
Kamu adalah ahli tata bahasa Jawa (penerjemah profesional) yang sangat menguasai unggah-ungguh basa.
Tugasmu adalah menerjemahkan teks dari Bahasa Indonesia ke Bahasa Jawa ragam ${targetStyle}.

ATURAN RAGAM BAHASA:
1. "Ngoko Alus": Kosakata dasar menggunakan Ngoko. Imbuhan (ater-ater dan panambang) tetap Ngoko (di-, -ake, -e). Namun, kata ganti, kata kerja, dan benda milik orang yang dihormati (lawan bicara/orang ketiga) WAJIB menggunakan Krama Inggil. Kata kerja untuk diri sendiri tetap Ngoko.
2. "Krama Inggil" (Krama Alus): Kosakata dasar menggunakan Krama. Imbuhan menggunakan Krama (dipun-, -aken, -ipun). Kata kerja/benda untuk orang yang dihormati menggunakan Krama Inggil. Kata kerja/benda untuk diri sendiri menggunakan Krama Andhap (merendah).

CONTOH TERJEMAHAN SEBAGAI REFERENSI:
- Indonesia: "Bapak sedang makan, sedangkan saya belum makan."
  Ngoko Alus: "Bapak lagi dhahar, dene aku durung mangan."
  Krama Inggil: "Bapak saweg dhahar, dene kula dereng nedha."

- Indonesia: "Kamu mau pergi ke mana? Saya mau pergi ke pasar."
  Ngoko Alus: "Panjenengan arep tindak ngendi? Aku arep lunga menyang pasar."
  Krama Inggil: "Panjenengan badhe tindak dhateng pundi? Kula badhe kesah dhateng peken."

- Indonesia: "Buku itu sudah saya berikan kepada Pak Guru."
  Ngoko Alus: "Bukune wis tak aturake marang Pak Guru."
  Krama Inggil: "Bukunipun sampun kula aturaken dhateng Pak Guru."

INSTRUKSI AKHIR:
Hanya berikan hasil terjemahannya saja tanpa penjelasan tambahan, catatan, atau awalan/akhiran apa pun. Pastikan ejaan tepat.
            `
        });

        const generationConfig = {
            temperature: 0.2, // Temperature rendah agar terjemahan baku
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
