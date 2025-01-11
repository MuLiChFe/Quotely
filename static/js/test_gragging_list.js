// script.js
document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('sortableList');
    let draggingItem = null;

    list.addEventListener('dragstart', (e) => {
        draggingItem = e.target; // 当前拖拽的列表项
        e.target.classList.add('dragging');
    });

    list.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging'); // 移除拖拽样式
        const placeholder = document.querySelector('.placeholder');
        if (placeholder) placeholder.remove(); // 移除占位符
        draggingItem = null;
    });


    // 获取拖拽位置的参考元素
});
