
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `
You are 'Don Barber AI', the exclusive virtual concierge for 'The Mafia Barbershop' in Surabaya. 
Your personality: Professional, slightly 'Mafia' themed, helpful and efficient.
Expertise: Locations (Lidah Kulon & MERR), Services (Haircut Reguler 60k, Premium 75k, Exclusive 125k), Booking (WA: 0812-3233-1581), Rewards.
Keep responses concise. Primary language: Indonesian.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { contents } = req.body;
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction 
        });

        const result = await model.generateContent({ contents });
        const response = await result.response;
        res.json({ text: response.text() });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server AI.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
