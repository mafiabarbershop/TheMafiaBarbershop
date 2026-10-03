require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using fetch directly to list models to avoid SDK version issues
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("Models:", data.models.filter(m => m.name.includes("gemini")).map(m => m.name).join(", "));
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
