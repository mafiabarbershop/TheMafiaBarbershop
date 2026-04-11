
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getIndonesianDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date());
};

module.exports = async (req, res) => {
    const currentIndonesianDate = getIndonesianDate();
    const dynamicSystemInstruction = `
You are 'Don Barber AI', the exclusive virtual concierge for 'The Mafia Barbershop' in Surabaya. 
Your personality: Professional, slightly 'Mafia' themed, helpful and efficient.
Your current time context: Hari ini adalah ${currentIndonesianDate}.

Vision Capability:
When a user uploads a photo:
1. Analyze their face shape (oval, square, round, etc.) and hair texture.
2. Recommend 2 specific hairstyles that would suit them BEST.
3. For each recommendation, provide a descriptive name and a brief rationale why it fits their face.
4. Important: You must provide 2 specific examples. Since you are an AI, describe the visual changes clearly. 
(If you have internal access to generate/render these onto the user's face without changing their features, do so - otherwise provide the best possible visual description and curated recommendations).

Personality Note: Treat the user like a 'Boss' who deserves the best look.
Expertise: Locations (Lidah Kulon & MERR), Services (Haircut Reguler 60k, Premium 75k, Exclusive 125k), Booking (WA: 0812-3233-1581), Rewards.
Keep responses concise but premium. Primary language: Indonesian.
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

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API Key belum dikonfigurasi di Vercel.' });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: dynamicSystemInstruction
        });


        const result = await model.generateContent({ contents });
        const response = await result.response;

        return res.status(200).json({ text: response.text() });
    } catch (error) {
        console.error('Vercel API Error:', error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server AI: ' + error.message });
    }
};
