import { getUserMarkers, getMarker, addMarker, removeMarker, checkMarker, getAllMarker} from "/static/js/api/mark_api.js";

const userId = 1; // 示例用户 ID
let currentFilmId = null;

document.addEventListener('DOMContentLoaded', async function () {
    // 等待 filmsData 解析完成
    let filmsData;
    try {
        filmsData = await getAllMarker('film', userId); // 等待异步操作完成
        console.log(filmsData);
    } catch (error) {
        console.error('Error fetching films data:', error);
        return; // 如果数据加载失败，不继续执行
    }

    const filmsRow = document.getElementById('films-row'); // 卡片容器
    const modal = document.getElementById('bookModal'); // 模态框
    const addToLibraryBtn = document.getElementById('addToLibraryBtn'); // "添加到库" 按钮
    const removeFromLibraryBtn = document.getElementById('removeFromLibraryBtn'); // "取消添加" 按钮

    const idList = Array.isArray(filmsData['id_list']) ? filmsData['id_list'] : Array.from(filmsData['id_list']);

    // 动态生成电影卡片
for (const filmId of idList) {
    try {
        const film_json = await getMarker("film", 'user_id',filmId);
        const film = film_json['marker'];
        // 创建电影卡片
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

        // 将电影卡片添加到页面
        filmsRow.appendChild(filmCard);
    } catch (error) {
        console.error("Error fetching film details:", error);
    }
}
;

    // 模态框显示时动态加载内容
    modal.addEventListener('show.bs.modal', async function (event) {
        const button = event.relatedTarget; // 触发模态框的按钮
        const currentFilmId = button.getAttribute('data-film-id'); // 当前电影 ID

        try {
            const film = await getMarker("film", currentFilmId); // 获取当前电影详情

            // 更新模态框内容
            document.getElementById('bookModalLabel').textContent = film.display_name;
            document.getElementById('modalBookImage').src = film.image_link;
            document.getElementById('modalBookImage').alt = film.display_name;
            document.getElementById('modalBookAuthor').textContent = film.author;
            document.getElementById('modalBookType').textContent = film.type;
            document.getElementById('modalBookYear').textContent = film.year_levels;

            // 检查当前电影是否已添加
            const isMarked = await checkMarker("film", userId, currentFilmId);
            if (isMarked.exist) {
                addToLibraryBtn.style.display = 'none';
                removeFromLibraryBtn.style.display = 'inline-block';
            } else {
                addToLibraryBtn.style.display = 'inline-block';
                removeFromLibraryBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading film details:', error);
        }
    });

    // "添加到库" 按钮点击事件
    addToLibraryBtn.addEventListener('click', async function () {
        const currentFilmId = modal.getAttribute('data-film-id'); // 从模态框获取当前电影 ID
        try {
            await addMarker("film", userId, currentFilmId); // 添加到库
            this.style.display = 'none';
            removeFromLibraryBtn.style.display = 'inline-block';
        } catch (error) {
            console.error('Error adding film to library:', error);
        }
    });

    // "取消添加" 按钮点击事件
    removeFromLibraryBtn.addEventListener('click', async function () {
        const currentFilmId = modal.getAttribute('data-film-id'); // 从模态框获取当前电影 ID
        try {
            await removeMarker("film", userId, currentFilmId); // 从库中移除
            this.style.display = 'none';
            addToLibraryBtn.style.display = 'inline-block';
        } catch (error) {
            console.error('Error removing film from library:', error);
        }
    });
});
