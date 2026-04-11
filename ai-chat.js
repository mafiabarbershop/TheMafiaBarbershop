
/**
 * Don Barber AI - Customer Service Logic
 * Using Backend Proxy for Security
 */

let chatHistory = [];

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

    appendMessage('user', userMessage);
    inputField.value = '';

    const loadingId = appendLoading();

    try {
        // Panggil backend proxy kita sendiri, bukan Google langsung
        const response = await fetch('/api/chat', {
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
                ]
            })
        });

        const data = await response.json();
        removeLoading(loadingId);

        if (data.text) {
            const aiResponse = data.text;
            appendMessage('ai', aiResponse);
            
            chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
            chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
            
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        } else {
            throw new Error(data.error || 'Terjadi kesalahan pada AI.');
        }
    } catch (error) {
        console.error('Don Barber AI Error:', error);
        removeLoading(loadingId);
        appendMessage('ai', "Maaf Boss, markas sedang sulit dihubungi. Coba lagi sebentar lagi ya.");
    }
}

function appendMessage(role, text) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = role === 'user' ? 'flex justify-end' : 'flex gap-2';
    
    const innerHtml = role === 'user' 
        ? `<div class="bg-crimson border border-crimson/20 rounded-lg rounded-tl-none p-3 text-white text-xs leading-relaxed max-w-[85%] shadow-lg">${text}</div>`
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

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ai-chat-form');
    if (form) {
        form.addEventListener('submit', handleAIChatSubmit);
    }
});
