# registration/models.py
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator

import uuid

# 密码验证器：确保密码至少8位，包含字母和数字
password_validator = RegexValidator(
    regex=r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$',
    message="Password must be at least 8 characters long and contain both letters and numbers."
)

class Verify(models.Model):
    email = models.EmailField()  # 同一邮箱只有一个有效令牌
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        # 设置链接有效期，比如 15 分钟
        expiration_time = self.created_at + timezone.timedelta(minutes=15)
        return timezone.now() > expiration_time

    def __str__(self):
        return f'{self.email} - Expired: {self.is_expired()}'

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class TeamMember(models.Model):
    member = models.ForeignKey('User', on_delete=models.CASCADE,null=True, blank=True,related_name='team_members')

    role = models.CharField(choices=[('teacher', 'Teacher'), ('student', 'Student')], max_length=20, default='student')
    workspace_belonged = models.ForeignKey(Workspace,on_delete=models.CASCADE, related_name='team_members', null=True, blank=True)

    def __str__(self):
        return f'{self.role}'

class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, validators=[password_validator], null=False)
    is_verified = models.BooleanField(default=False)
    username = models.CharField(max_length=10, null=False)
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.id} - {self.username}'