from django.urls import path, include
from . import views

app_name = "api"
urlpatterns = [
    path('get_film_vimeo_id/', views.get_film_vimeo_id, name='get_film_vimeo_id'),
    path('get_dialogs/', views.get_dialogs, name='get_dialogs'),

    path('get_stander_quote_card/', views.get_stander_quote_card, name='get_stander_quote_card'),
    path('get_popup_quote_card/', views.get_popup_quote_card, name='get_popup_quote_card'),
    path('user_marks/', views.user_marks, name='get_user_markers'),
    path('add_marker/', views.add_marker, name='add_marker'),
    path('remove_marker/', views.remove_marker, name='remove_marker'),
    path('check_marker/', views.check_marker, name='check_marker'),
    path('get_marker/',views.get_marker, name='get_marker'),
    path('get_all_markers/',views.get_all_markers, name='get_all_markers'),

    path('create_tag/', views.create_tag, name='create_tag'),
    path('get_user_own_tags/',views.get_user_own_tags, name='get_user_tags'),
    path('quote_tags/',views.quote_tags, name='quote_tags'),
    path('bind_tag/', views.bind_tag, name='bind_tag'),
    path('unbind_tag/', views.unbind_tag, name='unbind_tag'),
    path('rename_tag/', views.rename_tag, name='rename_tag'),
    path('delete_tag/', views.delete_tag, name='delete_tag'),
    path('update_user_tag_order/', views.update_user_tag_order, name='update_user_tag_order'),

    path('get_colors/',views.get_colors, name='get_colors'),
    path('change_color/', views.change_color, name='change_color'),

    path('change_search_film/',views.change_search_film, name='change_search_film'),

    path('test_api', views.test_api, name='test'),
    path('test_tag', views.test_tag, name='test_tag'),
    path('test_gragging', views.test_gragging, name='test_gragging'),
    path('test_video', views.test_video, name='test_video'),
]
