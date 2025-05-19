/* Основная логика приложения,
обработка событий создания чата, выборачата, отправки сообщений*/

import './createChatWindow.js';
import './mainMenuWindow.js';
import './searchUsers.js';
import './profile.js';
import { connectToChat } from './connectToChat.js';
import { sendMessage, getChats, getChat, createChat } from './api.js';
import { formatTime, escapeHtml, getChatName, updateChatCache} from './support.js'

// id открытого чата
let activeChatId = null;

const messageSubmitButton = document.querySelector("#message-form button");
const messageInput = document.querySelector("#message-form input");
const chatList = document.getElementById('chat-list');
const messagesContainer = document.getElementById('chat-messages');
const searchUserInput = document.getElementById('search-user-input');
const chatTitle = document.getElementById('chatTitle');

// Добавление чата в список чатов
function chatListUpdate(chat){
     const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;

        //Добавляем уникальный id для чата-диалога, чтоб можно было его найти по его участникам
        if(chat.members.length <= 2){
            chatItem.id = 'dialog_' + getChatName(chat.members);
        }

        chatItem.innerHTML = `
            <h4>${chat.name}</h4>
            <div>Members: ${chat.members.join(', ')}</div>
        `;

        chatList.appendChild(chatItem);
        chatItem.addEventListener('click', chatSelectHandler)    ;
        return chatItem;
}

// Обработка выбора чата в списке чатов
async function chatSelectHandler(e){
    const chatItem = e.target.closest('.chat-item');
    if (chatItem) {
        const chatId = Number(chatItem.dataset.chatId);
        document.querySelectorAll('.chat-item.active').forEach(el => el.classList.remove('active'));
        chatItem.classList.add('active');
        activeChatId = chatId;

        // Создаем websocket-соединение, если еще не создано
        await connectToChat(chatId);

        // словарь id 'активных' чатов, т.е. таких, актуальная версия сообщений которых загружена в localStorage
        const activeChats = JSON.parse(sessionStorage.getItem('activeChats') || '{}');

        // Если чат неактивен, загружаем из БД, кешируем и добавляем в активные
        if(!activeChats[chatId]){
            const chat = await getChat(chatId);
            localStorage.setItem(`chat_${chatId}`, JSON.stringify(chat.messages));
            localStorage.setItem(`chatName_${chatId}`,JSON.stringify(chat.name));
            activeChats[chatId] = true;
            sessionStorage.setItem('activeChats', JSON.stringify(activeChats));
        }

        // Загружаем сообщения и имя чата из localStorage
        const chatMessages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
        const chatName = JSON.parse(localStorage.getItem(`chatName_${chatId}`) || 'Название чата');

        // Рендер окна чата
        renderMessages(chatMessages);
        chatTitle.textContent = chatName;
        messageInput.focus()
    }
}

// Рендер сообщения. Если isHistorical, добавляем сообщение вверх
function renderMessage(message, isHistorical = false) {
    const isCurrentUser = message.author === window.user;
    const avatarUrl = message.avatar_url;
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isCurrentUser ? 'outgoing' : 'incoming'}`;
    messageElement.innerHTML = `
        <div class="message-content">
            ${!isCurrentUser ? `
                <div class="open-profile" data_username=${message.author} data_owner=${false}>
                    <img class="user-avatar" src="${avatarUrl}" alt="${message.author}'s avatar">
                    <div class="message-author">${message.author}</div>
                </div>
            ` : ''}
            <div class="message-bubble">
                <div class="message-text">${escapeHtml(message.text)}</div>
                <div class="message-time">${formatTime(message.created)}</div>
            </div>
            ${isCurrentUser ? `
                <div class="open-profile" data_username=${message.author} data_owner=${true}>
                    <img class="user-avatar" src="${avatarUrl}" alt="Your avatar">
                </div>
            ` : ''}
        </div>
    `;
    if (isHistorical) {
        messagesContainer.prepend(messageElement);
    } else {
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Рендер списка сообщений
function renderMessages(messages) {
    messagesContainer.innerHTML = '';
    messages.forEach(msg => renderMessage(msg, true));
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}

// Создаем список чатов, в которых участвуем
getChats().then((chats) => {
    chats.forEach((chat) => {
        chatListUpdate(chat);
    });
});

// Обработка отправки сообщения
messageSubmitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = messageInput.value;
    const chatId = activeChatId;
    // API создания сообщения
    sendMessage(chatId, text);
    messageInput.value = '';
});

// event 'chatCreateAttempt' диспачится, когда хотим создать чат с заданным именем и членами(участниками)
document.addEventListener('chatCreateAttempt', async (e) => {
    const chatName = e.detail.name;
    const chatMembers = e.detail.members;
    if (!chatMembers.includes(window.user)){
        chatMembers.push(window.user);
    }
    // Если участников меньше 2, пытаемся вместо создания нового чата подключится к чату-диалогу с такими же участниками
    if(chatMembers.length <= 2){
        const chatElement = document.getElementById('dialog_' + getChatName(chatMembers));
        if(chatElement){
            chatElement.click();
            return;
        }
    }
    // Создаем чат в бд, подключаемся, обновляем список чатов
    const chat = await createChat(chatName, chatMembers);
    const chatItem = chatListUpdate(chat);
    connectToChat(chat.id);
    chatItem.click();
});

// event 'messageRecieved' диспачится,когда сообщение создано в бд, но еще не отрендерено
document.addEventListener('messageRecieved', (e) => {
    const chat_id = e.detail.chat_id;
    const message = e.detail.message;
    updateChatCache(chat_id, message);
    if(chat_id == activeChatId){
        renderMessage(message);
    }
});

// event 'chatCreatedByOther' диспачится, когда чат с нами создан другим пользователем
document.addEventListener('chatCreatedByOther', (e) => {
    chatListUpdate(e.detail.chat);
});

// Очищаем activeChats, перед загрузкой, чтоб не брать из кеша устаревшие данные
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('activeChats');
});



