from django.http import JsonResponse
from django.shortcuts import render

from django.shortcuts import get_object_or_404


from django.views.decorators.csrf import csrf_exempt
from registration.models import Workspace, TeamMember, User
from engine.models import Film, Quote,Tag, Color, UserTagOrder, TagQuoteManager, Folder, FolderUserManager

import json
from datetime import datetime

from random import choice

def if_allow_access_tag_user(tag_id, user_id):
    tag = Tag.objects.get(id=tag_id)
    if str(tag.created_by.id) != str(user_id):
        team_member = tag.workspace.team_members.filter(member=user_id).first()
        if team_member.role != "teacher":
            return False
    return tag

def if_allow_access_workspace_user(workspace_id, user_id):
    team_member = TeamMember.objects.get(member_id=user_id,belong_workspace_id=workspace_id)
    if team_member.role != "teacher":
        return False
    return True

def get_film_vimeo_id(request):
    if request.method == 'POST':
        try:
            # 解析请求数据
            data = json.loads(request.body)
            film_id = data.get('film_id')
            vimeo_id = Film.objects.get(id=film_id).vimeo_id
            return JsonResponse({'success': True,
                                 'vimeo_id': vimeo_id,})
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)

def get_dialogs(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            quote_id = data.get('quote_id')
            number_of_quotes = data.get('number_of_quotes')
            forward = bool(data.get('forward'))

            print(quote_id, number_of_quotes, forward)

            belonging_film = Quote.objects.get(id=quote_id).film_name
            quotes_list = []

            for index in range(1,int(number_of_quotes)+1):
                if forward:
                    new_quote_id = int(quote_id) + index
                else:
                    new_quote_id = int(quote_id) - index
                current_quote = Quote.objects.filter(id=str(new_quote_id))
                if not(current_quote.exists()):
                    break
                current_quote = current_quote[0]
                if current_quote.film_name != belonging_film:
                    break
                quotes_list.append({
                    'id': current_quote.id,
                    'start_time': current_quote.start_time,
                    'end_time': current_quote.end_time,
                    'text': current_quote.text,
                })
            if not forward:
                quotes_list.reverse()
            return JsonResponse({'success': True,'dialogs': quotes_list})
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    return JsonResponse({'message': 'Invalid method'}, status=405)


def get_stander_quote_card(request):
    return render(request, 'public/quote/stander_quote_card.html')
def get_popup_quote_card(request):
    return render(request, 'public/quote/popup_quote_card.html')
def get_mini_quote_card(request):
    return render(request, 'public/quote/mini_quote_card.html')

def user_marks(request):
    if request.method == 'POST':
        try:
            # 获取请求体中的数据
            data = json.loads(request.body)
            category = data.get('category')
            user_id = data.get('user_id')
            if not category or not user_id:
                return JsonResponse({'message': 'Missing category or user_id'}, status=400)

            # 根据 user_id 获取用户对象
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User not found'}, status=404)

            # 分类处理
            if category == 'film':
                followed_films = user.followed_films.all()  # 获取用户关注的电影
                film_list = [{
                    "film_id": film.id,
                    "display_name": film.display_name,
                } for film in followed_films]
                return JsonResponse(film_list, safe=False)

            elif category == 'quote':
                followed_quotes = user.followed_quotes.all()  # 获取用户关注的引用
                quote_list = [{
                    "id": quote.id,
                    "film_name": quote.film_name,
                    "number": quote.number,
                    "start_time": quote.start_time,
                    "end_time": quote.end_time,
                    "text": quote.text,
                    "tags": [tag.display_name for tag in quote.tags.all()]
                } for quote in followed_quotes]
                return JsonResponse(quote_list, safe=False)
            else:
                return JsonResponse({'message': 'Invalid category'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def add_marker(request):
    if request.method == 'POST':
        try:
            # 解析请求数据
            data = json.loads(request.body)
            category = data.get('category')
            user_id = data.get('user_id')
            target_id = data.get('target_id')
            # 参数校验
            if not category or not user_id or not target_id:
                return JsonResponse({'message': 'Missing category, user_id, or target_id'}, status=400)

            # 获取用户对象
            user = User.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)
            if category == 'film':
                # 获取电影对象
                film = Film.objects.filter(id=target_id).first()
                if not film:
                    return JsonResponse({'message': 'Film not found'}, status=404)

                # 检查是否已经关注
                if not user.followed_films.filter(id=film.id).exists():
                    user.followed_films.add(film)
                    return JsonResponse({'message': 'Film added to markers'})

            elif category == 'quote':
                # 获取引用对象
                quote = Quote.objects.filter(id=target_id).first()
                if not quote:
                    return JsonResponse({'message': 'Quote not found'}, status=404)

                # 检查是否已经关注
                if not user.followed_quotes.filter(id=quote.id).exists():
                    user.followed_quotes.add(quote)
                    return JsonResponse({'message': 'Quote added to markers'})

            # 如果已经关注，返回提示信息
            return JsonResponse({'message': 'Already marked'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def remove_marker(request):
    if request.method == 'DELETE':
        try:
            # 解析请求数据
            data = json.loads(request.body)
            category = data.get('category')
            user_id = data.get('user_id')
            target_id = data.get('target_id')
            # 参数校验
            if not category or not user_id or not target_id:
                return JsonResponse({'message': 'Missing category, user_id, or target_id'}, status=400)

            # 获取用户对象
            user = User.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)

            if category == 'film':
                # 获取电影对象并检查是否已关注
                film = Film.objects.filter(id=target_id).first()
                if not film:
                    return JsonResponse({'message': 'Film not found'}, status=404)

                if user.followed_films.filter(id=film.id).exists():
                    user.followed_films.remove(film)
                    return JsonResponse({'message': 'Film removed from markers'})

            elif category == 'quote':
                # 获取引用对象并检查是否已关注
                quote = Quote.objects.filter(id=target_id).first()
                if not quote:
                    return JsonResponse({'message': 'Quote not found'}, status=404)

                if user.followed_quotes.filter(id=quote.id).exists():
                    user.followed_quotes.remove(quote)
                    return JsonResponse({'message': 'Quote removed from markers'})

            return JsonResponse({'message': 'Not found in markers'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def check_marker(request):
    if request.method == 'POST':
        try:
            # 解析请求数据
            data = json.loads(request.body)
            category = data.get('category')
            user_id = data.get('user_id')
            target_id = data.get('target_id')
            # 参数校验
            if not category or not user_id or not target_id:
                return JsonResponse({'message': 'Missing category, user_id, or target_id'}, status=400)

            # 获取用户对象
            user = User.objects.filter(id=user_id).first()

            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)

            if category == 'film':
                # 检查用户是否关注该电影
                is_following = user.followed_films.filter(id=target_id).exists()
                return JsonResponse({"exist": is_following})

            elif category == 'quote':
                # 检查用户是否关注该引用
                is_following = user.followed_quotes.filter(id=target_id).exists()
                return JsonResponse({'exist': is_following})

            else:
                return JsonResponse({'message': 'Invalid category'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def get_marker(request):
    if request.method == 'POST':
        try:
            # 解析请求体
            data = json.loads(request.body)
            category = data.get('category')
            target_id = data.get('target_id')

            # 检查参数有效性
            if not category or not target_id:
                return JsonResponse({'message': 'Missing category or target_id'}, status=400)

            # 根据类别处理请求
            if category == 'film':
                film = Film.objects.filter(id=target_id).first()
                if film:
                    film_dict = {
                        "film_id": film.id,
                        "display_name": film.display_name,
                        "author": film.author,
                        "year_levels": film.year_levels,
                        "vimeo_id": film.vimeo_id,
                        "image_link": film.image_link,
                        "type": film.type,
                    }
                    return JsonResponse({'exist': True, 'marker': film_dict})
                return JsonResponse({'exist': False})

            elif category == 'quote':
                quote = Quote.objects.filter(id=target_id).first()
                if quote:
                    quote_dict = {
                        "id": quote.id,
                        "film_name": quote.film_name,
                        "number": quote.number,
                        "start_time": quote.start_time,
                        "end_time": quote.end_time,
                        "text": quote.text,
                        "tags": [tag.display_name for tag in quote.tags.all()],  # 提取标签名字列表
                    }
                    return JsonResponse({'exist': True, 'marker': quote_dict})
                return JsonResponse({'exist': False})

            else:
                return JsonResponse({'message': 'Invalid category'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def get_all_markers(request):
    if request.method == 'POST':
        try:
            # 解析请求数据
            data = json.loads(request.body)
            category = data.get('category')

            # 检查 category 参数
            if not category:
                return JsonResponse({'message': 'Category is required'}, status=400)

            # 根据类别获取所有标记的 ID
            if category == 'film':
                id_list = Film.objects.values_list('id', flat=True)
            elif category == 'quote':
                id_list = Quote.objects.values_list('id', flat=True)
            else:
                return JsonResponse({'message': 'Invalid category'}, status=400)

            # 返回结果
            return JsonResponse({'exist': True, 'id_list': list(id_list)})

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)


def get_user_own_tags(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        quote_id = data.get("quote_id")
        sort_type = data.get("sort_type",'default')
        film = ''
        if quote_id:
            quote = Quote.objects.filter(id=quote_id).first()
            film_name = quote.film_name
            film = Film.objects.filter(film_name=film_name).first()
        user = User.objects.filter(id=user_id).first()
        if not user:
            return JsonResponse({'message': 'User not found'}, status=404)

        # 获取用户相关的工作区
        workspaces = Workspace.objects.filter(team_members__member=user).distinct()

        # 获取用户在各工作区中的标签排序
        user_tag_orders = UserTagOrder.objects.filter(user=user).values('tag', 'order', 'create_at')
        if sort_type == 'create_at':
            # 如果是通过创建时间排序
            user_tag_orders_sorted_by_time = user_tag_orders.order_by('create_at')  # 按 create_time 排序

            # 将排序后的标签和顺序映射到字典
            tag_order_dict = {order['tag']: order['order'] for order in user_tag_orders_sorted_by_time}
        else:
            # 默认排序，按 'order' 字段
            tag_order_dict = {order['tag']: order['order'] for order in user_tag_orders}

        # 获取所有标签并预加载相关字段
        if film:
            tags = Tag.objects.filter(created_by=user,related_film=film).select_related('color', 'related_film', 'workspace')
        else:
            tags = Tag.objects.filter(created_by=user).select_related('color', 'related_film', 'workspace')
        # 构建结果，按工作区分类
        result = []
        print(bool(if_allow_access_workspace_user(workspaces[0].id, user.id)))
        workspace_map = {workspace.id: {
            "workspace_id": workspace.id,
            "workspace_name": workspace.name,
            "editable": bool(if_allow_access_workspace_user(workspace.id, user.id)),
            "tags": []
        } for workspace in workspaces}

        # 添加独立标签的分类
        workspace_map[None] = {
            "workspace_id": None,
            "workspace_name": "Individual",
            "editable": True,
            "tags": []
        }

        # 分类标签
        for tag in tags:
            workspace_id = tag.workspace.id if tag.workspace else None
            workspace_map[workspace_id]["tags"].append({
                "id": tag.id,
                "color_id":tag.color.id,
                "color": tag.color.color_code if tag.color else None,
                "created_at": tag.created_at,
                "display_name": tag.display_name,
                "related_film": tag.related_film.film_name if tag.related_film else None,
            })

        # 对每个工作区的标签按排序字段进行排序
        for workspace_id, workspace_data in workspace_map.items():
            workspace_data["tags"].sort(
                key=lambda tag: tag_order_dict.get(tag["id"], float('inf'))
            )
            result.append(workspace_data)
        print(result)
        return JsonResponse(result, safe=False, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)
def bind_tag(request):
    if request.method == 'POST':
        try:
            # 解析请求体
            data = json.loads(request.body)
            tag_id = data.get('tag_id')
            quote_id = data.get('quote_id')

            # 检测字段完整性
            if not all([tag_id, quote_id]):
                return JsonResponse({'message': 'Missing required fields', 'state': False}, status=400)

            # 检查 quote 是否存在
            quote = get_object_or_404(Quote, id=quote_id)

            # 检查 tag 是否存在（按 ID 匹配）
            tag = get_object_or_404(Tag, id=tag_id)

            # 检查 tag 和 quote 是否属于同一个电影（如果有该需求）
            if tag.related_film.film_name != quote.film_name:
                return JsonResponse({'message': 'Tag and Quote belong to different films', 'state': False}, status=400)

            # 检查 TagQuoteManager 是否已经存在该记录（避免重复绑定）
            if TagQuoteManager.objects.filter(tag=tag, quote=quote).exists():
                return JsonResponse({'message': 'Tag is already associated with the Quote', 'state': False}, status=400)

            # 通过 TagQuoteManager 绑定 tag 到 quote
            TagQuoteManager.objects.create(tag=tag, quote=quote)

            return JsonResponse({'message': 'Tag successfully associated with the Quote', 'state': True}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON', 'state': False}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}', 'state': False}, status=500)

    return JsonResponse({'message': 'Invalid method', 'state': False}, status=405)
def unbind_tag(request):
    if request.method == 'POST':
        try:
            # 解析请求体
            data = json.loads(request.body)
            tag_id = data.get('tag_id')
            quote_id = data.get('quote_id')

            # 检测字段完整性
            if not all([tag_id, quote_id]):
                return JsonResponse({'message': 'Missing required fields', 'state': False}, status=400)

            # 检查 quote 是否存在
            quote = get_object_or_404(Quote, id=quote_id)

            # 检查 tag 是否存在（按 ID 匹配）
            tag = get_object_or_404(Tag, id=tag_id)

            # 检查 quote 和 tag 是否属于同一个电影
            if tag.related_film.film_name != quote.film_name:
                return JsonResponse({'message': 'Tag and Quote belong to different films', 'state': False}, status=400)

            # 检查 TagQuoteManager 是否有该绑定记录
            tag_quote = TagQuoteManager.objects.filter(quote=quote, tag=tag).first()
            if not tag_quote:
                return JsonResponse({'message': 'Tag is not associated with the Quote', 'state': False}, status=400)

            # 移除绑定
            tag_quote.delete()
            return JsonResponse({'message': 'Tag unbinded successfully', 'state': True}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON', 'state': False}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}', 'state': False}, status=500)

    return JsonResponse({'message': 'Invalid method', 'state': False}, status=405)
def create_tag(request):
    """
    创建一个新的 Tag
    """
    if request.method == 'POST':
        try:
            # 解析请求体
            data = json.loads(request.body)
            display_name = data.get('display_name')
            workspace_id = data.get('workspace_id')
            related_film_id = data.get('related_film_id')  # 可选字段
            user_id = data.get("user_id")
            color_id = data.get('color_id','')

            workspace_id = workspace_id if workspace_id != '/' else ''

            if not color_id:
                colors = Color.objects.filter(created_by=None)
                color = choice(colors)
            else:
                color = Color.objects.get(id=color_id)
            # 检查参数
            if not display_name:
                return JsonResponse({'message': 'Tag name and display name are required'}, status=400)

            # 获取当前用户
            user = User.objects.filter(id=user_id).first()
            if not user:
                return JsonResponse({'message': 'User not found'}, status=404)
            workspace = None
            # 如果指定了 Workspace，则检查权限
            if workspace_id:
                workspace = Workspace.objects.filter(id=workspace_id).first()
                if not workspace:
                    return JsonResponse({'message': 'Workspace not found'}, status=404)

                # 检查用户是否是该 Workspace 的 teacher
                print('user',user)
                print('workspace',workspace)
                team_member = TeamMember.objects.filter(member=user, belong_workspace=workspace).first()
                print('aa')
                if not team_member or team_member.role != 'teacher':
                    return JsonResponse({'message': 'You do not have permission to create a tag in this workspace'}, status=403)

            if related_film_id:
                print('bb')
                related_film = Film.objects.filter(id=related_film_id).first()
            else:
                return JsonResponse({'message': 'No film been found'}, status=403)
            # 创建新的 Tag
            new_tag = Tag.objects.create(
                display_name=display_name,
                created_by=user,
                workspace=workspace,
                related_film=related_film,
                created_at=datetime.now(),
                color=color,
            )
            print('new_tag',new_tag)
            return JsonResponse({
                'message': 'Tag created successfully',
                'tag': {
                    'id': new_tag.id,
                    'display_name': new_tag.display_name,
                    'workspace': new_tag.workspace.name if new_tag.workspace else None,
                    'related_film': new_tag.related_film.film_name if new_tag.related_film else None,
                    'created_at': new_tag.created_at,
                    'color': new_tag.color.color_code,
                    'color_id': new_tag.color.id,
                    'editable': True,
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def delete_tag(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tag_id = data.get('tag_id')
            user_id = data.get('user_id')
            print(tag_id,user_id)
            tag = if_allow_access_tag_user(tag_id, user_id)
            print('tag',tag)
            if not tag:
                return JsonResponse({'message': 'Tag is not associated with the User', 'state': False}, status=400)
            Tag.objects.filter(id=tag_id).delete()
            return JsonResponse({'message': 'Tag successfully rename successfully', 'state': True}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    return JsonResponse({'message': 'Invalid method'}, status=405)

def rename_tag(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tag_id = data.get('tag_id')
            user_id = data.get('user_id')
            new_name = data.get('new_name')
            tag = if_allow_access_tag_user(tag_id, user_id)
            if not tag:
                return JsonResponse({'message': 'Tag is not associated with the User', 'state': False}, status=400)
            tag.display_name = new_name
            tag.save()
            return JsonResponse({'message': 'Tag successfully rename successfully', 'state': True}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    return JsonResponse({'message': 'Invalid method'}, status=405)


def quote_tags(request):
    if request.method == 'POST':
        try:
            # 解析请求参数
            data = json.loads(request.body)
            user_id = data.get('user_id')
            quote_id = data.get('quote_id')
            print(user_id, quote_id)
            sort_type = data.get('sort_type', "default")

            # 检测字段完整性
            if not all([user_id, quote_id]):
                return JsonResponse({'message': 'Missing required fields'}, status=400)

            # 检查用户是否存在
            user = get_object_or_404(User, id=user_id)

            # 获取与指定 quote 关联的标签，使用中间模型 TagQuoteManager
            tags_in_quote = TagQuoteManager.objects.filter(quote_id=quote_id)

            # 筛选满足条件的标签
            eligible_tags_A = tags_in_quote.filter(
                # 条件 1: Tag 是由当前用户创建
                tag__created_by=user
            )
            eligible_tags_B = tags_in_quote.filter(
                # 条件 2: Tag 的 workspace 包含该用户
                tag__workspace__team_members__member=user
            )
            # 合并两个查询集并去重
            eligible_tags = eligible_tags_A | eligible_tags_B
            eligible_tags = eligible_tags.distinct()
            # 构建返回数据
            tag_list = [
                {
                    "id": tag.tag.id,
                    "display_name": tag.tag.display_name,
                    "created_at": tag.create_at,  # 使用 create_time 函数获取时间
                    "color": tag.tag.color.color_code,
                    "editable": True if tag.tag.created_by == user else False,
                }
                for tag in eligible_tags
            ]
            # 按创建时间和可编辑性进行排序
            tag_list.sort(key=lambda tag: tag['created_at'] or '')  # 先按时间排序
            tag_list.sort(key=lambda tag: tag['editable'])  # 再按可编辑性排序
            # 返回标签数据
            return JsonResponse({'tags': tag_list}, status=200)

        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def update_user_tag_order(request):
    if request.method == 'POST':
        try:
            # 获取请求中的数据
            data = json.loads(request.body)
            user_id = data.get('user_id')
            workspace_id = data.get('workspace_id')
            ordered_tags = data.get('ordered_tags')
            print(user_id, workspace_id, ordered_tags)
            # 获取用户和工作区
            user = User.objects.get(id=user_id)
            if workspace_id != 'null':
                workspace = Workspace.objects.get(id=workspace_id)
                tags = Tag.objects.filter(workspace=workspace,created_by__id=user_id)
            else:
                tags = Tag.objects.filter(created_by__id=user_id)
            # 检查传入的标签顺序是否有效
            valid_tags = [tag.id for tag in tags]

            ordered_tag_ids = [int(tag_id) for tag_id in ordered_tags]

            if not all(tag_id in valid_tags for tag_id in ordered_tag_ids):
                return JsonResponse({"error": "标签顺序无效"}, status=400)

            # 更新标签的顺序
            for index, tag_id in enumerate(ordered_tag_ids):
                # 查找对应的标签
                if workspace_id != 'null':
                    tag = Tag.objects.get(id=tag_id, workspace=workspace)
                else:
                    tag = Tag.objects.get(id=tag_id)
                # 更新 UserTagOrder 中的顺序
                user_tag_order, created = UserTagOrder.objects.get_or_create(user=user, tag=tag)
                user_tag_order.order = index
                user_tag_order.save()

            # 返回成功响应
            return JsonResponse({"message": "标签顺序已更新"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "只支持 POST 请求"}, status=405)


def get_colors(request):
    if request.method == 'POST':
        try:
            # 获取请求中的数据
            data = json.loads(request.body)
            user_id = data.get('user_id')

            user = User.objects.get(id=user_id)
            colors = Color.objects.all()

            # 筛选满足条件的 tags
            eligible_color_A = colors.filter(
                # 条件 1: Tag 是由当前用户创建
                created_by=user
            )
            eligible_color_B = colors.filter(
                created_by=None
            )
            # 构建返回数据
            color_list = {"default":[],"user":[]}
            for color in eligible_color_B:
                color_list["default"].append({
                    'id': color.id,
                    'color_code': color.color_code,
                    'color_name': color.name,
                })
            for color in eligible_color_A:
                color_list["user"].append({
                    'id': color.id,
                    'color_code': color.color_code,
                    'color_name': color.name,
                })
            return JsonResponse({'colorList': color_list}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)
def change_color(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            tag_id = data.get('tag_id')
            color_id = data.get('color_id')
            color = Color.objects.get(id=color_id)
            tag = if_allow_access_tag_user(tag_id,user_id)
            if not tag:
                return JsonResponse({'message': 'Tag is not associated with the User', 'state': False}, status=400)
            tag.color = color
            tag.save()
            return JsonResponse({'state': True}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)

def change_search_film(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            film_id = data.get('film_id')
            film = Film.objects.filter(id=film_id).first()
            if not film:
                return JsonResponse({'message': 'Film is not associated with the User', 'state': False}, status=400)
            if not film.followers.filter(id=user_id).exists():
                return JsonResponse({'message': 'Film is not associated with the User', 'state': False}, status=400)
            request.session['searching_film_id'] = film_id
            return JsonResponse({'state': True}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid method'}, status=405)


def create_folder(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            related_film_id = data.get('film_id')
            folder_name = data.get('folder_name')
            description = data.get('description')
            related_film = Film.objects.get(id=related_film_id)
            user = User.objects.get(id=user_id)
            new_folder = Folder.objects.create(
                name=folder_name,
                description=description,
                related_film=related_film,
                user=user,
            )
            new_folder.save()
            return JsonResponse({'state': True}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}','state':False}, status=500)
    return JsonResponse({'message': 'Invalid method'}, status=405)
def get_folders(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            related_film_id = data.get('film_id')
            mode = data.get('mode')
            folders = Folder.objects.filter(user_id=user_id)
            print(folders)
            return JsonResponse({'state': True}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}','state':False}, status=500)
    return JsonResponse({'message': 'Invalid method'}, status=405)




def test_api(request):
    return render(request, 'test_api.html')
def test_tag(request):
    return render(request, 'test_tag.html')
def test_gragging(request):
    return render(request,'test_gragging_list.html')

def test_video(request):
    return render(request,'test_video.html')