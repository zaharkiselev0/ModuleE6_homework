from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .serializers import *
from rest_framework import generics
from rest_framework import permissions
from .models import *
from .permissions import IsChatMember, IsChatInUserChats, IsOwnerOrReadOnly
from django.db.models import Prefetch
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, JSONParser


@login_required
def index(request):
    return render(request, "index.html", {'avatar_url': str(request.user.profile.avatar.url)})


class UserList(generics.ListAPIView):
    queryset = User.objects.select_related('profile')
    serializer_class = UserSerializer

    def get_queryset(self):
        username_contains = self.request.query_params.get('username_contains')
        count = int(self.request.query_params.get('count'))
        queryset = super().get_queryset()
        if username_contains:
            queryset = queryset.filter(username__contains=username_contains)
        return queryset[:count]


class ChatList(generics.ListCreateAPIView):
    queryset = Chat.objects.select_related('owner').prefetch_related('members')
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.filter(members=self.request.user).distinct()
        return queryset

    def perform_create(self, serializer):
        chat = serializer.save(owner=self.request.user)
        chat.members.add(self.request.user)


class ChatDetail(generics.RetrieveAPIView):
    queryset = Chat.objects.prefetch_related(
        'members',
        Prefetch(
            'messages',
            queryset=Message.objects.select_related(
                'author__profile'
            ).order_by('-created')
        )
    )
    serializer_class = ChatDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsChatMember]


class MessageCreate(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsChatInUserChats]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ProfileDetail(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    parser_classes = [MultiPartParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def perform_update(self, serializer):
        # удаляем старый аватар, если не дефолтный
        if 'avatar' in self.request.FILES and serializer.instance.avatar:
            if serializer.instance.avatar.url != '/media/default.jpg':
                serializer.instance.avatar.delete(save=False)
        serializer.save()
