from django.urls import path
from .views import SignUp
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('signup/', SignUp.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(next_page='/app/'), name='logout'),
]
