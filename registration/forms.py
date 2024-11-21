import re

from django import forms
from django.contrib.auth.hashers import make_password, check_password
from .models import User

class RegisterForm(forms.Form):
    email = forms.EmailField(
        required=True,
        max_length=100,
        error_messages={
            'required': "Email cannot be null or empty",
        }
    )
    password = forms.CharField(
        required=True,
        max_length=100,
        min_length=8,
        error_messages={
            'required': "Password must meet the requirement",
            'max_length': "Password must meet the requirement",
            'min_length': "Password must meet the requirement",
        }
    )

    def update(self,email,password):
        self.initial['email']=email
        self.initial['password']=password


    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email already registered")
        return email

    def clean_password(self):
        password = self.cleaned_data.get('password')
        # 正则验证密码至少8位并包含数字、大写字母和小写字母
        if not re.match(r'^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$', password):
            raise forms.ValidationError("Password must meet the requirement")
        return password

    def save(self):
        email = self.cleaned_data.get('email')
        password = make_password(self.cleaned_data.get('password'))  # 使用 make_password 加密
        username = email.split('@')[0]
        user = User(email=email, password=password, username=username)
        user.save()


class LoginForm(forms.Form):
    email = forms.EmailField(
        required=True,
        error_messages={'required': "Email cannot be null or empty"}
    )
    password = forms.CharField(
        required=True,
        max_length=100,
        error_messages={
            'required': "password cannot be null or empty",
            'max_length': "password incorrect2",
        }
    )

    def update(self,email,password):
        self.initial['email'] = email
        self.initial['password'] = password

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')

        user = User.objects.filter(email=email)
        if not user:
            self.add_error("email","This account does not exist")
        else:
            user = user[0]
            # 是否验证
            if not user.is_verified:
                self.add_error("email","Your email is not verified")
            elif not check_password(password, user.password):
                self.add_error('password', "password incorrect")

            return cleaned_data
