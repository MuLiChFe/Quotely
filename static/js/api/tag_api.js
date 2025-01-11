import {fetchApi, } from "/static/js/api/tools.js";

export function getUserOwnTags(userId,quoteId,sortType) {
    return fetchApi(
        'api/get_user_own_tags/',
        "POST",
        {
            "user_id": String(userId),
            "quote_id": String(quoteId ? quoteId:''),
            "sort_type": sortType ? sortType:'',
        }
    )
}

export function CreatTag(userId, display_name, workspace_id, related_film_id,color_id) {
    return fetchApi(
        'api/create_tag/',
        "POST",
        {
            "user_id": String(userId),
            "display_name":display_name,
            "workspace_id": workspace_id ? workspace_id : "",
            "related_film_id": related_film_id,
            "color_id":color_id,
        }
    )
}

export function QuoteTags(userId, quoteId,sortType) {
    return fetchApi(
        'api/quote_tags/',
        "POST",
        {
            "user_id": String(userId),
            "quote_id":String(quoteId),
            "sort_type":sortType ?sortType:"",
        }
    )
}

export function RenameTag(userId, tagId, newName){
    return fetchApi(
        'api/rename_tag/',
        "POST",
        {
            "user_id":userId,
            "tag_id":tagId,
            "new_name":newName,
        }
    )

}

export function BindTag(userId, tagId, quoteId) {
    return fetchApi(
        'api/bind_tag/',
        "POST",
        {
            "user_id": String(userId),
            "tag_id": String(tagId),
            "quote_id":String(quoteId),
        }
    )
}

export function unBindTag(userId, tagId, quoteId){
    return fetchApi(
        'api/unbind_tag/',
        "POST",
        {
            "user_id": String(userId),
            "tag_id": String(tagId),
            "quote_id":String(quoteId),
        }
    )
}
export function UpdateUerTagOrder(userId, workspaceId, ordered_tags) {
    return fetchApi(
        'api/update_user_tag_order/', // 假设 API 路径是这个，可以根据实际后端路径修改
        "POST",
        {
            "user_id": String(userId),
            "workspace_id": String(workspaceId),
            "ordered_tags": ordered_tags, // 假设 ordered_tags 是一个数组
        }
    );
}

export function DeleteTag(userId,tagId){
    return fetchApi(
        'api/delete_tag/',
        "POST",
        {
            "user_id": String(userId),
            "tag_id": String(tagId),
        }
    )
}