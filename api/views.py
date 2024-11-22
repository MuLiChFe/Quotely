import json

from Tools.scripts.generate_opcode_h import footer
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import render

from engine.models import FilmMarker, QuoteMarker, Film, Quote
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


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from engine.models import Quote
from .serializers import QuoteSerializer
class QuoteDetailView(APIView):
    def get(self, request, quote_id):
        try:
            quote = Quote.objects.get(id=quote_id)
            serializer = QuoteSerializer(quote)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Quote.DoesNotExist:
            return Response({"error": "Quote not found"}, status=status.HTTP_404_NOT_FOUND)
def test_api(request):
    return render(request, 'test_api.html')