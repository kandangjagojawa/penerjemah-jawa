import { GoogleGenAI } from '@google/genai';

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
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemInstruction = `
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

- Indonesia: "Tadi kakek bertanya kepada saya, apakah kamu sudah tidur?"
  Ngoko Alus: "Mau simbah mundhut pirsa marang aku, apa panjenengan wis sare?"
  Krama Inggil: "Kalawau simbah mundhut pirsa dhateng kula, punapa panjenengan sampun sare?"

- Indonesia: "Kamu membawa tas, saya membawa buku."
  Ngoko Alus: "Panjenengan ngasta tas, aku nggawa buku."
  Krama Inggil: "Panjenengan ngasta tas, kula mbekta buku."

INSTRUKSI AKHIR:
Hanya berikan hasil terjemahannya saja tanpa penjelasan tambahan, catatan, atau awalan/akhiran apa pun. Pastikan ejaan tepat.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Terjemahkan kalimat berikut ke ${targetStyle}:\n"${text}"`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2 // Temperature rendah agar konsisten dan tidak berimajinasi
            }
        });

        return res.status(200).json({ result: response.text.trim() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Gagal memproses permintaan AI.' });
    }
}
