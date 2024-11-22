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
            "X-CSRFToken": csrfToken.value,
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": String(userId),
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
export function addMarker(category, userId, target_id) {
    console.log(category,userId, target_id);
    return fetch(`${baseUrl}/api/add_marker/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}

// 取消关注电影
export function removeMarker(category, userId, target_id) {
    return fetch(`${baseUrl}/api/remove_marker/`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}

// 检查电影是否已添加
export function checkMarker(category, userId, target_id) {
    return fetch(`${baseUrl}/api/check_marker/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}

export function getMarker(category, userId, target_id) {
    return fetch(`${baseUrl}/api/get_marker/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": String(userId),
            "target_id": target_id,
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}

export function getAllMarker(category, userId) {
    return fetch(`${baseUrl}/api/get_all_markers/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,  // 使用正确的 token
        },
        body: JSON.stringify({
            "category" : category,
            "user_id": String(userId),
        }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error:', error));
}