from django.urls import path, include
from . import views

app_name = "api"
urlpatterns = [
    path('user_marks/', views.user_marks, name='get_user_markers'),
    path('add_marker/', views.add_marker, name='add_marker'),
    path('remove_marker/', views.remove_marker, name='remove_marker'),
    path('check_marker/', views.check_marker, name='check_marker'),
    path('get_marker/',views.get_marker, name='get_marker'),
    path('get_all_markers/',views.get_all_markers, name='get_all_markers'),

    path('get_user_tags/', views.get_user_tags, name='get_user_tags'),
    path('add_tag/', views.add_tag, name='add_tag'),
    path('remove_tag/', views.remove_tag, name='remove_tag'),
    path('search_by_tags/', views.search_by_tags, name='search_by_tags'),


    path('test_api', views.test_api, name='test'),
    path('test_tag', views.test_tag, name='test_tag'),
]
