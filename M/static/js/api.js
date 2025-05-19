/* API функции */

// Возвращает count user-ов, в username которых есть строка query
export async function getUsers(query, count){
    const users = await sendRequest(`users/?username_contains=${query}&count=${count}`);
    return users;
}

// Создает чат по имени и спику пользователей. Создателя чата можно не включать в usernames
export async function createChat(chat_name, usernames){
    const chat =  await sendRequest('chats/', 'POST', {name: chat_name, members: usernames});
    return chat;
}

// Создает сообщение
export async function sendMessage(chat_id, text){
    const message =  await sendRequest('message/', 'POST', {chat: chat_id, text: text});
    return message;
}

// Возвращает сериализованный чат со всеми сообщениями
export async function getChat(chat_id){
    const chat =  await sendRequest('chat/' + chat_id + '/');
    return chat;
}

// Возвращает профиль пользователя по username
export async function getProfile(username){
    const profile =  await sendRequest(`profile/${username}/`);
    return profile;
}

// Изменение профиля, form_data объект класса FormData
export async function changeProfile(username, form_data){
    const profile =  await sendRequest(`profile/${username}/`, 'PUT', form_data);
    return profile;
}

// Возвращает список чатов, в которых участвует пользователь. Сериализованные чаты в списке не содержат сообщений(использовать getChat)
export async function getChats(){
    const chats =  await sendRequest('chats/');
    return chats;
}


async function sendRequest(url, method = 'GET', body = null) {
    const config = {
        method,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include'
    };

    if (body && !(body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }

    console.log(config);
    config.body = body;
    const response = await fetch(url, config);
    const data = await response.json();

    return data;
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}