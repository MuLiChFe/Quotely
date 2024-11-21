# engine/urls.py
from django.urls import path, include
from . import views
app_name = "engine"

from django.urls import path, include
urlpatterns = [
    path('film/<str:film_name>', views.search, name='search'),
    path('', views.index, name='index'),
    path('library', views.library, name='library'),

]
