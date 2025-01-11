import { getUserMarkers, addMarker, removeMarker, } from "/static/js/api/mark_api.js";
import { loadTagButtons } from '/static/js/public/tag/tag-display.js'

function showTagPopup() {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    // 创建弹窗
    const confirmBox = document.createElement('div');
    confirmBox.classList.add('popup-confirm-box');
    confirmBox.style.position = 'absolute';
    confirmBox.style.top = '50%';
    confirmBox.style.left = '50%';
    confirmBox.style.transform = 'translate(-50%, -50%)';
    confirmBox.style.backgroundColor = '#fff';
    confirmBox.style.padding = '20px';
    confirmBox.style.borderRadius = '8px';
    confirmBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    confirmBox.style.zIndex = 1001;
    confirmBox.style.width = '90%';
    confirmBox.style.height = '80%'
    confirmBox.style.textAlign = 'Center';

    // 将遮罩层和弹窗添加到页面中
    document.body.appendChild(overlay);
    document.body.appendChild(confirmBox);

    // 点击遮罩层时关闭弹窗
    overlay.addEventListener('click', () => {
        overlay.remove();
        confirmBox.remove();
    });

    // 阻止点击弹窗内容时事件冒泡
    confirmBox.addEventListener('click', (e) => {
        e.stopPropagation();
    });
        // 监听 ESC 键来关闭弹窗
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            overlay.remove();
            confirmBox.remove();
        }
    });
}

// 初始化收藏按钮
async function initFavoriteButton(userId, buttonElement, favoriteQuotes) {
    const quoteId = buttonElement.getAttribute("data-quote-id"); // 从 data-attribute 获取 quoteId

    // 判断当前 quote 是否已经被收藏
    const isFavorite = favoriteQuotes.some(quote => quote.quote_id === parseInt(quoteId));
    updateFavoriteButtonState(buttonElement, isFavorite);

    // 绑定点击事件到按钮
    buttonElement.addEventListener("click", async () => {
        const currentState = buttonElement.classList.contains("favorited");
        const success = currentState
            ? await removeMarker("quote", userId, quoteId)
            : await addMarker("quote", userId, quoteId);

        if (success) {
            updateFavoriteButtonState(buttonElement, !currentState); // 更新按钮状态
        }
    });
}

// 更新收藏按钮的状态
function updateFavoriteButtonState(buttonElement, isFavorite) {
    const svgElement = buttonElement.querySelector("svg"); // 获取子元素 SVG
    if (isFavorite) {
        svgElement.setAttribute("fill", "#a31c36"); // 更改图标颜色
        buttonElement.classList.add("favorited");  // 添加收藏状态
    } else {
        svgElement.setAttribute("fill", "gray");
        buttonElement.classList.remove("favorited"); // 移除收藏状态
    }
}


async function loadQuoteCardTemplate(templateText,quote) {
    // 获取 quote-card.html 模板

    // 创建一个临时 DOM 来存储模板内容
    const div = document.createElement('div');
    div.innerHTML = templateText;

    // 获取模板并准备插入数据
    const template = div.querySelector('#quote-card-template');
    if (!template) {
        console.error('Template not found!');
        return null;  // 如果模板不存在，返回 null
    }


    const clone = template.content.cloneNode(true);

    // 填充模板内容
    clone.querySelector('.card-title').innerText = quote.text;
    clone.querySelector('.text-muted').innerText = `From ${quote.start_time} to ${quote.end_time}`;
    clone.querySelector('.favorite-btn').setAttribute('data-quote-id', quote.id);

    // 在这里将获取的tag 绑定到卡片上去
    const tagFrame = clone.querySelector('.tags')
    loadTagButtons(userId,quote.id,tagFrame)

    const popup = clone.querySelector('.quote-popup-btn')
    if (popup) {
        popup.addEventListener('click', () => {
            showTagPopup()
        });
    }

    // 返回模板（现在已经填充了数据）
    return clone;
}

// 页面加载时初始化卡片内容
export async function loadQuotes(userId,containerId, favoriteQuotes, quoteList,type) {
    const quoteContainer = document.getElementById(containerId);

    // 清空容器
    quoteContainer.innerHTML = '';
    const response = await fetch(`/api/get_${type}/`);  // 假设文件在这个路径
    const templateText = await response.text();
    // 遍历 quoteList 渲染每个 quote 卡片
    for (let quote of quoteList) {
        const card = await loadQuoteCardTemplate(templateText,quote); // 加载并填充模板
        quoteContainer.appendChild(card);

        // 获取按钮元素并初始化
        const favoriteButton = quoteContainer.querySelector(`[data-quote-id='${quote.id}']`);
        initFavoriteButton(userId, favoriteButton, favoriteQuotes);
    }
}

// 获取用户的所有收藏记录
export async function getUserFavoriteQuotes(userId) {
    try {
        const markers = await getUserMarkers("quote", userId);  // 假设返回的是包含已收藏 quote_id 的数组
        return markers;  // 返回收藏的 quote 数据
    } catch (error) {
        console.error("Failed to fetch user markers:", error);
        return [];  // 如果失败返回空数组
    }
}
