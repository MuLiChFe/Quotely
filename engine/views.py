from django.shortcuts import render,redirect
from .models import Quote, FilmMarker
from registration.models import User
import time
import re
import json

from .models import Film
# 获取用户关注的所有电

def get_gravatar_url(username):
    # 去除邮箱两端的空格并转换为小写
    name = '+'.join(username.strip().lower().split('.'))
    # 对邮箱进行 MD5 加密
    return f"https://ui-avatars.com/api/?background=0D8ABC&color=fff&name={name}&size=32"
    # 返回 Gravatar URL

def time_reversal(time):
    hour, min, sec = time.split(':')
    hour, min, sec = int(float(hour)), int(float(min)), int(float(sec))
    return 3600 * hour + min * 60 + sec


def seconds_to_hms(seconds):
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    remaining_seconds = seconds % 60
    return f"{hours}h{minutes}m{remaining_seconds}s"


def add_dialogs(start_number, result=[], max_sentences=7, distance=1, time_fan=[], gap_time=4,
                film_name='sunset_boulevard'):
    # 获取当前字幕
    lane = Quote.objects.filter(film_name=film_name, number=start_number)
    if not lane:
        return result
    initial_time = time_reversal(lane[0].start_time)
    if not time_fan:
        time_fan = [initial_time, initial_time]
    if len(result) >= max_sentences:
        return result
    pre_info = Quote.objects.filter(film_name=film_name, number=start_number + distance)
    post_info = Quote.objects.filter(film_name=film_name, number=start_number - distance)
    pre_lane = []
    post_lane = []
    if pre_info:
        start_time_ = time_reversal(pre_info[0].start_time)
        if abs(start_time_ - time_fan[0]) < gap_time and abs(initial_time - start_time_) < 15:
            time_fan[0] = start_time_
            pre_lane = [pre_info[0]]
    if post_info:
        start_time_ = time_reversal(post_info[0].start_time)
        if abs(start_time_ - time_fan[1]) < gap_time and abs(initial_time - start_time_) < 15:
            time_fan[1] = start_time_
            post_lane = [post_info[0]]

    result = pre_lane + result + post_lane
    if len(result) >= max_sentences or not (pre_lane + post_lane):
        return result
    return add_dialogs(start_number, result=result, max_sentences=max_sentences, distance=distance + 1,
                       time_fan=time_fan)


def get_link(film_name):
    film = Film.objects.filter(film_name=film_name)[0]
    return film.vimeo_id if film else '0'


def get_film_list(year_levels=None):
    dict = {}
    if year_levels is None:
        year_levels = ['12', '11', '10', '9']
    for year_level in year_levels:
        films = Film.objects.filter(year_levels__icontains=year_level).order_by('film_name')
        if not films:
            continue
        dict[year_level[1:]] = films
    return dict

def user_info(request):
    user_id = request.session.get('user_id', 0)
    if not user_id:
        return 'no user_id',''
    user, avatar = '', ''
    if user_id:
        user = User.objects.filter(id=user_id).first()
        if not user:
            request.session.pop('user_id')
            return False, ''
        avatar = get_gravatar_url(user.username)
        user.avatar = avatar
    return True, user

def index(request):
    flag, user = user_info(request)
    if not flag:
        return redirect('engine:index')
    film_dict = get_film_list()
    context = {"film_dict": film_dict,'user': user}
    return render(request, 'engine/home.html',context)


def search(request, film_name):
    film_name = film_name
    film_id = get_link(film_name)

    display_name = ' '.join(film_name.split('_'))
    display_name = display_name.title()

    t = time.time()
    query = request.GET.get('q', '')
    results = Quote.objects.filter(film_name=film_name, text__icontains=query)
    if len(results) > 40:
        return render(request, 'engine/search.html', {'query': query, 'results': [], 'number_of_results': len(results),
                                                      'time_taken': f"{float(time.time() - t):.5f}",
                                                      'film_name': film_name,
                                                      'display_name': display_name,
                                                      'error_message': "Too many results, please exact keywords"})
    # 使用字典存储所有字幕以便快速查找
    for result in results:
        current_number = int(result.number)
        result.text = re.sub(f'({re.escape(query)})', r'<span class="highlight">\1</span>', result.text,
                             flags=re.IGNORECASE)
        result.dialogs = []
        # 使用递归添加对话
        result.dialogs = add_dialogs(current_number, result=[result], film_name=film_name)
        result.dialogs.sort(key=lambda x: x.number)
        earliest_time = time_reversal(result.dialogs[0].start_time)
        result.start_play_time = seconds_to_hms(earliest_time - 2)

    # 这里可以添加其他逻辑
    return render(request, 'engine/search.html', {'query': query, 'results': results,
                                                  'number_of_results': len(results),
                                                  'time_taken': f"{float(time.time() - t):.5f}",
                                                  'film_id': film_id,
                                                  'film_name': film_name,
                                                  'display_name': display_name
                                                  },
                  )

def library(request,):
    flag, user = user_info(request)
    if not flag or flag == 'no user_id':
        return redirect('engine:index')
    films = Film.objects.all().values("id", 'film_name', 'display_name', 'year_levels', 'author', 'vimeo_id', 'image_link', 'type')
    context = {'user': user, 'films': json.dumps(list(films))}
    return render(request, 'engine/library/library.html',context)
