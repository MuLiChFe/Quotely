import {fetchApi, } from "/static/js/api/tools.js";

export function getColors(userId) {
    return fetchApi(
        'api/get_colors/',
        "POST",
        {
            "user_id": userId,
        }
    )
}

export function changeColor(userId,tagId,colorId) {
    return fetchApi(
        'api/change_color/',
        "POST",
        {
            "user_id":userId,
            "tag_id":tagId,
            "color_id":colorId
        }
    )
}