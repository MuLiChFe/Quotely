import { disableScroll, enableScroll } from "../../tools/browser.js";
import { addDialogs, selectDialogs, loadQuoteCardTemplate, initFavoriteButton } from "./quote-display.js"

export async function showTagPopup(quote,originalTemplateText) {
    disableScroll()
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay', 'none-event');
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    // 创建弹窗
    const confirmBox = document.createElement('div');
    confirmBox.classList.add('popup-confirm-box');
    confirmBox.style.overflow = 'auto';
    confirmBox.style.position = 'fixed';
    confirmBox.style.top = '50%';
    confirmBox.style.left = '50%';
    confirmBox.style.transform = 'translate(-50%, -50%)';
    confirmBox.style.backgroundColor = '#fff';
    confirmBox.style.padding = '20px';
    confirmBox.style.paddingBottom = '0px';
    confirmBox.style.borderRadius = '8px';
    confirmBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    confirmBox.style.zIndex = 999;
    confirmBox.style.width = '1300px';
    confirmBox.style.height = '640px'
    confirmBox.style.textAlign = 'Center';

    const response = await fetch(`/api/get_popup_quote_card/`);  // 假设文件在这个路径
    const templateText = await response.text();
    const popup = await loadQuoteCardTemplate(templateText, quote)
    await confirmBox.appendChild(popup);
    // 获取按钮元素并初始化
    const favoriteButton = confirmBox.querySelector(`[data-quote-id='${quote.id}']`);
    initFavoriteButton(userId, favoriteButton);
    // 将遮罩层和弹窗添加到页面中
    document.body.appendChild(overlay);
    document.body.appendChild(confirmBox);
    await addDialogs(`${parseInt(quote.id) - 1}`, 11, true)
    await addDialogs(quote.id, 5, false)
    await selectDialogs(quote.id)
    // 点击遮罩层时关闭弹窗
    overlay.addEventListener('click', async () => {
        enableScroll();
        overlay.remove();
        confirmBox.remove();
        const originalQuoteFrame = document.querySelector(`[info-card='${quote.id}']`);
        const card = await loadQuoteCardTemplate(originalTemplateText, quote); // 加载并填充模板
        originalQuoteFrame.innerHTML = '';
        originalQuoteFrame.appendChild(card);
    });

    // 阻止点击弹窗内容时事件冒泡
    confirmBox.addEventListener('click', (e) => {
        const popupContents = document.querySelector('.popup-content')
        if (popupContents) {
            popupContents.forEach(popupContent => {
                popupContent.remove();
            })
        }
    });

    // 监听 ESC 键来关闭弹窗
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            overlay.remove();
            confirmBox.remove();
        }
    });
}