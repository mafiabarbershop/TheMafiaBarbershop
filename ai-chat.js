
/**
 * Don Barber AI - Customer Service Logic
 * Using Backend Proxy for Security
 */

let chatHistory = [];
let pendingImage = null;

function toggleAIChat() {
    const chatWindow = document.getElementById('ai-chat-window');
    const inputField = document.getElementById('ai-chat-input');
    const hint = document.getElementById('ai-chat-hint');
    
    if (chatWindow.classList.contains('hidden')) {
        chatWindow.classList.remove('hidden');
        if (hint) hint.classList.add('hidden'); // Sembunyikan notifikasi saat chat dibuka
        setTimeout(() => {
            chatWindow.classList.remove('scale-95', 'opacity-0');
            chatWindow.classList.add('scale-100', 'opacity-100');
            inputField.focus();
        }, 10);
    } else {
        chatWindow.classList.add('scale-95', 'opacity-0');
        chatWindow.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            chatWindow.classList.add('hidden');
        }, 300);
    }
}


function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        pendingImage = {
            inlineData: {
                data: event.target.result.split(',')[1],
                mimeType: file.type
            }
        };
        showImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(src) {
    const preview = document.getElementById('ai-chat-preview');
    const img = document.getElementById('ai-chat-preview-img');
    img.src = src;
    preview.classList.remove('hidden');
}

function cancelImageUpload() {
    pendingImage = null;
    document.getElementById('ai-chat-preview').classList.add('hidden');
    document.getElementById('ai-chat-file').value = '';
}

async function handleAIChatSubmit(e) {
    if (e) e.preventDefault();
    
    const inputField = document.getElementById('ai-chat-input');
    const userMessage = inputField.value.trim();
    if (!userMessage && !pendingImage) return;

    const currentImage = pendingImage;
    cancelImageUpload();

    // Tampilkan pesan di UI
    if (currentImage) {
        appendImageMessage('user', currentImage.inlineData.data, currentImage.inlineData.mimeType);
    }
    if (userMessage) {
        appendMessage('user', userMessage);
    }
    
    inputField.value = '';
    const loadingId = appendLoading();

    try {
        const parts = [];
        if (currentImage) {
            parts.push(currentImage);
        }
        parts.push({ text: userMessage || "Berikan saran potongan rambut yang pas untuk saya berdasarkan foto ini." });

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
                        parts: parts
                    }
                ]
            })
        });

        const data = await response.json();
        removeLoading(loadingId);

        if (data.parts) {
            data.parts.forEach(part => {
                if (part.text) {
                    appendMessage('ai', part.text);
                } else if (part.image) {
                    appendImageMessage('ai', part.image, part.mimeType);
                }
            });
            
            chatHistory.push({ role: "user", parts: parts });
            
            // Map the response parts back to the API format for history
            const modelParts = data.parts.map(p => 
                p.text ? { text: p.text } : { inlineData: { data: p.image, mimeType: p.mimeType } }
            );
            chatHistory.push({ role: "model", parts: modelParts });
            
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        } else {
            throw new Error(data.error || 'Terjadi kesalahan pada AI.');
        }
    } catch (error) {
        console.error('Don Barber AI Error:', error);
        removeLoading(loadingId);
        appendMessage('ai', "Maaf Boss, ada kesalahan teknis di markas. Sedang kami perbaiki, coba lagi sebentar lagi ya.");
    }
}

function appendImageMessage(role, base64, mimeType) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = role === 'user' ? 'flex justify-end' : 'flex gap-2';
    
    const innerHtml = role === 'user' 
        ? `<div class="bg-crimson/10 border border-crimson/20 rounded-lg p-2 max-w-[70%] shadow-lg">
               <img src="data:${mimeType};base64,${base64}" class="w-full h-auto rounded-sm border border-white/10" alt="Uploaded Image">
           </div>`
        : `<div class="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/20 border border-crimson/40 flex items-center justify-center text-[10px] mt-1">🤵</div>
           <div class="bg-white/5 border border-white/10 rounded-lg p-2 max-w-[75%] shadow-lg">
               <img src="data:${mimeType};base64,${base64}" class="w-full h-auto rounded-sm border border-white/10" alt="Generated Simulation">
           </div>`;
    
    messageDiv.innerHTML = innerHtml;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendMessage(role, text) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = role === 'user' ? 'flex justify-end' : 'flex gap-2';
    
    // Parse markdown-like bold text **text** to <b>text</b>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
    // Parse markdown images ![alt](url)
    formattedText = formattedText.replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="mt-2 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black"><img src="$2" alt="$1" class="w-full h-auto"></div>');

    const innerHtml = role === 'user' 
        ? `<div class="bg-crimson border border-crimson/20 rounded-lg rounded-tl-none p-3 text-white text-xs leading-relaxed max-w-[85%] shadow-lg">${formattedText}</div>`
        : `
            <div class="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/20 border border-crimson/40 flex items-center justify-center text-[10px]">🤵</div>
            <div class="bg-white/5 border border-white/10 rounded-lg rounded-tl-none p-3 text-cream/80 text-xs leading-relaxed max-w-[85%] shadow-sm">${formattedText}</div>
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
    
    const fileInput = document.getElementById('ai-chat-file');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
});



