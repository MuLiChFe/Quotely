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

export function getVimeoId(filmId) {
    return fetchApi(
        'api/get_film_vimeo_id/',
        "POST",
        {
            "film_id": String(filmId),
        }
    )
}

export function getDialogs(quoteId,numOfQuotes,forward) {
    return fetchApi(
        'api/get_dialogs/',
        "POST",
        {
            "quote_id": String(quoteId),
            "number_of_quotes": String(numOfQuotes),
            "forward": forward,

        }
    )
}
