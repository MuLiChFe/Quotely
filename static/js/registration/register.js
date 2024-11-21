window.onload = function() {
    // 依次查找目标元素并聚焦，按优先级顺序
    const warning = document.querySelector('.input-warning');
    const verify = document.querySelector('.verify_link');
    const input = document.getElementById('floatingInput');

    if (warning) {
        warning.focus();
    } else if (verify) {
        verify.focus();
    } else if (input) {
        input.focus();
    }
};


function handleInput(element, initialEmail) {
    // 检查当前值是否与初始内容相同
    const warningElement = document.getElementById('email_error');
    if (element.value !== initialEmail) {
        // 当输入内容和初始内容相同时，应用 input-primary 样式
        warningElement.style.display = 'none';
        element.classList.remove('input-warning');
        element.classList.add('input-primary');

    } else {
        // 当输入内容和初始内容不同时，应用 input-warning 样式
        warningElement.style.display = 'block';
        element.classList.remove('input-primary');
        element.classList.add('input-warning');
    }
}

function passwordCheck(element) {
    const check_flag = document.getElementsByClassName('password_check');
    const guide = document.getElementById('password_guide');

    // console.log(guide)

    if (!check_flag) { return; }  // 如果没有 check_flag 元素，直接返回
    else { guide.style.display = 'block'; }  // 显示指南

    const input = element.value;

    // 检查各个条件是否满足
    const hasNumber = /\d/.test(input);
    const hasUppercase = /[A-Z]/.test(input);
    const isValidLength = input.length >= 8;

    // 更新每个条件的显示状态
    document.getElementById('check_number').style.display = hasNumber ? 'none' : 'block';
    document.getElementById('check_uppercase').style.display = hasUppercase ? 'none' : 'block';
    document.getElementById('check_length').style.display = isValidLength ? 'none' : 'block';

    if (hasUppercase && isValidLength && isValidLength) {
        element.classList.remove('input-warning');
        element.classList.add('input-primary');
    } else {
        element.classList.remove('input-primary');
        element.classList.add('input-warning');
    }
}

function hide_guide() {
    const guide = document.getElementById('password_guide');
    guide.style.display = 'none';
}

function forces_guide() {
    const check_flag = document.getElementsByClassName('password_check');
    const guide = document.getElementById('password_guide');

    if (!check_flag) { return; }  // 如果没有 check_flag 元素，直接返回
    guide.style.display = 'block';// 显示指南

}
