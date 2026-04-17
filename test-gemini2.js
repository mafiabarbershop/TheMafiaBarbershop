require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log("Success with 1.5-flash:", result.response.text());
    } catch (e) {
        console.error("Error with 1.5-flash:", e.message);
    }
}
test();
