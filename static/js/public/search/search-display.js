import { loadQuotes } from "/static/js/public/quote/quote-display.js";


export async function initSearch(){
    // 加载并展示 quote 数据
    if (quoteList.length < 40) {
            // 获取用户的所有收藏记录
        await loadQuotes(userId,'quote-cards-container', quoteList,'stander_quote_card');
    }
}
// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 从模板获取用户 ID 和 quote 数据
    console.log(quoteList);  // 打印传递的 quoteList
    console.log(userId);     // 打印传递的 userId

    await initSearch()
});
