import { getUserMarkers, addMarker, removeMarker, } from "/static/js/api/mark_api.js";
import { loadTagButtons } from '/static/js/public/tag/tag-display.js'
import { showTagPopup } from './popup-display.js'
import { vimeoVideo } from "../vimeo/vimeo-display.js";
import { hmsToSec } from "../../tools/convert.js";
import { getDialogs, getVimeoId } from "../../api/film_api.js";
import { enableScroll, disableScroll } from "../../tools/browser.js";

let favoriteQuotes = []

export async function addDialogs(quoteId, numberOfQuotes, forward) {
    const body = document.getElementById('dialog-body');
    console.log('body', body);
    if (!body) {
        return false;
    }
    console.log('quoteId', quoteId);

    // 处理初始quoteId
    if (quoteId === '0') {
        let currentDialogs = document.querySelectorAll('.dialog');
        console.log('currentDialogs', currentDialogs);
        if (forward) {
            console.log(currentDialogs[currentDialogs.length - 1]);
            quoteId = currentDialogs[currentDialogs.length - 1].getAttribute('dialog-id');
        } else {
            quoteId = currentDialogs[0].getAttribute('dialog-id');
        }
        quoteId = `${quoteId}`;
    }

    // 获取对话框数据
    const dialogs_dict = await getDialogs(quoteId, numberOfQuotes, forward);
    console.log('dialogs', dialogs_dict);
    const new_dialogs = document.createElement('div');

    // 创建对话框
    for (let dialog of dialogs_dict.dialogs) {
        const dialogFrame = document.createElement('div');
        dialogFrame.setAttribute("dialog-id", dialog.id);
        dialogFrame.classList.add('dialog');
        dialogFrame.innerText = dialog.text;
        new_dialogs.appendChild(dialogFrame);
    }
    const newDialogsHeight = new_dialogs.offsetHeight;
    // 插入对话框内容
    if (forward) {
        body.appendChild(new_dialogs);
    } else {
        // 向后添加内容时，恢复滚动条位置
        body.insertBefore(new_dialogs, body.firstChild);
    }

    // 使用事件委托将事件绑定到 body 上
    body.addEventListener('click', async (event) => {
        const dialogElement = event.target.closest('.dialog');
        if (dialogElement) {
            // 只有点击到 .dialog 元素时才触发
            const dialogId = dialogElement.getAttribute('dialog-id');
            console.log(`Dialog clicked with ID: ${dialogId}`);
            await selectDialogs(dialogId);
        }
    });
    return newDialogsHeight
}

export async function selectDialogs(quoteId) {
    console.log("select dialog",quoteId)
    const selectedDialog = document.querySelectorAll('.dialog.select')
    selectedDialog.forEach(dialog =>{
        dialog.classList.remove('select')
    })
    const targetDialog = document.querySelectorAll(`[dialog-id='${quoteId}']`)
    targetDialog.forEach(dialog =>{
        dialog.classList.add('select')
    })
}

export async function loadQuoteCardTemplate(templateText,quote) {
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
    // 获取按钮元素并初始化
    const favoriteButton = clone.querySelector(`[data-quote-id='${quote.id}']`);
    initFavoriteButton(userId, favoriteButton);
    // 在这里将获取的tag 绑定到卡片上去
    const tagFrame = clone.querySelector('.tags')
    loadTagButtons(userId,quote.id,tagFrame)

    const popup = clone.querySelector('.quote-popup-btn')
    if (popup) {
        popup.addEventListener('click', () => {
            showTagPopup(quote,templateText)
        });
    }

    const film = clone.querySelector('.film-video')
    if (film) {
        const vimeoId = await getVimeoId(filmId);
        console.log('vimeoId',vimeoId)
        const video = vimeoVideo(vimeoId.vimeo_id,hmsToSec(quote.start_time))
        film.innerHTML = video;
    }

    const dialogContainer = clone.querySelector('.dialog-container')
    if ( dialogContainer ) {
        const dialogFrame = document.createElement('div');
        dialogFrame.style.position = 'relative';
        dialogFrame.style.top = '0';
        dialogContainer.appendChild(dialogFrame);

        const loadMoreBefore = clone.getElementById('dialog-load-before')
        const loadMoreAfter = clone.getElementById('dialog-load-after')
        if (loadMoreBefore) {
            loadMoreBefore.addEventListener("click", async ()=>{
                await addDialogs('0', 7, false)
            })
        }
        if (loadMoreAfter) {
            loadMoreAfter.addEventListener("click", async ()=>{
                await addDialogs('0', 7, true)
            })
        }
    }

    // 返回模板（现在已经填充了数据）
    return clone;
}

// 初始化收藏按钮
export async function initFavoriteButton(userId, buttonElement) {
    let quoteId = buttonElement.getAttribute("data-quote-id"); // 从 data-attribute 获取 quoteId
    // 判断当前 quote 是否已经被收藏
    quoteId = parseInt(quoteId)
    const isFavorite = favoriteQuotes.some(quote => quote.quote_id === quoteId);
    updateFavoriteButtonState(buttonElement, isFavorite);

    // 绑定点击事件到按钮
    buttonElement.addEventListener("click", async () => {
        console.log(quoteId,favoriteQuotes)
        const currentState = buttonElement.classList.contains("favorited");
        let success;
        if (currentState){
            success = await removeMarker("quote", userId, quoteId);
            favoriteQuotes = favoriteQuotes.filter(quote => quote.quote_id !== quoteId);
        } else {
            success = await addMarker("quote", userId, quoteId);
            favoriteQuotes.push({'quote_id':quoteId});
        }
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

// 页面加载时初始化卡片内容
export async function loadQuotes(userId,containerId, quoteList,type) {
    favoriteQuotes = await getUserFavoriteQuotes(userId);
    console.log('favoriteQuotes',favoriteQuotes)
    const quoteContainer = document.getElementById(containerId);

    // 清空容器
    quoteContainer.innerHTML = '';
    const response = await fetch(`/api/get_${type}/`);  // 假设文件在这个路径
    const templateText = await response.text();
    // 遍历 quoteList 渲染每个 quote 卡片
    for (let quote of quoteList) {
        const outsideFrame = document.createElement('div')
        outsideFrame.setAttribute('info-card',quote.id);
        const card = await loadQuoteCardTemplate(templateText,quote); // 加载并填充模板
        outsideFrame.appendChild(card);
        quoteContainer.appendChild(outsideFrame);
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
