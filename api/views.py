import json
from collections import UserString

from Tools.scripts.generate_opcode_h import footer
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import render
from django.db.models import Q

from engine.models import Film, Quote
from registration.models import User
from django.shortcuts import get_object_or_404

def user_marks(request):
    print('user_marks')
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # 获取请求体中的数据
            category = data['category']
            user_id = data['user_id']  # 提取 user_id
            # 根据 user_id 获取相关电影数据
            if category == 'film':
                user = User.objects.get(id=user_id)  # 获取用户对象
                followed_films = user.following_films.all()  # 获取用户关注的所有电影
                film_list = [{
                    "film_id": film.id,
                    "display_name": film.display_name,
                } for film in followed_films]
                return JsonResponse(film_list, safe=False)
            if category == 'quote':
                user = User.objects.get(id=user_id)  # 获取用户对象
                followed_quotes = user.following_quotes.all()  # 获取用户关注的所有引用
                quote_list = {
                    'quote_id': [str(quote.id) for quote in followed_quotes]
                }
                return JsonResponse(quote_list, safe=False)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'message': 'Invalid method'}, status=405)



# 关注电影
def add_marker(request):
    print(request.body)
    if request.method == 'POST':
        data = json.loads(request.body)
        category = data['category']
        user_id = data['user_id']
        target_id = data['target_id']

        if category == 'film':
            user = User.objects.get(id=user_id)  # 获取用户对象
            film = Film.objects.get(id=target_id)  # 获取电影对象

            # 检查用户是否已经关注该电影
            if not user.following_films.filter(id=film.id).exists():
                user.following_films.add(film)  # 添加关注
                return JsonResponse({'message': 'Film added to markers'})

        if category == 'quote':
            user = User.objects.get(id=user_id)  # 获取用户对象
            quote = Quote.objects.get(id=target_id)  # 获取引用对象

            # 检查用户是否已经关注该引用
            if not user.following_quotes.filter(id=quote.id).exists():
                user.following_quotes.add(quote)  # 添加关注
                return JsonResponse({'message': 'Quote added to markers'})

        return JsonResponse({'message': 'Already marked'}, status=400)
    return JsonResponse({'message': 'Invalid method'}, status=405)


# 取消关注电影
def remove_marker(request):
    if request.method == 'DELETE':
        data = json.loads(request.body)
        category = data['category']
        user_id = data['user_id']
        target_id = data['target_id']

        if category == 'film':
            user = User.objects.get(id=user_id)  # 获取用户对象
            film = Film.objects.get(id=target_id)  # 获取电影对象

            # 取消关注电影
            if user.following_films.filter(id=film.id).exists():
                user.following_films.remove(film)
                return JsonResponse({'message': 'Film removed from markers'})

        if category == 'quote':
            user = User.objects.get(id=user_id)  # 获取用户对象
            quote = Quote.objects.get(id=target_id)  # 获取引用对象

            # 取消关注引用
            if user.following_quotes.filter(id=quote.id).exists():
                user.following_quotes.remove(quote)
                return JsonResponse({'message': 'Quote removed from markers'})

        return JsonResponse({'message': 'Not found in markers'}, status=404)
    return JsonResponse({'message': 'Invalid method'}, status=405)


