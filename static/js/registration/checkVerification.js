window.onload = function() {
    // 获取包含验证 URL 的元素
    var emailVerificationDiv = document.getElementById('email-verification');
    if (!emailVerificationDiv) {
        return;
    }

    // 获取 URL
    var url = emailVerificationDiv.getAttribute('data-url');
    if (!url) {
        return;
    }

    // 定义检查函数
    function checkEmailVerification() {
        $.ajax({
            url: url,
            type: 'GET',
            success: function(response) {
                if (response.verified) {
                    window.location.href = "/"; // 替换为验证成功后的重定向视图URL
                }
            },
        });
    }

    // 设置定时器，每隔5秒调用 `checkEmailVerification`
    setInterval(checkEmailVerification, 5000); // 每 5000 毫秒（5 秒）检查一次
};
document.addEventListener("DOMContentLoaded", function() {
    const alertBox = document.querySelector(".alert-dismissible");
    if (alertBox) {
        // 在5秒后自动关闭消息
        setTimeout(() => {
            alertBox.classList.remove("show");
        }, 5000);
    }
});