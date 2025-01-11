import {fetchApi, } from "/static/js/api/tools.js";

// 查看用户已关注的所有电影
export function getUserMarkers(category, userId) {
    return fetchApi(
        'api/user_marks/',
        "POST",
        {
            "category": category,
            "user_id": String(userId),
        }
    )
}

// 关注新电影
export function addMarker(category, userId, target_id) {
    return fetchApi(
        'api/add_marker/',
        "POST",
        {
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }
    )
}

// 取消关注电影
export function removeMarker(category, userId, target_id) {
    return fetchApi(
        'api/remove_marker/',
        "DELETE",
        {
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }
    )
}

// 检查电影是否已添加
export function checkMarker(category, userId, target_id) {
    return fetchApi(
        'api/check_marker/',
        "POST",
        {
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }
    )
}


export function getMarker(category, userId, target_id) {
    return fetchApi(
        'api/get_marker/',
        "POST",
        {
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }
    )
}


export function getAllMarker(category, userId) {
    return fetchApi(
        'api/get_all_markers/',
        "POST",
        {
            "category" : category,
            "user_id": String(userId),
        }
    )
}
