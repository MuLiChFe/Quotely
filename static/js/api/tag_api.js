// 获取当前页面的域名和协议
const baseUrl = window.location.origin;

// 获取 CSRF Token
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');


// 获取用户所有标签
export function getUserTags(userId) {
    return fetch(`${baseUrl}/api/get_user_tags/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,
        },
        body: JSON.stringify({
            "user_id": String(userId),
        }),
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error('Error:', error));
}

// 添加标签
export function addTag(category, userId, quoteId, tagName) {
    return fetch(`${baseUrl}/api/add_tag/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,
        },
        body: JSON.stringify({
            "category": category,
            "user_id": String(userId),
            "quote_id": String(quoteId),
            "tag_name": tagName,
        }),
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error('Error:', error));
}

// 删除标签
export function removeTag(category, userId, quoteId, tagName) {
    return fetch(`${baseUrl}/api/remove_tag/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,
        },
        body: JSON.stringify({
            "category": category,
            "user_id": String(userId),
            "quote_id": String(quoteId),
            "tag_name": tagName,
        }),
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error('Error:', error));
}

// 通过标签搜索quote
export function searchByTags(tags) {
    return fetch(`${baseUrl}/api/search_by_tags/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,
        },
        body: JSON.stringify({
            "tags": tags,
        }),
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error('Error:', error));
}
