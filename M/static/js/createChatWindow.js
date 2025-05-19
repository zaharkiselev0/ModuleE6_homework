/* Логика работы с модальным окном создания чата */

import { getUsers } from './api.js';
import { getChatCreateAttemptEvent }  from './events.js'
import { debounce } from './support.js'

// Выбранные участники чата
const selectedUsers = new Set();

const modal = document.getElementById('modalOverlay');
const form = document.getElementById('chatForm');
const searchInput = document.getElementById('userSearch');
const searchResults = document.getElementById('searchResults');
const selectedUsersContainer = document.getElementById('selectedUsers');
const chatNameDOM = document.getElementById('chatName');

//Обработка изменения запроса в строке поиска пользователей
const debouncedUserSearch = debounce(async (event) => {
    const query = event.target.value;
    //Возвращает 5 пользователей, в username которых есть query
    const users = await getUsers(query, 5);
    usersRender(users);
  });

searchInput.addEventListener('input', debouncedUserSearch);
searchInput.addEventListener('focus', debouncedUserSearch);

// Рендер блока выбранных пользователей
function updateSelectedUsersDisplay() {
    selectedUsersContainer.innerHTML = '';
    selectedUsers.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'user-item selected';
        userEl.innerHTML = `
            <img src="${user.avatar_url}" alt="${user.username}">
            <span>${user.username}</span>
        `;
        userEl.onclick = () => toggleUserSelection(user);
        selectedUsersContainer.appendChild(userEl);
    });
}

// Рендер блока предложенных к выбору пользователей
function usersRender(users) {
    searchResults.innerHTML = '';
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'user-item';
        userEl.innerHTML = `
            <img src="${user.avatar_url}" alt="${user.username}">
            <div>${user.username}</div>
        `;
        userEl.onclick = () => toggleUserSelection(user);
        searchResults.appendChild(userEl);
    });
}

// Закрытие модалки
function closeModal() {
    modal.classList.remove('visible');
    form.reset();
    selectedUsers.clear();
    updateSelectedUsersDisplay();
    searchResults.innerHTML = '';
}

// Обработчики закрытия
modal.addEventListener('click', (e) => e.target === modal && closeModal());
document.querySelector('.cancel-btn').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('visible')) closeModal();
});
document.querySelector('.close-btn-modal').addEventListener('click', closeModal);


 // Обработка выбора пользователя
export function toggleUserSelection(user) {
    selectedUsers.has(user)
        ? selectedUsers.delete(user)
        : selectedUsers.add(user);

    updateSelectedUsersDisplay();
}

// Обработчик открытия
document.getElementById('open-chat-create').addEventListener('click', () => {
    modal.classList.add('visible');
});


// Обработка отправки формы
const submitChatButton = document.querySelector('#message-form ');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const chatName = chatNameDOM.value;
    const chatMembers = [...selectedUsers].map(user => user.username);
    document.dispatchEvent(getChatCreateAttemptEvent({name: chatName, members: chatMembers}));
    closeModal();
});



