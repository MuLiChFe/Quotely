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
    followers = models.ManyToManyField('registration.User', blank=True, related_name="followed_films")

    def __str__(self):
        return f"{self.id} - {self.display_name}"

class Tag(models.Model):
    display_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('registration.User', on_delete=models.CASCADE, related_name="own_tags", default=1)  # 标签归属的用户
    workspace = models.ForeignKey('registration.Workspace', on_delete=models.SET_NULL, null=True, blank=True, related_name="workspace_tags")
    related_film = models.ForeignKey('Film', on_delete=models.SET_NULL, null=True, blank=True, related_name="film_tags")
    color = models.ForeignKey('engine.Color', on_delete=models.SET_NULL, null=True, blank=True, related_name="color_tags")
    def __str__(self):
        return f"{self.id}: {self.display_name}"

class Color(models.Model):
    name = models.CharField(max_length=255)
    color_code = models.CharField(max_length=255)
    created_by = models.ForeignKey('registration.User', null=True,blank=True, on_delete=models.CASCADE, related_name="own_colors", default=1)
    def __str__(self):
        return f"{self.name} - {self.created_by.username if self.created_by else 'DEFAULT'}"

class UserTagOrder(models.Model):
    user = models.ForeignKey('registration.User', on_delete=models.CASCADE, related_name='tag_orders')
    tag = models.ForeignKey('engine.Tag', on_delete=models.CASCADE, related_name='user_orders')
    order = models.PositiveIntegerField(default=0, help_text="用户自定义的排序位置")
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'tag')  # 确保同一个用户对同一个标签只有一个排序
        ordering = ['order']  # 默认按照排序字段排序

    def __str__(self):
        return f"{self.user.username} - {self.tag.display_name} - Order: {self.order}"

class TagQuoteManager(models.Model):
    tag = models.ForeignKey('engine.Tag', on_delete=models.CASCADE, related_name='tag_quotes')
    quote = models.ForeignKey('engine.Quote', on_delete=models.CASCADE, related_name='tag_quotes')
    create_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.tag.display_name} - {self.quote.number},{self.create_at.strftime('%m/%d/%Y')}"

class Folder(models.Model):
    name = models.CharField(max_length=255)
    create_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('registration.User', on_delete=models.CASCADE, related_name="own_folders", default=1)
    related_film = models.ForeignKey('Film', on_delete=models.SET_NULL, null=True, blank=True, related_name="film_folders")
    # Concise details can help enhance your focus
    description = models.TextField(default="")

    def __str__(self):
        return f"{self.name} - {self.created_by.username if self.created_by else 'DEFAULT'}"

class FolderUserManager(models.Model):
    folder = models.ForeignKey('Folder', on_delete=models.CASCADE, related_name='folder_users')
    user = models.ForeignKey('registration.User', on_delete=models.CASCADE, related_name='folder_users')
    role = models.CharField(choices=[('owner', 'Owner'),('editor','Editor'), ('visitor', 'Visitor')], max_length=20, default='visitor')
    create_at = models.DateTimeField(auto_now_add=True)
    last_viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.folder.display_name} - {self.user.username if self.user else 'DEFAULT'} - {self.role}"
