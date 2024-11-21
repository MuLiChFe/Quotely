import { getUserMarkers, addMarker, removeMarker, checkMarker } from "/static/js/api/film_api.js";

const userId = 1; // 示例用户 ID
let currentFilmId = null;

document.addEventListener('DOMContentLoaded', function () {
    const filmsData = JSON.parse(films); // 电影数据
    const filmsRow = document.getElementById('films-row'); // 卡片容器
    const modal = document.getElementById('bookModal'); // 模态框
    const addToLibraryBtn = document.getElementById('addToLibraryBtn'); // "添加到库" 按钮
    const removeFromLibraryBtn = document.getElementById('removeFromLibraryBtn'); // "取消添加" 按钮

    // 动态生成电影卡片
    filmsData.forEach(film => {
        const filmCard = document.createElement('div');
        filmCard.classList.add('card', 'w-full', 'p-0');
        filmCard.innerHTML = `
            <div class="" data-bs-toggle="modal" data-bs-target="#bookModal" data-film-id="${film.id}">
                <img src="${film.image_link}" class="card-img-top book-image" alt="${film.display_name}">
                <div class="card-body">
                    <h5 class="card-title">${film.display_name}</h5>
                    <p class="card-text">by ${film.author}</p>
                    <div style="position: absolute; bottom: 10px; right: 5px">
                        <span class="badge bg-secondary">${film.type}</span>
                        <span class="badge bg-light text-dark">Year ${film.year_levels}</span>
                    </div>
                </div>
            </div>
        `;
        filmsRow.appendChild(filmCard);
    });

    // 模态框显示时动态加载内容
    modal.addEventListener('show.bs.modal', async function (event) {
        const button = event.relatedTarget; // 触发模态框的按钮
        currentFilmId = button.getAttribute('data-film-id'); // 当前电影 ID
        const film = filmsData.find(f => f.id == currentFilmId); // 查找电影数据

        // 更新模态框内容
        document.getElementById('bookModalLabel').textContent = film.display_name;
        document.getElementById('modalBookImage').src = film.image_link;
        document.getElementById('modalBookImage').alt = film.display_name;
        document.getElementById('modalBookAuthor').textContent = film.author;
        document.getElementById('modalBookType').textContent = film.type;
        document.getElementById('modalBookYear').textContent = film.year_levels;

        // 检查当前电影是否已添加
        try {
            const isMarked = await checkMarker("film",String(userId), currentFilmId);
            if (isMarked.exist) {
                // 已添加到库，隐藏 "添加到库" 按钮，显示 "取消添加" 按钮
                addToLibraryBtn.style.display = 'none';
                removeFromLibraryBtn.style.display = 'inline-block';
            } else {
                // 未添加到库，显示 "添加到库" 按钮，隐藏 "取消添加" 按钮
                addToLibraryBtn.style.display = 'inline-block';
                removeFromLibraryBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking marker status:', error);
        }
    });

    // "添加到库" 按钮点击事件
    addToLibraryBtn.addEventListener('click', async function () {
        try {
            await addMarker("film",userId, currentFilmId); // 添加到库的 API 调用
            // console.log(`Added film ${currentFilmId} to library.`);

            // 更新按钮显示状态
            this.style.display = 'none';
            removeFromLibraryBtn.style.display = 'inline-block';
        } catch (error) {
            // console.error('Error adding film to library:', error);
        }
    });

    // "取消添加" 按钮点击事件
    removeFromLibraryBtn.addEventListener('click', async function () {
        try {
            await removeMarker("film",userId, currentFilmId); // 从库中移除的 API 调用
            // console.log(`Removed film ${currentFilmId} from library.`);

            // 更新按钮显示状态
            this.style.display = 'none';
            addToLibraryBtn.style.display = 'inline-block';
        } catch (error) {
            console.error('Error removing film from library:', error);
        }
    });
});
