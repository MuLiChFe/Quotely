import { changeSearchFilm } from '../../api/film_api.js'

function updateFilmTick() {
    const films = document.querySelectorAll('.dropdown-item')
    films.forEach(film =>{
        let filmName = film.innerText.trim()
        if (filmName === currentFilmName) {
            film.innerHTML = `
                    ${filmName}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute;right:0;margin-right:8px; color:#53514DFF">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.0755 7.93219C16.5272 8.25003 16.6356 8.87383 16.3178 9.32549L11.5678 16.0755C11.3931 16.3237 11.1152 16.4792 10.8123 16.4981C10.5093 16.517 10.2142 16.3973 10.0101 16.1727L7.51006 13.4227C7.13855 13.014 7.16867 12.3816 7.57733 12.0101C7.98598 11.6386 8.61843 11.6687 8.98994 12.0773L10.6504 13.9039L14.6822 8.17451C15 7.72284 15.6238 7.61436 16.0755 7.93219Z" fill="currentColor"></path>
                    </svg>
                `
            film.classList.add('d-flex')
        } else {
            film.innerHTML = `${filmName}`
            film.classList.remove('d-flex')
        }
    })
}

document.addEventListener('DOMContentLoaded', async () => {
    // 假设后端传递的数据类似于 [(film_name, id), (film_name, id)]
    // 获取容器，准备插入下拉按钮
    const dropdownContainer = document.getElementById('select-film-dropdown');
    // 创建按钮
    const btn = document.createElement('button');
    const dropDownBtn = document.createElement('div');
    dropDownBtn.innerHTML = `
        ${currentFilmName}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md text-token-text-tertiary">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 9.29289C5.68342 8.90237 6.31658 8.90237 6.70711 9.29289L12 14.5858L17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289C19.0976 9.68342 19.0976 10.3166 18.7071 10.7071L12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071L5.29289 10.7071C4.90237 10.3166 4.90237 9.68342 5.29289 9.29289Z" fill="currentColor"></path>
        </svg>
    `;
    btn.id = 'select-film-btn';
    btn.classList.add('dropdown-btn');
    btn.appendChild(dropDownBtn);

    // 创建下拉菜单
    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');
    dropdownMenu.style.display = 'none'; // 默认不显示菜单

    // 创建下拉项
    for (let film of userFollowedFilm) {
        console.log('film', film);
        const filmName = film.display_name;
        const filmId = film.id;

        const item = document.createElement('a');
        item.classList.add('dropdown-item');
        item.textContent = filmName;
        item.style.paddingRight = '40px';
        // 为每个下拉项添加点击事件，选择电影
        item.addEventListener('click', async () => {
            dropdownMenu.style.display = 'none'; // 隐藏菜单
            if (filmName !== currentFilmName) {
                await changeSearchFilm(userId, filmId)
                dropDownBtn.style.display = 'none';
                console.log(window.location.href)
                window.location.replace(window.location.href)
            }
            // 你也可以在这里执行额外的逻辑，如将电影ID发送到服务器等
            console.log(`Film selected: ${filmName} (ID: ${filmId})`);
        });

        dropdownMenu.appendChild(item);

    }
    // 将按钮和下拉菜单添加到容器中
    dropdownContainer.appendChild(btn);
    dropdownContainer.appendChild(dropdownMenu);

    // 显示或隐藏下拉菜单
    btn.addEventListener('click', (e) => {
        e.stopPropagation();  // 阻止事件冒泡，避免触发外层点击事件
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    // 点击页面其他地方时关闭 dropdown
    document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none'; // 隐藏菜单
    });

    // 阻止点击事件冒泡到 document（防止关闭菜单）
    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    updateFilmTick()
});
