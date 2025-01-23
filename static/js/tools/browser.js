// 禁止滚动，并固定页面宽度
export function disableScroll() {
    // 获取当前页面的宽度
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // 禁用滚动
    document.body.style.overflow = 'hidden';
    // 防止页面宽度变化
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    // // 禁用滚动事件
    // window.addEventListener('wheel', preventDefault, { passive: false });
    // window.addEventListener('touchmove', preventDefault, { passive: false });
}

function preventDefault(event) {
    event.preventDefault();
}

// 恢复滚动并恢复页面宽度
export function enableScroll() {
    // 恢复滚动
    document.body.style.overflow = 'auto';
    // 恢复页面宽度
    document.body.style.paddingRight = '0';

    // 解除事件监听
    window.removeEventListener('wheel', preventDefault);
    window.removeEventListener('touchmove', preventDefault);
}
