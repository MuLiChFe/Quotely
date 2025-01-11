import {getUserOwnTags, QuoteTags, UpdateUerTagOrder, BindTag, unBindTag, CreatTag} from "../../api/tag_api.js";
import {createTagSetting,renameSettingTag} from "./tag-setting.js"
import {hexToRgbA} from "../../tools/color-convert.js"

const addTagText = '<div class="me-2 hint" style="color:grey">Add Tag</div>';
// 2为ColorPopup打开 1为TagListPopup打开 0为默认
let TagListPopup = 0;
let draggingFlag = false;
let initFrame = false;
let isModified = false;
let askWorkspace = false;
let workspace_list = [];
const activePopups = new Map(); // key: frame, value: { popupWindow, popupContent, closePopup }

function findIndexById(targetId) {
    for (let i = 0; i < workspace_list.length; i++) {
        if ((workspace_list[i][1]).toString() === targetId) { // 检查id是否匹配
            return i; // 返回索引
        }
    }
    return workspace_list.length; // 如果找不到，返回-1
}

function bindDeleteBtn(deleteButtons,quoteId) {
    deleteButtons.forEach(deleteButton => {
        deleteButton.addEventListener('click', async (event) => {
            // event.stopPropagation(); // 阻止事件冒泡
            const tagButton = deleteButton.closest('.tag'); // 获取父元素 tag
            if (tagButton) {
                const tagId = deleteButton.getAttribute('data-quote-id');
                const state = await unBindTag(userId, tagId, quoteId);
                if (state.state){
                    tagButton.remove(); // 移除该标签
                    isModified = true; // 标记为已修改
                }
            }
        });
    });
}

function popupAskWorkspaceId(quoteId, display_name) {
    TagListPopup += 1;
    askWorkspace = true
    // 创建一个遮罩层
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay','none-event')
    document.body.appendChild(overlay);

    // 创建弹窗容器
    const popup = document.createElement('div');
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.zIndex = 1001;
    popup.style.width = '300px';
    document.body.appendChild(popup);

    // 创建弹窗标题
    const title = document.createElement('h3');
    title.innerHTML = `Tag <strong>${display_name}</strong> is for...`;
    title.style.marginBottom = '15px';
    title.style.fontSize = '18px';
    title.style.color = '#333';
    popup.appendChild(title);

    const hint = document.createElement('div')
    hint.innerHTML = 'Select a workspace'
    hint.classList.add('hint')
    popup.appendChild(hint)

    // 创建下拉菜单
    const select = document.createElement('select');
    select.classList.add('form-select','mb-2')
    workspace_list.forEach(([workspace_name, workspace_id]) => {
        const option = document.createElement('option');
        option.value = workspace_id;
        option.textContent = workspace_name;
        select.appendChild(option);
    });
    popup.appendChild(select);

    // 创建确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'confirm';
    confirmButton.classList.add('btn','btn-primary','w-100')
    popup.appendChild(confirmButton);
    requestAnimationFrame(() => {
        confirmButton.focus();
    });
    // 事件监听器
    confirmButton.addEventListener('click', () => {
        const selectedWorkspaceId = select.value;
        createNewTag(quoteId,display_name,selectedWorkspaceId)
        closePopup();
    });

    function closePopup() {
        askWorkspace = false;
        document.body.removeChild(popup);
        document.body.removeChild(overlay);
    }
}

async function createNewTag(quoteId,display_name,workspace_id) {
    if (!workspace_id) {
        if (workspace_list.length !== 1){
            popupAskWorkspaceId(quoteId,display_name)
            return
        } else {
            workspace_id = '';
        }
    }
    const tag = await CreatTag(userId, display_name, workspace_id, filmId);
    const tagFrame = document.querySelector('.tags-opened').querySelector('.tag-container');
    let userSelection = document.querySelectorAll('.selection-frame');
    const index = findIndexById(workspace_id)
    // userSelection = userSelection[index-1]
    userSelection = userSelection[index];
    const hint = tagFrame.querySelector('.hint')
    if (hint) {
        hint.remove()
    }
    createTag(quoteId, tagFrame, '', tag.tag, true, true, false, false);
    createTag(quoteId,userSelection,tagFrame,tag.tag,true,false,true,true);
    await BindTag(userId, tag.tag.id, quoteId);
    isModified = true;
    deleteNewTagBtn();
    const deleteButtons = document.querySelectorAll('.delete-tag');
    bindDeleteBtn(deleteButtons,quoteId)
    const input = document.querySelector('.tag-input');
    input.value = '';
}

