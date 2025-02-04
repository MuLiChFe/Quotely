function leftBarWidthFit(){
    let type = '';
    const flag = sessionStorage.getItem("sidebarExpand",false);
    console.log('flag',flag)
    if (flag === 'true'){
        type = 'sidebar-width';
    } else {
        type = 'original-width';
    }
    const Divs = document.querySelectorAll(`[${type}]`)
    Divs.forEach(div =>{
        console.log(div,div.getAttribute(`${type}`));
        div.style.width = div.getAttribute(`${type}`);
    })
}

function process(flag){
    leftBarWidthFit()
    document.querySelectorAll(".explanations").forEach(element => {
        if (flag) {
            element.classList.add("show"); // 添加显示类
        } else {
            element.classList.remove("show"); // 移除显示类
        }
    });
    document.querySelectorAll(".preview-only").forEach(element => {
        if (flag) {
            element.classList.add("hide"); // 移除显示类
        } else {
            element.classList.remove("hide"); // 添加显示类

        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById("left-bar");

    // 切换 expanded 类名
    const isExpanded = sidebar.classList.toggle('expanded');
    // console.log(document.querySelectorAll(".explanations"));

    sessionStorage.setItem("sidebarExpand",isExpanded);
    process(isExpanded);
    // 平滑修改所有 explanations 的显隐状态

}

function PageNavigator(targetUrl) {
    const currentUrl = window.location.pathname; // 获取当前页面的完整 URL

    if (currentUrl === targetUrl) {
        return; // 不跳转
    }
    // 跳转到目标页面
    window.location.href = targetUrl;
}
