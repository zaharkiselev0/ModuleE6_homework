from django.urls import path

from .views import *


urlpatterns = [
    path("", index, name="index"),
    path("users/", UserList.as_view(), name="users"),
    path("chats/", ChatList.as_view(), name="chats"),
    path("chat/<int:pk>/", ChatDetail.as_view(), name="chat"),
    path("message/", MessageCreate.as_view(), name="message"),
    path('profile/<str:username>/', ProfileDetail.as_view(), name='profile-detail'),
]

