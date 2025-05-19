from rest_framework import permissions


class IsChatMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.members.filter(id=request.user.id).exists()


class IsChatInUserChats(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user_chats = request.user.chats
        return user_chats.filter(id=obj.chat.id).exists()


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
