from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill


class Message(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    created = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    chat = models.ForeignKey("Chat", on_delete=models.CASCADE, related_name='messages')


class Chat(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_chats')
    members = models.ManyToManyField(User, db_table='UserChat', related_name='chats')


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = ProcessedImageField(
        upload_to='avatars',
        processors=[ResizeToFill(100, 100)],
        format='JPEG',
        options={'quality': 80},
        blank=True,
        null=True,
        default='default.jpg',
    )
    description = models.TextField(default='')


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
