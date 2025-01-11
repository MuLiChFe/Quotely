// 获取当前页面的域名和协议
const baseUrl = window.location.origin;

// 获取 CSRF Token
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');

export function fetchApi(path, method, body) {
    console.log('fetchApi')
    console.log(`${baseUrl}/${path}`)
    console.log(body)
    return fetch(`${baseUrl}/${path}`, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken.value,
        },
        body: JSON.stringify(body),
    })
    .then(response => response.json())
    .then(data => {
        // 返回电影列表数据
        return data;
    })
    .catch(error => console.error("Error:", error));
}
