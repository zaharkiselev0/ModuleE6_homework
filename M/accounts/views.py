from django.contrib.auth.models import User
from django.views.generic.edit import CreateView
from django.contrib.auth.forms import UserCreationForm


class SignUp(CreateView):
    model = User
    form_class = UserCreationForm
    success_url = '/accounts/login'
    template_name = 'registration/signup.html'
