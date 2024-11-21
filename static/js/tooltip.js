const tooltip = document.createElement("div");
tooltip.classList.add("tooltip");
document.body.appendChild(tooltip); // 将tooltip添加到页面上

// 获取所有带有 data-tooltip 的元素
const elementsWithTooltip = document.querySelectorAll("[data-tooltip]");

// 为每个元素添加鼠标事件
elementsWithTooltip.forEach(element => {
    element.addEventListener("mouseenter", function() {
        if (document.getElementById('left-bar').classList.contains('expanded')) {
            return
        }
        // 设置tooltip的文本内容为 data-tooltip 属性的值
        tooltip.textContent = element.getAttribute("data-tooltip");

        // 计算tooltip的位置并显示
        const rect = element.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;

        // 将tooltip放置到目标元素的右侧
        tooltip.style.left = `${rect.left + rect.width + 10}px`; // 目标元素右侧+10px
        tooltip.style.top = `${rect.top + rect.height / 2 - tooltipHeight / 2}px`; // 目标元素垂直居中

        tooltip.classList.add("show"); // 显示tooltip
    });

    element.addEventListener("mouseleave", function() {
        tooltip.classList.remove("show"); // 鼠标离开时隐藏tooltip
    });
});
