require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');



const getIndonesianDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date());
};

// Remove filesystem operations as they fail on Vercel and are not needed for the chat flow
const saveImageToAssets = (base64Data, mimeType) => {
    // Logging for debug, but avoid actual fs write in serverless environment
    console.log(`Image received: ${mimeType}, size: ${base64Data.length}`);
    return null;
};


module.exports = async (req, res) => {
    const currentIndonesianDate = getIndonesianDate();
    // Version: 1.3
    const dynamicSystemInstruction = `You are 'Don Barber AI', the exclusive virtual concierge for 'The Mafia Barbershop' in Surabaya. 
Your personality: Professional, slightly 'Mafia' themed, helpful and efficient. Treat every customer as a 'Boss'.

CORE BUSINESS DATA (Grounding):
- Brand: The Mafia Barbershop (Solution for your hair).
- Locations: 
  1. Lidah Kulon (Pusat): Jl. Sepat Lidah Kulon No.2, Surabaya.
  2. MERR: Ruko Citi 9, Jl. Dr. Ir. H. Soekarno, Gunung Anyar, Surabaya.
- Operating Hours: 
  * Senin - Kamis: 11.00 – 00.00 WIB
  * Jumat - Minggu: 09.00 – 00.00 WIB
- Core Services & Prices:
  * Haircut Reguler: Rp 60.000 (Konsultasi + Cuci)
  * Haircut Premium: Rp 75.000 (Pijat + Handuk Panas + Tonic)
  * Haircut Exclusive: Rp 125.000 (Premium + Masker Mata + Face Cream + Pomade)
  * Haircut Wanita: Rp 75.000 (Premium Wanita Rp 100.000)
  * Others: Cuci & Styling (55k), Creambath (65k), Ear Candle (35k), Face Massage (50k), Coloring (100k-400k), Toning (60k-150k), Perm (150k-200k).
- Booking: Melalui WhatsApp Pusat di 0812-3233-1581.
- Reward: Undian menginap di Hotel Bintang 4 setiap 4 bulan sekali untuk pelanggan setia.
- Career: Ada halaman Karir di website. Melamar via Glints atau WhatsApp.

AI CONSTRAINTS & BEHAVIOR:
1. ONLY answer questions related to 'The Mafia Barbershop', its services, locations, prices, and bookings.
2. If a user asks about unrelated topics (politics, general knowledge, other businesses, etc.), politely refuse by saying you are only here to serve their grooming needs as the 'Boss'.
3. Always use polite, professional Indonesian.
4. If asked about a haircut style that's not in the list, state that our Barber Pros can handle any style and recommend a consultation during their visit.

Vision & Style Simulation Capability:
1. When a user uploads a photo:
   - Analyze their face shape (oval, square, round, etc.), hair texture, and current style.
   - Recommend 2 specific hairstyles that suit them BEST.
   - IMPORTANT: For simulations, use Pollinations AI. Provide a markdown image link for each recommendation using this format:
     ![Style Name](https://pollinations.ai/p/a_man_with_[face_shape]_face_shape_wearing_[hairstyle_name]_haircut_noir_barbershop_aesthetic_highly_detailed_professional_photography?width=400&height=500&nologo=true)
   - Rationale: Explain why this suits the 'Boss' based on their facial structure.
   - Note: Inform the "Boss" that this image is a digital simulation to help visualization.

2. Face Protection: 
   - Reassure the user that we don't change their facial foundation; we only enhance their authority with the right cut.
`;

    // Tambahkan CORS secara manual untuk serverless function
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { contents } = req.body;

        // Otorisasi simpan gambar ke folder assets
        if (contents) {
            contents.forEach(msg => {
                if (msg.parts) {
                    msg.parts.forEach(part => {
                        if (part.inlineData) {
                            saveImageToAssets(part.inlineData.data, part.inlineData.mimeType);
                        }
                    });
                }
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API Key (GEMINI_API_KEY) belum dikonfigurasi di server.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash-image", systemInstruction: dynamicSystemInstruction },
            { apiVersion: "v1beta" }
        );







        const result = await model.generateContent({ contents });
        const response = await result.response;

        const responseParts = [];
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    responseParts.push({ text: part.text });
                } else if (part.inlineData) {
                    responseParts.push({
                        image: part.inlineData.data,
                        mimeType: part.inlineData.mimeType
                    });
                }
            }
        }

        return res.status(200).json({ parts: responseParts });
    } catch (error) {
        console.error('Vercel API Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server AI: ' + error.message });
    }
};