def check_marker(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        category = data['category']
        user_id = data['user_id']
        target_id = data['target_id']

        if category == 'film':
            user = User.objects.get(id=user_id)  # 获取用户对象
            film = Film.objects.get(id=target_id)  # 获取电影对象

            # 检查用户是否关注该电影
            if user.following_films.filter(id=film.id).exists():
                return JsonResponse({'exist': True})
            return JsonResponse({'exist': False})

        if category == 'quote':
            user = User.objects.get(id=user_id)  # 获取用户对象
            quote = Quote.objects.get(id=target_id)  # 获取引用对象

            # 检查用户是否关注该引用
            if user.following_quotes.filter(id=quote.id).exists():
                return JsonResponse({'exist': True})
            return JsonResponse({'exist': False})
    return JsonResponse({'message': 'Invalid method'}, status=405)


def get_marker(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        category = data['category']
        #user_id = data['user_id']
        target_id = data['target_id']

        if category == 'film':
            film = Film.objects.filter(id=target_id).first()
            if film:
                film_dict = model_to_dict(film)
                return JsonResponse({'exist': True, 'marker': film_dict})
            return JsonResponse({'exist': False})

        if category == 'quote':
            marker = Quote.objects.filter(id=target_id).first()
            if marker:
                marker_dict = model_to_dict(marker)
                return JsonResponse({'exist': True, 'marker': marker_dict})
            return JsonResponse({'exist': False})
    return JsonResponse({'message': 'Invalid method'}, status=405)

def get_all_markers(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        category = data['category']
        if category == 'film':
            film = Film.objects.all()
            id_list = []
            if film:
                id_list = film.values_list('id', flat=True)
            return JsonResponse({"exist": True, "id_list": list(id_list)})
        if category == 'quote':
            quote = Quote.objects.all()
            id_list = []
            if quote:
                id_list = quote.values_list('id', flat=True)
            return JsonResponse({'exist': True, 'id_list': list(id_list)})
    return JsonResponse({'message': 'Invalid method'}, status=405)


def get_user_tags(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        if user_id:
            try:
                # 确保获取到正确的用户实例
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User not found'}, status=404)
            print(user)
            workspace_list = user.workspace_groups.all()
            for workspace in workspace_list:
                teacher_tags = Tag.objects.filter(workspace_id=workspace.id).values_list('id', flat=True)
                print(Tag.objects.filter(workspace_id=workspace.id))
                print(teacher_tags)

            # 查询用户自己的标签和 Workspace 中老师发布的标签
            tags = Tag.objects.filter(
                Q(user=user) |
                Q(user__workspace__in=user.workspaces.all(), user__role='teacher')
            ).distinct()
            # 构建响应数据
            tags_data = {}
            for tag in tags:
                if tag.id not in tags_data:
                    tags_data[tag.id] = {
                        "tag_id": tag.id,
                        "tag_name": tag.name,
                        "quotes": []
                    }
                tags_data[tag.id]["quotes"].append({
                    "id": tag.quote.id,
                    "text": tag.quote.text
                })

            return JsonResponse({'tags': list(tags_data.values())}, status=200)

        return JsonResponse({'message': 'User ID not provided'}, status=400)

    return JsonResponse({'message': 'Invalid method'}, status=405)

def add_tag(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        quote_id = data.get('quote_id')
        tag_name = data.get('tag_name')

        if user_id and quote_id and tag_name:
            user = User.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)

            quote = Quote.objects.filter(id=quote_id).first()
            if not quote:
                return JsonResponse({'message': 'Quote not found'}, status=404)

            # 检查标签是否已经存在
            tag, created = Tag.objects.get_or_create(user=user, name=tag_name)

            # 检查标签是否已关联该引用
            if quote in tag.quotes.all():
                return JsonResponse({'message': 'Tag already exists for this quote'}, status=400)

            # 添加标签到引用
            tag.quotes.add(quote)

            return JsonResponse({'message': 'Tag added successfully', 'tag': {'id': tag.id, 'name': tag.name}}, status=201)

        return JsonResponse({'message': 'Missing required data'}, status=400)

    return JsonResponse({'message': 'Invalid method'}, status=405)

def remove_tag(request):
    if request.method == 'DELETE':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        quote_id = data.get('quote_id')
        tag_name = data.get('tag_name')

        if user_id and quote_id and tag_name:
            user = User.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)

            quote = Quote.objects.filter(id=quote_id).first()
            if not quote:
                return JsonResponse({'message': 'Quote not found'}, status=404)

            tag = Tag.objects.filter(user=user, name=tag_name).first()
            if not tag or quote not in tag.quotes.all():
                return JsonResponse({'message': 'Tag not found for this quote'}, status=404)

            # 删除标签与引用的关联
            tag.quotes.remove(quote)

            # 如果标签没有关联任何引用，删除该标签
            if not tag.quotes.exists():
                tag.delete()

            return JsonResponse({'message': 'Tag removed successfully'}, status=200)

        return JsonResponse({'message': 'Missing required data'}, status=400)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def search_by_tags(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        tag_names = data.get('tag_names')
        user_id = data.get('user_id')

        if not tag_names or not isinstance(tag_names, list):
            return JsonResponse({'message': 'Invalid or missing tag_names'}, status=400)

        user = User.objects.filter(id=user_id).first()
        if not user:
            return JsonResponse({'message': 'User not found'}, status=404)

        # 查询符合所有标签的引用
        tags = Tag.objects.filter(
            Q(user=user) | Q(workspace__users__in=[user]), name__in=tag_names
        ).distinct()

        if not tags.exists():
            return JsonResponse({'message': 'No matching tags found'}, status=404)

        quotes = Quote.objects.all()
        for tag in tags:
            quotes = quotes.filter(tags=tag)

        quotes_data = [{'id': quote.id, 'text': quote.text} for quote in quotes.distinct()]
        return JsonResponse({'quotes': quotes_data}, status=200)

    return JsonResponse({'message': 'Invalid method'}, status=405)

def test_api(request):
    return render(request, 'test_api.html')

def test_tag(request):
    return render(request, 'test_tag.html')