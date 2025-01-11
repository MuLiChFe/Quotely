import {fetchApi, } from "/static/js/api/tools.js";

// 查看用户已关注的所有电影
export function changeSearchFilm(userId,filmId) {
    return fetchApi(
        'api/change_search_film/',
        "POST",
        {
            "user_id": String(userId),
            "film_id": String(filmId),
        }
    )
}
