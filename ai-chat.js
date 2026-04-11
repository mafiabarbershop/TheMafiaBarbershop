
/**
 * Don Barber AI - Customer Service Logic
 * Using Google Gemini 1.5 Flash
 */

const GEMINI_API_KEY = "AIzaSyD2EyUM4r5VQzKzqJ2Ivv3tHabh0N9N8zA";
const GEMINI_MODEL = "gemini-1.5-flash";

let chatHistory = [];

// System instruction to define the AI's persona
const systemInstruction = `
You are 'Don Barber AI', the exclusive virtual concierge for 'The Mafia Barbershop' in Surabaya. 
Your personality: Professional, slightly 'Mafia' themed (cool, respectful, using 'Boss' or 'Sir' occasionally), but very helpful and efficient.
You are an expert on everything about the shop:
- Locations: 
  1. Lidah Kulon: Jl. Sepat Lidah Kulon No.2 (11.00 - 00.00 Mon-Thu, 09.00 - 00.00 Fri-Sun).
  2. MERR: Ruko Citi 9, Gunung Anyar (Same hours).
- Services: 
  - Haircut Reguler (60k)
  - Haircut Premium (75k) - including massage, hot towel, tonic.
  - Haircut Exclusive (125k) - including eye mask, face cream, pomade styling.
  - Women's services available too (75k-100k).
  - Add-ons: Massage, Ear Candle, Creambath, Coloring, Perming.
- Booking: Users can book via the website form or WhatsApp (0812-3233-1581).
- Rewards: We have a loyalty system (Maverick, Capo, Underboss, Don) and a 4-monthly grand prize lucky draw.

Keep responses concise (max 3-4 sentences unless requested). Use Indonesian as the primary language unless the user speaks English.
`;

function toggleAIChat() {
    const chatWindow = document.getElementById('ai-chat-window');
    if (chatWindow.classList.contains('hidden')) {
        chatWindow.classList.remove('hidden');
        setTimeout(() => {
            chatWindow.classList.remove('scale-95', 'opacity-0');
            chatWindow.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        chatWindow.classList.add('scale-95', 'opacity-0');
        chatWindow.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            chatWindow.classList.add('hidden');
        }, 300);
    }
}

async function handleAIChatSubmit(e) {
    if (e) e.preventDefault();
    
    const inputField = document.getElementById('ai-chat-input');
    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    // Add user message to UI
    appendMessage('user', userMessage);
    inputField.value = '';

    // Add loading indicator
    const loadingId = appendLoading();

    try {

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    ...chatHistory,
                    {
                        role: "user",
                        parts: [{ text: userMessage }]
                    }
                ],
                systemInstruction: {
                    role: "system",
                    parts: [{ text: systemInstruction.trim() }]
                }
            })
        });

        const data = await response.json();
        removeLoading(loadingId);

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            throw new Error(data.error.message || 'API Error');
        }

        if (data.candidates && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            appendMessage('ai', aiResponse);
            
            // Update history
            chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
            chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
            
            // Keep history lean
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        } else {
            console.error('Unexpected Response:', data);
            throw new Error('Invalid response from AI');
        }
    } catch (error) {
        console.error('Don Barber AI Error:', error);
        removeLoading(loadingId);
        // Show slightly more helpful error to console, but keep UI friendly
        appendMessage('ai', "Maaf Boss, ada kendala teknis saat menghubungi markas. Coba lagi sebentar lagi ya.");
    }
}

function appendMessage(role, text) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = role === 'user' ? 'flex justify-end' : 'flex gap-2';
    
    const innerHtml = role === 'user' 
        ? `<div class="bg-crimson border border-crimson/20 rounded-lg rounded-tr-none p-3 text-white text-xs leading-relaxed max-w-[85%] shadow-lg">${text}</div>`
        : `
            <div class="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/20 border border-crimson/40 flex items-center justify-center text-[10px]">🤵</div>
            <div class="bg-white/5 border border-white/10 rounded-lg rounded-tl-none p-3 text-cream/80 text-xs leading-relaxed max-w-[85%] shadow-sm">${text}</div>
        `;
    
    messageDiv.innerHTML = innerHtml;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendLoading() {
    const id = 'loading-' + Date.now();
    const messagesContainer = document.getElementById('ai-chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'flex gap-2 animate-pulse';
    loadingDiv.innerHTML = `
        <div class="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/10 border border-white/5 flex items-center justify-center text-[10px]">🤵</div>
        <div class="bg-white/5 border border-white/5 rounded-lg rounded-tl-none p-3 flex gap-1 items-center">
            <span class="w-1 h-1 bg-cream/40 rounded-full animate-bounce"></span>
            <span class="w-1 h-1 bg-cream/40 rounded-full animate-bounce" style="animation-delay:0.2s"></span>
            <span class="w-1 h-1 bg-cream/40 rounded-full animate-bounce" style="animation-delay:0.4s"></span>
        </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Initialize listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ai-chat-form');
    if (form) {
        form.addEventListener('submit', handleAIChatSubmit);
    }
});
