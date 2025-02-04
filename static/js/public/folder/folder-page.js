import { createPopup, createOverWindow } from "../../tools/browser.js";
import {loadQuotes} from "../quote/quote-display.js";
import {getUserMarkers} from "../../api/mark_api.js";
import {dictFilter} from "../../tools/filter.js";
import {leftBarWidthFit} from "../../tools/browser.js";

function createFolderBtnFunc(){
    const Popup = createPopup(1000,400,true,'')
    const overlay = Popup["overlay"]
    const confirmBox = Popup["popupBody"];
    const popupContent = document.createElement('div')
    popupContent.innerText = 'test';
    confirmBox.appendChild(popupContent);
    document.body.appendChild(overlay);
    document.body.appendChild(confirmBox);
}

async function selectSortBar(targetType) {
    await navBarFunc(targetType)
    const navBars = document.querySelectorAll('.sort-bar')
    sessionStorage.setItem('sortType', targetType)
    navBars.forEach(navBar => {
        if (navBar.getAttribute('sortType') === targetType) {
            const color = navBar.getAttribute('selectedColor')
            navBar.style.color = color;
            navBar.style.fill = color;
            navBar.classList.add('selected')
        } else {
            navBar.style.fill = '#9c9b98';
            navBar.style.color = '#9c9b98';
            navBar.classList.remove('selected')
        }
    })

}

async function filterProcessor(){
    const tagFilter = sessionStorage.getItem('folder-tag-filter-list-str')
    const quotes = document.querySelectorAll('[info-card]')
    if (tagFilter){
        quotes.forEach(quoteDiv=>{
            const tags = quoteDiv.querySelectorAll('[tag]');
            let displayFlag = false;
            if (!tags){return}
            tags.forEach(tagDiv =>{
                if (displayFlag){return}
                const code = '#' + tagDiv.getAttribute('tag') + '#';
                console.log(tagFilter,code)
                if (tagFilter.search(code) !== -1) {
                    displayFlag = true;
                }
            })
            quoteDiv.style.display = displayFlag?'block':'none';
        })
    } else {
        quotes.forEach(quoteDiv =>{
            quoteDiv.style.display = 'block';
        })
    }

}
function displayFilterBar(alter) {
    // 获取存储在 sessionStorage 中的 folder-filter-state
    let folderFilterState = sessionStorage.getItem('folder-filter-state');

    // 如果 sessionStorage 中没有值，则初始化为 'true'（即显示过滤栏）
    if (folderFilterState === null) {
        folderFilterState = 'true';
    }

    // 根据 folder-filter-state 设置 flag，'true' 为显示过滤栏，'false' 为隐藏
    let flag = folderFilterState === 'true';

    // 如果 alter 为 true，则反转 flag 并更新 sessionStorage
    if (alter) {
        sessionStorage.setItem('folder-tag-filter-list-str','')
        filterProcessor()
        flag = !flag;
        sessionStorage.setItem('folder-filter-state', flag ? 'true' : 'false');
    }

    console.log('flag', flag);

    // 获取 filterContainer 元素
    const filterContainer = document.getElementById('filter-container');

    // 根据 flag 显示或隐藏过滤栏
    if (flag) {
        filterContainer.classList.remove('hidden');
    } else {
        filterContainer.classList.add('hidden');
    }
}


function clearBody(body){
    body.innerHTML = '';
}

