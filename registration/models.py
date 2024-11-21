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
    test = models.CharField(max_length=120)
    # email = models.EmailField()  # 同一邮箱只有一个有效令牌
    # token = models.UUIDField(default=uuid.uuid4, unique=True)
    # created_at = models.DateTimeField(auto_now_add=True)
    #
    # def is_expired(self):
    #     # 设置链接有效期，比如 15 分钟
    #     expiration_time = self.created_at + timezone.timedelta(minutes=15)
    #     return timezone.now() > expiration_time
    #
    # def __str__(self):
    #     return f'{self.email} - Expired: {self.is_expired()}'

class User(models.Model):
    test = models.CharField(max_length=120)
    # email = models.EmailField(unique=True)
    # password = models.CharField(max_length=255, validators=[password_validator], null=False)
    # is_verified = models.BooleanField(default=False)
    # username = models.CharField(max_length=10, null=False)
    # create_time = models.DateTimeField(auto_now_add=True)
    # account_type = models.CharField(max_length=255, default='Individual')
    # associated_school_id = models.CharField(max_length=255,default=None)
    #
    # def __str__(self):
    #     return f'{self.id} - {self.username}'
