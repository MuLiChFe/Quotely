// 获取 DOM 元素
const overlay = document.getElementById("overlay");
const component = document.getElementById("user-card");

// 切换浮动组件的显示/隐藏
function toggleFloatingComponent() {
    const isShowing = component.classList.contains('show');
    document.body.appendChild(component);
    if (isShowing) {
        closeFloatingComponent();
    } else {
        openFloatingComponent();
    }
}

// 显示浮动组件
function openFloatingComponent() {
    overlay.classList.remove("hidden");
    component.classList.add("show");

    // 添加 ESC 键关闭监听器
    document.addEventListener("keydown", handleEscapeKey);
}

// 隐藏浮动组件
function closeFloatingComponent() {
    overlay.classList.add("hidden");
    component.classList.remove("show");

    // 移除 ESC 键关闭监听器
    document.removeEventListener("keydown", handleEscapeKey);
}

// 点击遮罩层关闭组件
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
        closeFloatingComponent();
    }
});

// ESC 键关闭组件
function handleEscapeKey(e) {
    if (e.key === "Escape") {
        closeFloatingComponent();
    }
}
