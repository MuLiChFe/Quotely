import { getUserMarkers, getMarker, addMarker, removeMarker, getAllMarker } from "/static/js/api/mark_api.js";

// 初始化收藏按钮
async function initFavoriteButton(userId, quoteId, favoriteQuotes) {
    const favoriteButton = document.querySelector(`#favorite-btn-${quoteId}`);

    // 判断当前 quote 是否已经被收藏
    const isFavorite = favoriteQuotes.includes(quoteId); // 如果 quoteId 在收藏列表中，表示已收藏
    updateFavoriteButtonState(favoriteButton, isFavorite);

    // 绑定点击事件
    favoriteButton.addEventListener("click", async () => {
        const currentState = favoriteButton.classList.contains("favorited");
        const success = currentState
            ? await removeMarker("quote", userId, quoteId)
            : await addMarker("quote", userId, quoteId);

        if (success) {
            updateFavoriteButtonState(favoriteButton, !currentState);
        }
    });
}

// 更新收藏按钮的状态
function updateFavoriteButtonState(button, isFavorite) {
    if (isFavorite) {
        button.classList.add("favorited");
        button.innerText = "Unfavorite";
    } else {
        button.classList.remove("favorited");
        button.innerText = "Favorite";
    }
}

// 获取用户的所有收藏记录
async function getUserFavoriteQuotes(userId) {
    console.log('getUserFavoriteQuotes')
    try {
        console.log('getUserFavoriteQuotes')
        const markers = await getUserMarkers("quote", userId);
        console.log('markers',markers);
        return markers['quote_id']; // 假设返回的是一个包含所有收藏 quoteId 的数组
    } catch (error) {
        console.error("Failed to fetch user markers:", error);
        return []; // 返回空数组表示没有收藏
    }
}

// 获取单条 quote 的 API 请求
async function fetchQuoteById(userId, quoteId) {
    try {
        const response = await getMarker("quote", userId, quoteId);

        if (!response['exist']) {
            throw new Error(`Failed to fetch quote with ID ${quoteId}`);
        }

        return await response['marker'];
    } catch (error) {
        console.error(error);
        return null;
    }
}

// 页面加载时初始化卡片内容
async function loadQuotes(userId, favoriteQuotes) {
    const miniCard = document.querySelector('.info-card.mini');
    const standardCard = document.querySelector('.info-card.standard');

    // 获取 Mini 卡片数据
    const miniQuoteId = miniCard.getAttribute('data-quote-id');
    const miniQuoteData = await fetchQuoteById(userId, miniQuoteId);
    if (miniQuoteData) {
        document.getElementById(`mini-info-text-${miniQuoteId}`).innerText = miniQuoteData.text;
    }

    // 获取 Standard 卡片数据
    const standardQuoteId = standardCard.getAttribute('data-quote-id');
    const standardQuoteData = await fetchQuoteById(userId, standardQuoteId);
    if (standardQuoteData) {
        document.getElementById(`standard-title-${standardQuoteId}`).innerText = `Quote by ${standardQuoteData.author}`;
        document.getElementById(`standard-text-${standardQuoteId}`).innerText = standardQuoteData.text;
        standardCard.classList.remove('d-none');
    }

    // 初始化所有收藏按钮
    const quotes = document.querySelectorAll(".info-card");
    quotes.forEach(card => {
        const quoteId = card.getAttribute("data-quote-id");
        initFavoriteButton(userId, quoteId, favoriteQuotes);
    });
}

// 显示 Modal 内容
async function showModal(userId, quoteId) {
    const data = await fetchQuoteById(userId, quoteId);
    if (data) {
        document.getElementById("quoteModalLabel").innerText = data.movie || 'Unknown Movie';
        document.getElementById("modalQuoteAuthor").innerText = data.author || 'Unknown Author';
        document.getElementById("modalQuoteText").innerText = data.text || 'No Content';

        const modal = new bootstrap.Modal(document.getElementById('quoteModal'));
        modal.show();
    }
}

// 为卡片按钮绑定事件
function bindCardEvents(userId) {
    document.querySelectorAll('.info-card').forEach(card => {
        card.querySelector('button').addEventListener('click', () => {
            const quoteId = card.getAttribute('data-quote-id');
            showModal(userId, quoteId);
        });
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('start')
    const userId = 1; // 示例：从后端获取用户 ID

    // 获取用户的所有收藏记录
    const favoriteQuotes = await getUserFavoriteQuotes(userId);

    // 加载并展示 quote 数据
    await loadQuotes(userId, favoriteQuotes);
    bindCardEvents(userId);
});
