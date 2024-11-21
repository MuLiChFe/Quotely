from django.db import models
from registration.models import User

# Create your models here.
class Quote(models.Model):
    film_name = models.CharField(max_length=255)
    number = models.CharField(max_length=6)  # 假设号码不会超过10个字符
    start_time = models.CharField(max_length=10)  # 根据你需要的格式调整长度
    end_time = models.CharField(max_length=10, default='1')
    text = models.TextField()  # 使用 TextField 以支持较长的字幕内容

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


class FilmMarker(models.Model):
    film = models.ForeignKey(Film, on_delete=models.CASCADE, related_name="markers")
    user_id = models.CharField(max_length=255,default='1')  # 用户ID

    # class Meta:
    #     unique_together = ('film', 'user_id')  # 保证每个用户只能关注一次同一部电影

    def __str__(self):
        return f"{self.user_id} - {self.film.display_name}"