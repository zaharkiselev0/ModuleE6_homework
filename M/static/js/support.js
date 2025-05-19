/* некоторые вспомогательные функции */

export function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ru-RU', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function debounce(fn, delay = 100){
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};


// Кэширование сообщений в localStorage
export function updateChatCache(chatId, message) {
    const cached = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    cached.push(message);
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(cached));
}

// Пока в имени пользователей не может быть символа '#', существует взаимно-однозначное соответствие между множествами юзернеймов members(порядок не важен), содержащих window.user, и возвращаемыми строками.
export function getChatName(members){
    members = new Set(members);
    members.add(window.user);
    return '#' + [...members].sort().join('#');
}

