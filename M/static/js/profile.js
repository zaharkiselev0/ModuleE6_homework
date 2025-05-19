/* Логика работы с модальным окном - карточкой пользователя */

import { getProfile, changeProfile } from './api.js';
import { getChatCreateAttemptEvent } from './events.js';
import { getChatName } from './support.js';

let currentProfileUsername = null;

// Открытие модалки профиля
async function openProfileModal(username, isOwner = false) {
  const profile = await getProfile(username);
  currentProfileUsername = username;

  // Заполнение данных
  document.getElementById('profileAvatar').src = profile.avatar || '/default-avatar.jpg';
  document.getElementById('profileUsername').textContent = username;
  document.getElementById('profileDescription').textContent = profile.description;

  // Переключение режимов
  document.getElementById('profileActions').classList.toggle('hidden', isOwner);
  document.getElementById('profileEditForm').classList.toggle('hidden', !isOwner);

  // Показать модалку
  document.getElementById('profileModal').style.display = 'flex';
  document.getElementById('profileModal').setAttribute('data_username', username);
}

// Закрытие модалки
function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}

document.getElementById('profileModal').addEventListener('click', (e) => {
  if(e.target === document.getElementById('profileModal')) closeProfileModal();
});

document.getElementById('close-button-profile').addEventListener('click', closeProfileModal);

// Сохранение профиля
document.getElementById('profileEditForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const description = document.getElementById('descriptionInput').value;
  const avatarFile = document.getElementById('avatarInput').files[0];
  const data = new FormData()
  if (description){
    data.append('description', description)
  }
  if (avatarFile){
    data.append('avatar', avatarFile)
  }
  await changeProfile(window.user, data);
  closeProfileModal();
});

// Добавляем обработчик открытия модалки профиля. Модалка откроется при клике по элементу внутри элемента с классом 'open-profile'. В элементе с этим классом должны быть аттрибуты data_username - username владельца карточки и data_owner - 'true' или 'false' в зависимости от того наша это карточка или нет.
document.body.addEventListener('click', function(e) {
  const trigger = e.target.closest('.open-profile');
  if(trigger) {
    const username = trigger.getAttribute('data_username');
    const isOwner = trigger.getAttribute('data_owner') === 'true';
    openProfileModal(username, isOwner);
  }
});

// Обработчик кнопки "Написать сообщение"
document.getElementById("writeMessageBtn").addEventListener('click', (e) =>{
    const username = document.getElementById('profileModal').getAttribute('data_username');
    const chatName = getChatName([username]);
    const members = [username, window.user];
    closeProfileModal();
    document.dispatchEvent(getChatCreateAttemptEvent({name: chatName, members: members}));
})