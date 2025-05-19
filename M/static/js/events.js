// event 'messageRecieved' диспачится,когда сообщение создано в бд, но еще не отрендерено
export function getMessageRecievedEvent(data){
    return new CustomEvent('messageRecieved', {
      detail: {message: data.message, chat_id: data.chat_id},
      bubbles: true
    });
}

// event 'chatCreateAttempt' диспачится, когда хотим создать чат с заданным именем и членами
export function getChatCreateAttemptEvent(data){
    return new CustomEvent('chatCreateAttempt', {
      detail: {name: data.name, members: data.members},
      bubbles: true
    });
}

// event 'chatCreatedByOther' диспачится, когда чат с нами, создан другим пользователем
export function getChatCreatedByOther(data){
    return new CustomEvent('chatCreatedByOther', {
      detail: {chat: data.chat},
      bubbles: true
    });
}