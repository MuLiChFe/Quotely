# engine/models.py
from django.db import models

# Create your models here.
class Quote(models.Model):
    film_name = models.CharField(max_length=255)
    number = models.CharField(max_length=6)  # 假设号码不会超过10个字符
    start_time = models.CharField(max_length=10)  # 根据你需要的格式调整长度
    end_time = models.CharField(max_length=10, default='1')
    text = models.TextField()  # 使用 TextField 以支持较长的字幕内容
    tags = models.ManyToManyField('engine.Tag', blank=True, related_name="taged_quotes")
    followers = models.ManyToManyField('registration.User', blank=True, related_name="followed_quotes")

    def __str__(self):
        return f"{self.film_name} - {self.number}"


class Film(models.Model):
    film_name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255)
    year_levels = models.CharField(max_length=50)
    author = models.CharField(max_length=255)
    vimeo_id = models.CharField(max_length=30)
    image_link = models.URLField(default='')
    type = models.CharField(max_length=255, default='Noval')

    def __str__(self):
        return f"{self.id} - {self.display_name}"

class Tag(models.Model):
    name = models.CharField(max_length=50)  # 标签名字
    created_at = models.DateTimeField(auto_now_add=True)
    display_name = models.CharField(max_length=255)
    created_by = models.ForeignKey('registration.User', on_delete=models.CASCADE, related_name="own_tags", default=1)  # 标签归属的用户
    workspace = models.ForeignKey('registration.Workspace', on_delete=models.SET_NULL, null=True, blank=True, related_name="workspace_tags")
    related_film = models.ForeignKey('Film', on_delete=models.SET_NULL, null=True, blank=True, related_name="film_tags")

    def __str__(self):
        return f"{self.name}"