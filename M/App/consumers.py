import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Chat, Message
from django.dispatch import receiver
from django.db.models.signals import post_save
from channels.layers import get_channel_layer
from django.conf import settings


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]

        # Проверяем принадлежность пользователя к чату
        if not Chat.objects.filter(id=self.chat_id, members=self.user).exists():
            self.close()
            return

        self.room_group_name = f'chat_{self.chat_id}'
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def chat_message(self, event):
        self.send(text_data=json.dumps(event['data']))

    def chat_is_created(self, event):
        if event['data']['owner'] != self.user:
            self.send(text_data=json.dumps(event['data']))


# при создании сообщения, отправляем сообщение группе
@receiver(post_save, sender=Message)
def send_message_to_chat(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{instance.chat.id}",
            {
                "type": "chat.message",
                "data": {
                    "eventGetter": "getMessageRecievedEvent",
                    "chat_id": instance.chat.id,
                    "message": {
                        "id": instance.id,
                        "text": instance.text,
                        "author": instance.author.username,
                        "created": instance.created.isoformat(),
                        "avatar_url": f"http://localhost:8000{instance.author.profile.avatar.url}"
                    }
                }
            }
        )


# при создании чата, отправляем событие chatCreatedByOther группе(кроме создателя)
@receiver(post_save, sender=Chat)
def send_chat_is_created(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{instance.id}",
            {
                "type": "chat.is.created",
                "data": {
                    "eventGetter": "getChatCreatedByOther",
                    "chat": {
                        "id": instance.id,
                        "name": instance.name,
                        "members": [user.username for user in instance.members.all()],
                        "owner": instance.owner.username,
                    }
                }
            }
        )