function deleteNewTagBtn(){
    const newTagBtn = document.querySelector('.new-tag-btn');
    if (newTagBtn) {
        newTagBtn.remove()
    }
    return true;
}

async function createNewTagBtn(quoteId,display_name,fatherFrame) {
    const newTagBtn = document.createElement('div');
    newTagBtn.classList.add('new-tag-btn','dragging-selection','p-1','m-1','d-flex');
    newTagBtn.innerHTML = '<div class="pe-1">Create</div>'
    const tag = {
        'display_name':display_name,
        'color':'ffffff',
        'id':'/'
    }
    createTag(quoteId,newTagBtn,'',tag,false,false,false,false);
    fatherFrame.appendChild(newTagBtn);

    newTagBtn.addEventListener('click',()=>{
        createNewTag(quoteId,display_name);
    })

    return true
}

function inputFrame(userId, quoteId, frame) {
    // 创建一个新的 div 容器
    const input_frame = document.createElement('div');
    input_frame.classList.add('input-container');

    // 创建一个 input 元素
    const input = document.createElement('input');
    input.classList.add('tag-input');

    // 设置 input 元素的属性，例如 placeholder 或其他属性
    input.setAttribute('type', 'text');  // 设置为文本输入框
    input.setAttribute('placeholder', '');

    // 自动聚焦到输入框
    requestAnimationFrame(() => {
        input.focus();
    });

    // 将 input 元素添加到 div 容器中
    input_frame.appendChild(input);

    // 将 input_frame 添加到目标 frame 中
    frame.appendChild(input_frame);

    // 监听输入事件，实时记录输入内容
    input.addEventListener('input', (event) => {
        const inputValue = input.value.trim();
        const fatherFrame = document.querySelector('.popup-content')
        deleteNewTagBtn();
        if (inputValue) {
            createNewTagBtn(quoteId,inputValue,fatherFrame);
        }
    });

    // 监听键盘事件，例如按下回车键时提交输入
    input.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            const inputValue = input.value.trim(); // 获取输入的值并去除多余空格
            if (inputValue) {
                // 这里可以添加逻辑，例如将标签保存到服务器或更新UI
                await createNewTag(quoteId, inputValue);
                input.value = ''; // 清空输入框
            }
        }
    });

}


