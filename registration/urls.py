from django.urls import path
from .views import *

app_name = 'registration'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # 注册

    path('verify_email/<str:email>/', VerifyEmail.as_view(), name='verify_email'),

    path('verify_token/<str:token>', verify_token, name='verify_token'),
    path('login/', LoginView.as_view(), name='login'),  # 登录

    path('clean/', clean, name='clean'),
    path('logout/', Logout, name='logout'),  # 注销
]