// document.addEventListener('DOMContentLoaded', function () {
//     const collapseButtons = document.querySelectorAll('[data-bs-toggle="collapse"]');
//
//     collapseButtons.forEach(button => {
//         button.addEventListener('click', function () {
//             const targetId = this.getAttribute('data-bs-target');
//             const targetElement = document.querySelector(targetId);
//
//             // 检查内容是否已经加载
//             if (!targetElement.querySelector('.loaded')) {
//                 loadContent(targetElement, targetElement.getAttribute('data-result-id'));
//             }
//         });
//     });
// });
//
// function loadContent(targetElement, resultId) {
//     // 模拟 Ajax 请求以获取内容
//     setTimeout(() => {
//         // 这里可以使用实际的 Ajax 请求
//         const content = `
//             <strong>Dialog Content for ID: ${resultId}</strong>
//             <div class="text-start fs-6">Start Time: 00:00</div>
//             <div class="text-start fs-6">Some dialog text here.</div>
//         `;
//
//         // 将内容插入目标元素
//         targetElement.querySelector('.flex-grow-1').innerHTML = content;
//         targetElement.querySelector('.flex-grow-1').classList.add('loaded'); // 标记为已加载
//     }, 500); // 模拟加载时间
// }
