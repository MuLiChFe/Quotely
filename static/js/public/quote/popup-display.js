import { disableScroll, enableScroll, createPopup } from "../../tools/browser.js";
import { addDialogs, selectDialogs, loadQuoteCardTemplate, initFavoriteButton } from "./quote-display.js"

export async function showTagPopup(quote,originalTemplateText) {
    disableScroll()
    // 创建遮罩层
    const Popup = createPopup('90vw','80vh',true,async () => {
        const originalQuoteFrame = document.querySelector(`[info-card='${quote.id}']`);
        const [card, tagsDict] = await loadQuoteCardTemplate(originalTemplateText, quote); // 加载并填充模板
        originalQuoteFrame.innerHTML = '';
        originalQuoteFrame.appendChild(card);
    })
    const overlay = Popup["overlay"]
    const confirmBox = Popup["popupBody"];

    const response = await fetch(`/api/get_popup_quote_card/`);  // 假设文件在这个路径
    const templateText = await response.text();
    const [popup, tagsDict] = await loadQuoteCardTemplate(templateText, quote);
    console.log('popup',popup)
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

    // 阻止点击弹窗内容时事件冒泡
    confirmBox.addEventListener('click', (e) => {
        const popupContents = document.querySelector('.popup-content')
        if (popupContents) {
            popupContents.forEach(popupContent => {
                popupContent.remove();
            })
        }
    });

}