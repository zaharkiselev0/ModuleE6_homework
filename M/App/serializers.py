from rest_framework import serializers
from .models import Message, Chat, User, Profile


class MessageSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all(), write_only=True)
    created = serializers.DateTimeField(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'text', 'author', 'chat', 'created', 'avatar_url']

    def get_avatar_url(self, obj):
        return f"http://localhost:8000{obj.author.profile.avatar.url}"


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_url']

    def get_avatar_url(self, obj):
        return f"http://localhost:8000{obj.profile.avatar.url}"


class ChatSerializer(serializers.ModelSerializer):
    members = serializers.SlugRelatedField(
        many=True,
        slug_field='username',
        queryset=User.objects.all()
    )
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Chat
        fields = ['id', 'name', 'owner', 'members']


class ChatDetailSerializer(serializers.ModelSerializer):
    members = serializers.SlugRelatedField(
        many=True,
        slug_field='username',
        read_only=True
    )
    owner = serializers.ReadOnlyField(source='owner.username')
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'name', 'owner', 'members', 'messages']


class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ['id', 'avatar', 'user', 'description']
