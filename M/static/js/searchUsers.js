/* Обработка поиска пользователей в главном окне*/

import { getUsers } from './api.js';
import { getChatCreateAttemptEvent }  from './events.js'
import { debounce, getChatName } from './support.js'

const searchInput = document.getElementById('search-user-input');
const searchResults = document.getElementById('username-list');

//Обработка изменения запроса в строке поиска пользователей
const debouncedUserSearch = debounce(async (event) => {
    const query = event.target.value;
    //Возвращает 10 пользователей, в username которых есть query
    const users = await getUsers(query, 10);
    usersRender(users);
  });

searchInput.addEventListener('input', debouncedUserSearch);
searchInput.addEventListener('focus', debouncedUserSearch);
searchInput.addEventListener('focus', () => {
    searchResults.classList.add('visible');
});
searchResults.addEventListener('click', (e) => e.target === searchResults && closeModal());
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchResults.classList.contains('visible')) closeModal();
});

// Закрытие модалки
function closeModal() {
    searchResults.classList.remove('visible');
    searchResults.innerHTML = '';
}

// Рендер блока предложенных к выбору пользователей
function usersRender(users) {
    searchResults.innerHTML = '';
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'user-item';
        userEl.innerHTML = `
            <img src="${user.avatar_url}" class="search-user-avatar" alt="${user.username}">
            <div class="user-info">
                <div class="username">${user.username}</div>
            </div>
        `;

        // При клике пытаемся созать диалог с пользователем(если еще не создан) и перейти к нему
        userEl.onclick = (e) => {
            document.dispatchEvent(
                getChatCreateAttemptEvent({name: getChatName([user.username]), members: [user.username]})
            );
            closeModal();
        };

        searchResults.appendChild(userEl);
    });
}