async function initFramePopup(userId, quoteId, frame) {
    let popupWindow = null; // 当前的弹窗
    let popupContent = null; // 当前弹窗内容
    let originalFrameContent = null; // 存储 frame 的原始内容
    function documentClickHandler(event) {
         if (!popupWindow.contains(event.target)){
             closePopup(false);
         }
    }
    // 定义关闭弹窗的逻辑
    const closePopup = (force) => {
        const TagListExist = document.querySelector('.tag-setting-popup')
        if (askWorkspace || TagListExist || TagListPopup === 2){
            return false
        }
        if (TagListPopup === 1 && !force){
            TagListPopup -= 1
            return false
        }
        const existingPopup = document.querySelector('.tag-setting-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
        // 如果内容被修改，将弹窗内容复制回原 frame
        if (isModified) {
            showDeleteButton(popupContent, false);
            const container = popupContent.querySelector('.tags-opened');
            container.querySelector('.tag-input-frame').remove()
            const inner = container.innerHTML;
            // inner.que
            if (inner.search('tag ') !== -1) {
                frame.innerHTML = inner;
                originalFrameContent = inner;
            } else {
                const addTagFrame = document.createElement('div');
                addTagFrame.classList.add('hint')
                addTagFrame.innerHTML = addTagText;
                const outsider = document.createElement('div');
                outsider.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1 icon icon-tabler icons-tabler-outline icon-tabler-tag">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
                    </svg>
                    <div class="tag-container justify-content-between align-items-center">
                        <div class="hint">
                            <div class="me-2 hint" style="color:grey">Add Tag</div>
                        </div>
                    </div>`
                frame.innerHTML = outsider.innerHTML
            }
        }
        else {
            // 如果没有修改，则还原原始内容
            frame.innerHTML = originalFrameContent;
        }
        // 重置状态
        popupWindow.style.display = 'none';
        popupWindow.remove();
        // 从 activePopups 中移除当前 popup
        activePopups.delete(frame);
        document.removeEventListener('click', documentClickHandler); // 解绑监听器
        isModified = false;
        initFrame = false;
        return true

    };
        // 在打开新的 popup 之前，确保所有旧的 popup 执行关闭逻辑
    // 处理 frame 点击的逻辑
    const handleFrameClick = (event) => {
        activePopups.forEach(({ closePopup: closeOldPopup }, activeFrame) => {
            if (activeFrame !== frame) {
                closeOldPopup(true); // 调用旧 popup 的关闭逻辑
            }
        });
        event.stopPropagation(); // 阻止事件冒泡，避免触发其他区域的点击事件
        originalFrameContent = frame.innerHTML;
        showDeleteButton(frame, true);

        // 如果 popupWindow 不存在，才创建它
        popupWindow = document.createElement('div');
        popupWindow.classList.add('popup-window', 'm-0', 'p-0');
        popupWindow.style.position = 'absolute';
        popupWindow.style.display = 'none';
        popupWindow.innerHTML = `<div class="popup-content"></div>`;
        document.body.appendChild(popupWindow); // 将弹窗添加到页面
        popupContent = popupWindow.querySelector('.popup-content');

        popupContent.innerHTML = '';

        // 克隆 frame 的内容并插入到悬浮窗口
        const frameContent = frame.cloneNode(true);
        if (frameContent.classList.contains('tags')) {
            frameContent.classList.remove('tags');
            frameContent.classList.add('tags-opened');
        } else {
            console.error('The root element does not have the class "tags".');
        }
        isModified = false; // 标记内容是否被修改
        initFrame = true
        popupContent.appendChild(frameContent);

        // 添加输入位子
        const inputContent = document.createElement('div')
        inputContent.classList.add('tag-input-frame')
        inputFrame(userId,quoteId,inputContent);
        frameContent.appendChild(inputContent);


        popupContent.appendChild(frameContent);

        // 创建 user Tags 的选择
        const displayFrame = frameContent.querySelector('.tag-container')
        const hint = document.createElement('div')
        hint.classList.add('hint','ps-2','pt-1')
        hint.style.under = true;
        hint.innerHTML = 'Select a tag or create one'
        popupContent.appendChild(hint)

        miniTagMenu(quoteId,popupContent,displayFrame, userId);

        // 清空原始 frame 的内容
        frame.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1 icon icon-tabler icons-tabler-outline icon-tabler-tag">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
            </svg>
            <div style="height:23px"> </div>`;


        const deleteButtons = popupContent.querySelectorAll('.delete-tag');
        bindDeleteBtn(deleteButtons,quoteId)

        // 获取 frame 的位置
        const rect = frame.getBoundingClientRect();
        popupWindow.style.top = `${rect.top + window.scrollY}px`;
        popupWindow.style.left = `${rect.left + window.scrollX}px`;

        // 显示当前弹窗
        popupWindow.style.display = 'block';

        // 将当前 popup 信息存入 activePopups
        activePopups.set(frame, { popupWindow, popupContent, closePopup });

        // 点击其他区域时关闭当前弹窗
        document.addEventListener('click', documentClickHandler);
    };

    // 为 frame 添加点击事件
    frame.addEventListener('click', handleFrameClick);
}

async function createTagSelectionPopup(userId,tag,targetElement, tag_frame, editBtn) {
    // 如果已经存在同类弹窗，先移除
    const existingPopup = document.querySelector('.tag-setting-popup');
    const overlay = document.querySelector('.popup-overlay.tag-setting');
    if (existingPopup) existingPopup.remove();
    if (overlay) overlay.remove();

    // 创建遮罩层
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay tag-setting';
    document.body.appendChild(popupOverlay);

    // 创建新的弹窗
    const popup = document.createElement('div');
    popup.className = 'tag-setting-popup';

    createTagSetting(userId,tag,popup)

    // 定位弹窗到目标元素的下方并居中
    const rect = targetElement.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY + 8}px`; // 距离目标元素下方 8px
    popup.style.left = `${rect.left + window.scrollX + rect.width / 2 - 75}px`; // 水平居中（假设宽度为150px）

    // 将弹窗添加到页面
    document.body.appendChild(popup);

    // 点击遮罩层时仅关闭当前弹窗和遮罩层
    popupOverlay.addEventListener('click', () => {
        if (!renameSettingTag(userId,tag.id)) {return;}
        tag_frame.style.background = 'white';
        editBtn.style.display = 'none';
        TagListPopup = 1;
        popup.remove();
        popupOverlay.remove();
    });

    return popup;
}

function createTag(quoteId,tagFrame,tagDisplayFrame, tag, owned, deletable, allowDragging, allowEdit) {
    const tag_frame = document.createElement('div')
    tag_frame.classList.add('align-items-center','d-flex')
    tag_frame.setAttribute('tag',`${tag.id}`)
    // 拖动模块
    const dragHandle = document.createElement('div');
    if (allowDragging) {
        tag_frame.classList.add('dragging-selection')
        // 创建一个拖拽把手
        dragHandle.classList.add('drag-handle');
        dragHandle.innerHTML = `
            <svg role="graphics-symbol" viewBox="0 0 10 10" class="dragHandle"><path d="M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z"></path></svg>`;  // 使用简单的符号表示拖拽把手，当然你可以换成更复杂的图标
    }

    const tag_button = document.createElement('div');
    tag_button.classList.add('tag','d-flex','mini', owned ? 'owned' : 'not-owned');
    tag_button.style.background = `#${tag.color}`;
    tag_button.style.borderColor = hexToRgbA(tag.color, 1, 30);

    const tag_name = document.createElement('div');
    tag_name.classList.add('tag-name')
    tag_name.textContent = tag.display_name;
    tag_button.append(tag_name)

    // 如果标签是可编辑的，添加删除按钮
    if (deletable) {
        const deleteButton = document.createElement('span');
        deleteButton.innerHTML = '<svg role="graphics-symbol" viewBox="0 0 8 8" class="closeThick"><polygon points="8 1.01818182 6.98181818 0 4 2.98181818 1.01818182 0 0 1.01818182 2.98181818 4 0 6.98181818 1.01818182 8 4 5.01818182 6.98181818 8 8 6.98181818 5.01818182 4"></polygon></svg>'
        deleteButton.classList.add('delete-tag');
        deleteButton.setAttribute('data-quote-id',tag.id)
        tag_button.appendChild(deleteButton);
    }
    tag_button.setAttribute('tag-id', tag.id); // tag.id 是标签的唯一标识符

    const editBtn = document.createElement('div');
    if (allowEdit) {
        tag_button.classList.remove('mini')

        editBtn.innerHTML = `
            <div class="tag-setting-btn">
                <svg role="graphics-symbol" viewBox="0 0 13 3" class="dots" style="width: 14px; height: 26px; display: block; fill: rgba(55, 53, 47, 0.45); flex-shrink: 0;">
                    <g>
                        <path d="M3,1.5A1.5,1.5,0,1,1,1.5,0,1.5,1.5,0,0,1,3,1.5Z"></path>
                        <path d="M8,1.5A1.5,1.5,0,1,1,6.5,0,1.5,1.5,0,0,1,8,1.5Z"></path>
                        <path d="M13,1.5A1.5,1.5,0,1,1,11.5,0,1.5,1.5,0,0,1,13,1.5Z"></path>
                    </g>
                </svg>
            </div>
        `;
        editBtn.classList.add('setting-frame')
        editBtn.style.display = 'none'; // 默认隐藏
        editBtn.style.position = 'absolute';
        editBtn.style.right = '0px'; // 可根据需要调整位置
        editBtn.style.top = '50%';
        editBtn.style.transform = 'translateY(-50%)';
        tag_frame.style.position = 'relative'; // 确保父容器是相对定位

        // 点击 tag-setting 显示弹窗
        editBtn.querySelector('.tag-setting-btn').addEventListener('click', (event) => {
            event.stopPropagation(); // 防止触发其他点击事件
            isModified = true;
            // 调用 createTagListPopup 创建模态弹窗
            const targetElement = editBtn.querySelector('.tag-setting-btn');
            createTagSelectionPopup(userId,tag,targetElement,tag_frame,editBtn);
        });
        tag_frame.appendChild(dragHandle);
    }

    function editBtnDisplay(type_) {
        if (!draggingFlag && editBtn) {
            editBtn.style.display = type_;
        }
    }
    // 鼠标进入时显示
    tag_frame.addEventListener('mouseover', () => {
        const TagListExist = document.querySelector('.tag-setting-popup')
        if (TagListExist) {return}
        editBtnDisplay('block');
        if (!draggingFlag && allowDragging) {
            tag_frame.style.background = '#efefef';
        }
    });

    // 鼠标移出时隐藏
    tag_frame.addEventListener('mouseout', () => {
        const TagListExist = document.querySelector('.tag-setting-popup')
        if (TagListExist || !initFrame) {
            return
        }
        if (allowDragging) {
            tag_frame.style.background = 'white';
        }
        if (!draggingFlag){
            editBtnDisplay('none')
        }
    });

    tag_frame.addEventListener('click',async () => {
        if (allowDragging){
            if (tagDisplayFrame){
                const hint = tagDisplayFrame.querySelector('.hint')
                if (hint) {
                    hint.remove()
                }
            }
            isModified = true;
            const state = await BindTag(userId, tag.id, quoteId);
            if (state.state) {
                createTag(quoteId,tagDisplayFrame,'', tag, owned, true, false, false);
                const deleteButtons = tagDisplayFrame.querySelectorAll('.delete-tag');
                bindDeleteBtn(deleteButtons,quoteId)
            }
        }
    });

    tag_frame.appendChild(tag_button);
    tag_frame.appendChild(editBtn);

    if (document.querySelector('.input-container') && !allowDragging){
        const secondLastChild = tagFrame.children[tagFrame.children.length - 2];
        tagFrame.insertBefore(tag_frame, secondLastChild);
    }

    tagFrame.appendChild(tag_frame);
}

function selectionTagPause(flag) {
    const otherTags = document.querySelectorAll('.dragging-selection');
    if (flag) {
        otherTags.forEach((tag_) => {
            tag_.classList.add('pause');
            tag_.style.background = 'white';
        });
    } else {
        otherTags.forEach((tag_) => {tag_.classList.remove('pause')
            const tagSettingBtn = tag_.querySelector('.setting-frame');
            if (tagSettingBtn){
                tagSettingBtn.style.display='none';
            }
        });

    }
}

function selection(quoteId,fatherFrame,displayFrame,workspace) {
    console.log('selection')
    if (!workspace.editable){return}
    console.log('workspace.display_name',workspace.workspace_name)
    workspace_list.push([workspace.workspace_name,workspace.workspace_id?workspace.workspace_id:'/'])
    const header = document.createElement('div');
    header.innerHTML = `<u class="workspace-title hint">${workspace.workspace_name}</u>`;

    const body = document.createElement('div');
    body.innerHTML = '';
    body.classList.add('selection-frame')

    if (workspace.tags.length === 0) {
        fatherFrame.appendChild(header);
        fatherFrame.appendChild(body);
        return;
    }

    for (let tag of workspace.tags) {
        createTag(quoteId,body,displayFrame,tag,true,false,true,true)

    }
    new Sortable(body, {
        animation: 150, // 设置动画效果
        handle: '.dragging-selection', // 限定拖拽的目标是标签
        onEnd: function (evt) {
            const orderedTags = Array.from(body.children).map((tagElement) => {
                const obj = tagElement.querySelector('.tag');
                return obj.getAttribute('data-id');
            });
            // 你可以在这里发送新排序数据到后端
            UpdateUerTagOrder(userId,workspace.workspace_id,orderedTags)
            selectionTagPause(false)
            draggingFlag = false
        },
        onStart : function (evt) {
            draggingFlag = true
            selectionTagPause(true)
        },
        dragClass:"dragClass",
        dragoverBubble: true,
        ghostClass:"ghostClass",
    });

    fatherFrame.appendChild(header);
    fatherFrame.appendChild(body);
}

async function miniTagMenu(quoteId,fatherFrame,displayFrame,userId) {
    const userSelection = document.createElement('div');
    userSelection.classList.add('mini-tagMenu');
    userSelection.innerHTML = '';
    const userTags = await getUserOwnTags(userId,quoteId,'');
    workspace_list = []
    for (let workspace of userTags) {
        console.log('workspace',workspace)
        selection(quoteId,userSelection,displayFrame,workspace)
    }
    fatherFrame.appendChild(userSelection)
}

async function showDeleteButton(frame,bool) {
    const deleteButtons = frame.querySelectorAll('.delete-tag');
    if (bool) {
        deleteButtons.forEach((deleteButton) => {deleteButton.classList.remove('hidden');});
    } else {
        deleteButtons.forEach((deleteButton) => {deleteButton.classList.add('hidden');});
    }
}

async function quoteTags(userId,quoteId,frame,editable) {
    const tagFrame = frame.querySelector('.tag-container');
    if (!tagFrame) {
        console.error("Tag container not found in the frame.");
        return;
    }

    try {
        const tagDict = await QuoteTags(userId, quoteId,'create_at');
        if (!tagDict || !Array.isArray(tagDict.tags)) {
            throw new Error("Invalid tag data");
        }

        tagFrame.innerHTML = ''; // 清空标签容器

        if (tagDict.tags.length === 0) {
            const addTagFrame = document.createElement('div');
            addTagFrame.classList.add('hint')
            addTagFrame.innerHTML = addTagText;
            tagFrame.appendChild(addTagFrame);
            return;
        }

        // 遍历 tags 数组并生成相应的 HTML 元素
        tagDict.tags.forEach(tag => {
            createTag(quoteId,tagFrame,'',tag,tag.editable,editable?tag.editable:false, false,false);
        });

        await showDeleteButton(tagFrame,false)


        // 初始化当前 frame 的弹窗
    } catch (error) {
        console.error("Failed to load or display tags:", error);
    }
}

export async function loadTagButtons(userId, quoteId, frame) {
    await quoteTags(userId,quoteId,frame,true)
    await initFramePopup(userId,quoteId,frame);
}
