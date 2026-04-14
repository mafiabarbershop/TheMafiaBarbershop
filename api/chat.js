const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const getIndonesianDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date());
};

const saveImageToAssets = (base64Data, mimeType) => {
    try {
        const assetsDir = path.join(process.cwd(), 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }
        const extension = mimeType.split('/')[1] || 'png';
        const fileName = `upload_${Date.now()}.${extension}`;
        const filePath = path.join(assetsDir, fileName);
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        console.log(`Image saved: ${filePath}`);
        return fileName;
    } catch (error) {
        console.error('Error saving image:', error);
        return null;
    }
};

module.exports = async (req, res) => {
    const currentIndonesianDate = getIndonesianDate();
    const dynamicSystemInstruction = `You are 'Don Barber AI', the exclusive virtual concierge for 'The Mafia Barbershop' in Surabaya. 
Your personality: Professional, slightly 'Mafia' themed, helpful and efficient.
Your current time context: Hari ini adalah ${currentIndonesianDate}.

Vision & Style Simulation Capability:
1. When a user uploads a photo:
   - Analyze their face shape (oval, square, round, etc.), hair texture, and current style.
   - Recommend 2 specific hairstyles that suit them BEST.
   - IMPORTANT: Provide a **Native Visual Simulation** (an actual image part) for each recommendation.
   - You MUST generate an image that shows a man with the user's face shape wearing the recommended hairstyle in a noir-themed barbershop.
   - Rationale: Explain why these styles fit the user's face structure.
   - Note: Inform the "Boss" that this image is a digital simulation generated natively by your core to help them visualize the result.

2. Face Protection: 
   - Reassay the user that their facial features and structure are the foundation of our recommendation. We don't change who they are; we enhance their authority.

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
            return res.status(500).json({ error: 'API Key belum dikonfigurasi di Vercel.' });
        }


        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image",
            systemInstruction: dynamicSystemInstruction
        });


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