function initFilterTagBtn(tagFilterBtn) {
    if (!sessionStorage.getItem('folder-tag-filter-list-str')){
        sessionStorage.setItem('folder-tag-filter-list-str','')
    }
    tagFilterBtn.addEventListener('click',async () => {
        console.log('folder-tag-filter-list-str',sessionStorage.getItem('folder-tag-filter-list-str'))
        let pageExistTag = []
        let pageExistDiv = []
        const tags = document.querySelectorAll('[tag]')
        tags.forEach(tagDiv=>{
            const tagId = tagDiv.getAttribute('tag')
            if (!pageExistTag.includes(tagId)) {
                pageExistTag.push(tagId)
                if (tagDiv.querySelector('.not-owned')){
                    pageExistDiv.unshift(tagDiv)
                } else {
                    pageExistDiv.push(tagDiv)
                }
            }
        })
        const divs = document.querySelectorAll('.popup-window')
        divs.forEach(div => div.remove())
        const create_overWindow = createOverWindow(tagFilterBtn, '5%', '100px', 32,true)
        const overWindow = create_overWindow['popupWindow']
        const overLay = create_overWindow['overlay']
        overWindow.style.display = "block";

        const content = overWindow.querySelector('.popup-content')
        content.style.maxHeight = '300px';
        content.style.overflow = 'auto';

        const title = document.createElement('div')
        const body = document.createElement('div')

        title.innerHTML = `
            <div class="hint">
                Tag filter
            </div>
        `

        pageExistDiv.forEach(div=>{
            if (!div.querySelector('.tag')){
                return
            }
            let filterList = sessionStorage.getItem('folder-tag-filter-list-str')
            const option = document.createElement('div')
            option.style.display = 'flex';
            option.style.padding = '4px';
            option.classList.add('dragging-selection')
            const tickbox = document.createElement('div')
            tickbox.classList.add('tickbox')
            tickbox.style.width = '24px';
            tickbox.innerHTML =
                `
                    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 64 64" width="20px" style="margin-right: 4px">
                    <defs fill="#55534E" />
                    <path  d="m10,10v44h44V10H10Zm38,38H16V16h32v32Z" fill="#55534E" /></svg>
                `

            const code = '#' + div.getAttribute('tag') + '#'

            function change(flag) {
                if (flag === 'true') {
                    option.setAttribute('selected','false')
                    tickbox.innerHTML =
                        `
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 64 64" width="20px" style="margin-right: 4px">
                            <defs fill="#55534E" />
                            <path  d="m10,10v44h44V10H10Zm38,38H16V16h32v32Z" fill="#55534E" /></svg>
                        `

                } else {
                    option.setAttribute('selected','true')
                    tickbox.innerHTML =
                        `
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 64 64" width="20px" style="margin-right: 4px">
                            <defs fill="#55534E" />
                            <path  d="m10,10v44h44V10H10Zm19,34.24l-11-11,4.24-4.24,6.76,6.76,13.76-13.76,4.24,4.24-18,18Z" fill="#55534E" /></svg>
                        `
                }
            }

            change((filterList.search(code) === -1).toString())
            option.innerHTML = tickbox.innerHTML + div.innerHTML

            option.addEventListener('click',()=>{
                let filterListStr = sessionStorage.getItem('folder-tag-filter-list-str')
                const flag = option.getAttribute('selected')
                change(flag)
                if (flag === 'true') {
                    filterListStr = filterListStr.replace(code,'')
                } else {
                    filterListStr = filterListStr + code
                }
                option.innerHTML = tickbox.innerHTML + div.innerHTML
                console.log('new-filterListStr',filterListStr)
                sessionStorage.setItem('folder-tag-filter-list-str',filterListStr)
                                filterProcessor()

            })
            body.appendChild(option)
        })

        content.appendChild(title)
        content.appendChild(body)

        document.body.appendChild(overWindow)
        document.body.appendChild(overLay)
    })



}


function filterDisplay(tag,owner,type){
    const tagFilterBtn = document.getElementById('tag-filter');
    if (tagFilterBtn) {
        tagFilterBtn.style.display = tag?'block':'none';
        if (tag) {
            initFilterTagBtn(tagFilterBtn)
        }
        filterProcessor()
    }
    const ownerFilterBtn = document.getElementById('owner-filter');
    if (ownerFilterBtn) {
        ownerFilterBtn.style.display = owner?'block':'none';
    }
    const typeFilterBtn = document.getElementById('type-filter');
    if (typeFilterBtn) {
        typeFilterBtn.style.display = type?'block':'none';
    }
}

async function favouriteBtnFunc() {
    filterDisplay(true,false,false)
    let quoteList = await getUserMarkers('quote', userId)
    quoteList = dictFilter(quoteList, {film_name: filmName}, 'ALL')
    await loadQuotes(userId, 'display-body', quoteList, 'mini_quote_card');
}

async function folderBtnFunc(){
    filterDisplay(true,true,true)
}

async function navBarFunc(currentSortType) {
    const body = document.getElementById('display-body')
    clearBody(body)
    if (currentSortType === 'favourite') {
        await favouriteBtnFunc()
    }
    if (currentSortType === 'folder') {
        await folderBtnFunc()
    }
    leftBarWidthFit()
}

async function initSortBar(){
    const navBars = document.querySelectorAll('.nav-bar')
    let currentSortType = sessionStorage.getItem('sortType')
    if (!currentSortType) {
        currentSortType = navBars[0].getAttribute('sortType')
        sessionStorage.setItem('sortType',currentSortType)
    }
    selectSortBar(currentSortType)
    navBars.forEach(navBar =>{
        navBar.addEventListener("click",()=>{
            sessionStorage.setItem('folder-tag-filter-list-str','')
            selectSortBar(navBar.getAttribute('sortType'))
        })
    })
}

async function initCreateFolderBtn(){
    const createFolderBtn = document.getElementById('create-folder')
    createFolderBtn.addEventListener('click',()=>{
        createFolderBtnFunc()
    })
}

function initToolBar(){
    displayFilterBar()
    const filterBtn = document.getElementById('filter-btn')
    if (filterBtn) {
        filterBtn.addEventListener('click',()=>{
            displayFilterBar(true)
        })
    }
}
// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    await initSortBar()
    initToolBar()
    // await initCreateFolderBtn()
});
