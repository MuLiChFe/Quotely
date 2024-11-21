// 获取当前页面的域名和协议
const baseUrl = window.location.origin;

// 获取 CSRF Token
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');

// 查看用户已关注的所有电影
export function getUserMarkers(category, userId) {
    return fetch(`${baseUrl}/api/user_marks/`, {
        method: "POST",  // 改为 POST 请求
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 CSRF token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": userId,  // 将 user_id 放在 body 中
        }),
    })
    .then(response => response.json())
    .then(data => {
        // 返回电影列表数据
        return data;
    })
    .catch(error => console.error("Error:", error));
}

// 关注新电影
export function addMarker(category, userId, filmId) {
    return fetch(`${baseUrl}/api/add_marker/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": userId,
            "film_id": filmId,
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}

// 取消关注电影
export function removeMarker(category, userId, filmId) {
    return fetch(`${baseUrl}/api/remove_marker/`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": userId,
            "film_id": filmId,
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}

// 检查电影是否已添加
export function checkMarker(category, userId, filmId) {
    return fetch(`${baseUrl}/api/check_marker/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": userId,
            "film_id": filmId,
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}
