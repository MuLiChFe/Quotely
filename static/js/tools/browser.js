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

export function createPopup(width,height,disable_background,closeFunctions) {
    disableScroll()
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    if (disable_background){
        overlay.classList.add('none-event');
    }
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
    // 创建弹窗
    const popupBody = document.createElement('div');
    popupBody.classList.add('popup-confirm-box');
    popupBody.style.overflow = 'auto';
    popupBody.style.position = 'fixed';
    popupBody.style.top = '50%';
    popupBody.style.left = '50%';
    popupBody.style.transform = 'translate(-50%, -50%)';
    popupBody.style.backgroundColor = '#fff';
    popupBody.style.padding = '20px';
    popupBody.style.paddingBottom = '0px';
    popupBody.style.borderRadius = '8px';
    popupBody.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popupBody.style.zIndex = 999;
    popupBody.style.width = `${width}`;
    popupBody.style.height = `${height}`;
    popupBody.style.textAlign = 'Center';
    overlay.addEventListener('click', async () => {
        enableScroll();
        overlay.remove();
        popupBody.remove();
        closeFunctions();
    });

        // 监听 ESC 键来关闭弹窗
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            enableScroll();
            overlay.remove();
            popupBody.remove();
            closeFunctions();
        }
    });

    return {"overlay":overlay,
            "popupBody":popupBody}
}

export function createOverWindow(frame,width,height,height_gap,disable_background){
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    if (disable_background){
        overlay.classList.add('none-event');
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    }
    overlay.style.zIndex = '998';
    const popupWindow = document.createElement('div');
    popupWindow.classList.add('popup-window', 'm-0', 'p-0');
    popupWindow.style.width = width;
    popupWindow.style.height = height;
    popupWindow.style.position = 'absolute';
    popupWindow.style.display = 'none';
    popupWindow.style.zIndex = '999';
    popupWindow.style.minWidth = width;
    popupWindow.innerHTML = `<div class="popup-content""></div>`;
        // 获取 frame 的位置
    const rect = frame.getBoundingClientRect();
    console.log('rect',rect)
    let popupTop = rect.top + window.scrollY;
    let popupLeft = rect.left + window.scrollX;

    // 获取 popup 的尺寸
    const popupHeight = popupWindow.offsetHeight;
    const popupWidth = popupWindow.offsetWidth;

    // 计算新的 popup 位置，确保不会超出屏幕边界
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (popupTop + popupHeight > windowHeight) {
        popupTop = windowHeight - popupHeight - 10; // 距离底部有 10px 的间隙
    }

    if (popupLeft + popupWidth > windowWidth) {
        popupLeft = windowWidth - popupWidth - 10; // 距离右边有 10px 的间隙
    }

    if (popupTop < 0) {
        popupTop = 10; // 如果顶部超出屏幕，设定为 10px
    }

    if (popupLeft < 0) {
        popupLeft = 10; // 如果左边超出屏幕，设定为 10px
    }

    popupWindow.style.top = `${popupTop + height_gap}px`;
    popupWindow.style.left = `${popupLeft}px`;

    overlay.addEventListener('click', async () => {
        enableScroll();
        overlay.remove();
        popupWindow.remove();
    });

        // 监听 ESC 键来关闭弹窗
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            enableScroll();
            overlay.remove();
            popupWindow.remove();
        }
    });

    return {"overlay":overlay,
            "popupWindow":popupWindow}
}

export function leftBarWidthFit(){
    let type = '';
    const flag = sessionStorage.getItem("sidebarExpand",false);
    if (flag === 'true'){
        type = 'sidebar-width';
    } else {
        type = 'original-width';
    }
    const Divs = document.querySelectorAll(`[${type}]`)
    Divs.forEach(div =>{
        div.style.width = div.getAttribute(`${type}`);
    })
}