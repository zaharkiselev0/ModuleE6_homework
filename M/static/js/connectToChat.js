/* Создание websocket-соединений */
import { getMessageRecievedEvent, getChatCreatedByOther } from './events.js';

const functionMap = {getMessageRecievedEvent, getChatCreatedByOther};

// map открытых websocket-соединений
const activeSockets = new Map();

// создаем websocket-соединение, если еще не создано
export function connectToChat(chatId) {
    if (activeSockets.has(chatId)) return;

    const socket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatId}/`);

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        // диспатчим event для обработки в app.js
        document.dispatchEvent(functionMap[data['eventGetter']](data));
    };

    socket.onclose = function(e) {
        activeSockets.delete(chatId);
        console.log(`Connection for chat ${chatId} closed`);
    };

    activeSockets.set(chatId, socket);
}