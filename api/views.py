import json
from django.http import JsonResponse
from django.shortcuts import render

from engine.models import FilmMarker, Quote
from django.shortcuts import get_object_or_404

def user_marks(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # 获取请求体中的数据
            category = data['category']
            user_id = data['user_id']  # 提取 user_id
            # 根据 user_id 获取相关电影数据
            if category == 'film':
                films = FilmMarker.objects.filter(user_id=user_id)
                film_list = [{
                    "film_id": film.film.id,
                    "display_name": film.film.display_name,
                } for film in films]
                return JsonResponse(film_list, safe=False)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'message': 'Invalid method'}, status=405)


# 关注电影
def add_marker(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        category = data['category']
        user_id = data['user_id']
        film_id = data['film_id']
        # Check if the marker already exists
        if category == 'film':
            if not FilmMarker.objects.filter(user_id=user_id, film_id=film_id).exists():
                FilmMarker.objects.create(user_id=user_id, film_id=film_id)
                return JsonResponse({'message': 'Film added to markers'})
        return JsonResponse({'message': 'Film already marked'}, status=400)
    return JsonResponse({'message': 'Invalid method'}, status=405)


# 取消关注电影
def remove_marker(request):
    if request.method == 'DELETE':
        data = json.loads(request.body)
        category = data['category']
        user_id = data['user_id']
        film_id = data['film_id']
        if category == 'film':
            marker = FilmMarker.objects.filter(user_id=user_id, film_id=film_id).first()
            if marker:
                marker.delete()
                return JsonResponse({'message': 'Film removed from markers'})
        return JsonResponse({'message': 'Film not found in markers'}, status=404)
    return JsonResponse({'message': 'Invalid method'}, status=405)

def check_marker(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        category = data['category']
        user_id = data['user_id']
        film_id = data['film_id']

        # Check if the marker exists
        if category == 'film':
            marker = FilmMarker.objects.filter(user_id=user_id, film_id=film_id).first()
            if marker:
                return JsonResponse({'exist': True})
            return JsonResponse({'exist': False})
    return JsonResponse({'message': 'Invalid method'}, status=405)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from engine.models import Quote
from .serializers import QuoteSerializer
class QuoteDetailView(APIView):
    def get(self, request, quote_id):
        try:
            print(quote_id)
            quote = Quote.objects.get(id=quote_id)
            serializer = QuoteSerializer(quote)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Quote.DoesNotExist:
            return Response({"error": "Quote not found"}, status=status.HTTP_404_NOT_FOUND)
def test_api(request):
    return render(request, 'test_api.html')