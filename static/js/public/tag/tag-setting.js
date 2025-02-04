import {getColors, changeColor} from "../../api/color_api.js";
import {RenameTag, DeleteTag} from "../../api/tag_api.js"
import {hexToRgbA} from "../../tools/convert.js"
import { enableScroll, disableScroll } from "../../tools/browser.js";

let currentColorId = 0
let tagName = '';
const tick = '<svg role="graphics-symbol" viewBox="0 0 16 16" class="thinCheck" style="width: 14px; height: 100%; flex-shrink: 0;"><path d="M6.385 14.162c.362 0 .642-.15.84-.444L13.652 3.71c.144-.226.205-.417.205-.602 0-.485-.341-.82-.833-.82-.335 0-.54.123-.746.444l-5.926 9.4-3.042-3.903c-.205-.267-.417-.376-.718-.376-.492 0-.848.348-.848.827 0 .212.075.417.253.629l3.541 4.416c.24.3.492.437.848.437z"></path></svg>'

function showCustomAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.style.position = 'fixed';
    alertBox.style.top = '50%';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translate(-50%, -50%)';
    alertBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    alertBox.style.color = 'white';
    alertBox.style.padding = '20px';
    alertBox.style.borderRadius = '5px';
    alertBox.style.textAlign = 'center';
    alertBox.style.zIndex = '99999';
    alertBox.innerText = message;

    document.body.appendChild(alertBox);

    // 自动关闭弹框
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}

export function renameSettingTag(userId, tagId) {
    const input = document.querySelector('.tag-name-edit-input');

    // 检查新名称是否为空
    if (!input.value) {
        // 使用自定义提示框
        showCustomAlert("Please type a value.");
        input.value = tagName;
        input.focus();
        return false; // 终止函数执行
    }

    // 调用 renameTag 函数
    RenameTag(userId, tagId, input.value);
    // 更新所有相关的标签
    const tags = document.querySelectorAll(`div[tag-id="${tagId}"]`);
    tags.forEach(div => {
        div.querySelector('.tag-name').textContent = input.value;
        div.setAttribute('new-name',input.value);
    });
    return true
}

function tagNameEditing(userId,tagId,frame,tagName,onClose){
    console.log('tagName',tagName);
    const input = document.createElement('input');
    input.classList.add('form-control','tag-name-edit-input');
    input.value = tagName;
    frame.appendChild(input);

    requestAnimationFrame(() => {
        console.log('focus')
        input.focus();
    });

    input.addEventListener('keydown',(event)=>{
        if (event.key === 'Enter') {
            if (renameSettingTag(userId,tagId)){
                frame.innerHTML = '';
                frame.zIndex = '0'
                frame.style.display = 'none';
                frame.setAttribute('able-close',true)
                onClose()
            }
        }
    })
}

function showCustomConfirm(message, onConfirm) {
    disableScroll()
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay','none-event')
    const confirmBox = document.createElement('div');
    confirmBox.style.position = 'fixed';
    confirmBox.style.top = '50%';
    confirmBox.style.left = '50%';
    confirmBox.style.transform = 'translate(-50%, -50%)';
    confirmBox.style.backgroundColor = '#fff';
    confirmBox.style.padding = '20px';
    confirmBox.style.borderRadius = '8px';
    confirmBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    confirmBox.style.zIndex = 1001;
    confirmBox.style.width = '300px';
    confirmBox.style.textAlign = 'Center';

    confirmBox.innerHTML = `
        <div>${message}</div>
        <div class="mt-2 btn btn-light-red" id="confirm-yes" style="width:100%">Delete</div>
        <div class="mt-2 btn btn-light-grey" id="confirm-no" style="width:100%">Cancel</div>
    `;
    document.body.appendChild(overlay)
    document.body.appendChild(confirmBox);

    document.getElementById('confirm-yes').addEventListener('click', () => {
        enableScroll()
        onConfirm();
        overlay.remove()
        confirmBox.remove();
    });
    document.getElementById('confirm-no').addEventListener('click', () => {
        enableScroll()
        overlay.remove()
        confirmBox.remove();
    });
}


export function deleteTag(userId, tagId, frame) {
    const deleteBtnFrame = document.createElement('div');
    deleteBtnFrame.classList.add('tag-setting-menu-btn', 'd-flex');
    deleteBtnFrame.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; margin-left: 10px; margin-right: 4px;">
            <div style="display: flex; align-items: center; justify-content: center;">
                <svg role="graphics-symbol" viewBox="0 0 16 16" class="trash" style="width: 16px; height: 16px; display: block; fill: rgba(55, 53, 47, 0.85); flex-shrink: 0;">
                    <path d="M4.8623 15.4287H11.1445C12.1904 15.4287 12.8672 14.793 12.915 13.7402L13.3799 3.88965H14.1318C14.4736 3.88965 14.7402 3.62988 14.7402 3.28809C14.7402 2.95312 14.4736 2.69336 14.1318 2.69336H11.0898V1.66797C11.0898 0.62207 10.4268 0 9.29199 0H6.69434C5.56641 0 4.89648 0.62207 4.89648 1.66797V2.69336H1.86133C1.5332 2.69336 1.25977 2.95312 1.25977 3.28809C1.25977 3.62988 1.5332 3.88965 1.86133 3.88965H2.62012L3.08496 13.7471C3.13281 14.7998 3.80273 15.4287 4.8623 15.4287ZM6.1543 1.72949C6.1543 1.37402 6.40039 1.14844 6.7832 1.14844H9.20312C9.58594 1.14844 9.83203 1.37402 9.83203 1.72949V2.69336H6.1543V1.72949ZM4.99219 14.2188C4.61621 14.2188 4.34277 13.9453 4.32227 13.542L3.86426 3.88965H12.1152L11.6709 13.542C11.6572 13.9453 11.3838 14.2188 10.9941 14.2188H4.99219ZM5.9834 13.1182C6.27051 13.1182 6.45508 12.9336 6.44824 12.667L6.24316 5.50293C6.23633 5.22949 6.04492 5.05176 5.77148 5.05176C5.48438 5.05176 5.2998 5.23633 5.30664 5.50293L5.51172 12.667C5.51855 12.9404 5.70996 13.1182 5.9834 13.1182ZM8 13.1182C8.28711 13.1182 8.47852 12.9336 8.47852 12.667V5.50293C8.47852 5.23633 8.28711 5.05176 8 5.05176C7.71289 5.05176 7.52148 5.23633 7.52148 5.50293V12.667C7.52148 12.9336 7.71289 13.1182 8 13.1182ZM10.0166 13.1182C10.29 13.1182 10.4746 12.9404 10.4814 12.667L10.6934 5.50293C10.7002 5.23633 10.5088 5.05176 10.2285 5.05176C9.95508 5.05176 9.76367 5.22949 9.75684 5.50293L9.54492 12.667C9.53809 12.9336 9.72949 13.1182 10.0166 13.1182Z"></path>
                </svg>
            </div>
        </div>
        <div style="padding-left:4px">
            Delete
        </div>
    `;
    deleteBtnFrame.addEventListener('click', () => {
        showCustomConfirm(
            "Are you sure you want to delete this option?",
            () => {
                // 确认删除
                DeleteTag(userId, tagId);
                document.querySelector('.tag-setting-popup').remove();
                document.querySelector('.tag-setting').remove();
                const tags = document.querySelectorAll(`div[tag="${tagId}"]`);
                tags.forEach(div => {
                    div.remove();
                });
            },
        );
    });

    frame.appendChild(deleteBtnFrame);
}

function selectColor(frame,selectedFrame, tagId,colorId,color_code) {
    frame.querySelector('.show').classList.remove('show');
    selectedFrame.querySelector('.color-tick').classList.add('show');
    const tags = document.querySelectorAll(`div[tag-id="${tagId}"]`);
    changeColor(userId,tagId,colorId)
    tags.forEach(div =>{
        console.log(div);
        div.style.background = `#${color_code}`;
        div.style.borderColor = hexToRgbA(color_code,1,30);
    });
}

async function defaultColorSelection(userId,tagId,fatherFrame,colorList) {
    const hint = document.createElement('div');
    hint.classList.add('hint')
    hint.innerText = 'Colors';
    fatherFrame.appendChild(hint);
    for (let color of colorList.default) {
        const colorFrame = document.createElement('div');
        const colorSimple = document.createElement('div');
        const colorText = document.createElement('div')

        colorSimple.classList.add('color-simple','ms-2','me-2');
        colorSimple.style.background = `#${color.color_code}`;
        colorSimple.style.borderColor = hexToRgbA(color.color_code,1,30);

        colorText.innerHTML = color.color_name;


        colorFrame.appendChild(colorSimple);
        colorFrame.appendChild(colorText);
        colorFrame.classList.add('default-color-selection','d-flex');

        const colorTickFrame = document.createElement('div');
        colorTickFrame.innerHTML = tick;
        colorTickFrame.classList.add('color-tick');

        if (color.id === currentColorId){
            colorTickFrame.classList.add('show')
        }

        colorFrame.appendChild(colorTickFrame);
        fatherFrame.appendChild(colorFrame);

        colorFrame.addEventListener('click',() =>{
            selectColor(fatherFrame,colorFrame,tagId,color.id,color.color_code)
        });

    }
}

function divider(fatherFrame){
    const div = document.createElement('hr')
    fatherFrame.appendChild(div)
}

function switchWorkspace(userId,tagId,fatherFrame){
    const switchWorkspaceBtnFrame = document.createElement('div')
    switchWorkspaceBtnFrame.classList.add('tag-setting-menu-btn','d-flex')
    switchWorkspaceBtnFrame.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; margin-left: 10px; margin-right: 4px;">
            <div style="display: flex; align-items: center; justify-content: center;">
                <svg role="graphics-symbol" viewBox="0 0 20 20" class="settingsWorkspace" style="width: 16px; height: 16px; display: block; flex-shrink: 0;fill: rgba(55, 53, 47, 0.85)">
                    <path d="M11.757 16.94v-1.333h4.812q.178 0 .267-.088.09-.09.089-.267v-7.95q0-.179-.09-.267-.087-.09-.266-.089h-4.327V5.62h4.703q.609 0 .957.383.35.376.349 1.032v8.484q0 .655-.349 1.039-.348.382-.957.382zm2.659-7.417q-.219 0-.219-.225V8.252q0-.232.219-.232h1.08q.226 0 .226.232v1.046q0 .225-.226.225zm0 2.53q-.219 0-.219-.233v-1.046q0-.232.219-.232h1.08q.226 0 .226.232v1.046q0 .233-.226.233zm0 2.522q-.219 0-.219-.232v-1.046q0-.226.219-.226h1.08q.226 0 .226.226v1.046q0 .232-.226.232zm-12.674.944V3.624q0-.663.349-1.039.349-.383.964-.383h8.627q.607 0 .957.383.355.376.355 1.039v11.895q0 .655-.355 1.039-.35.382-.957.382H3.055q-.616 0-.964-.382-.35-.384-.349-1.04Zm1.333-.267q0 .177.09.267.087.088.266.088h7.875q.177 0 .266-.088.09-.09.09-.267V3.897q0-.185-.09-.273-.089-.09-.266-.089H3.43q-.179 0-.267.089-.09.09-.089.273v11.355Zm1.853.991v-2.618q0-.437.205-.65.205-.218.622-.218H8.98q.417 0 .623.219.204.21.205.649v2.618h-1.04v-2.27q0-.204-.211-.204h-2.38q-.21 0-.211.205v2.27h-1.04Zm.198-9.755q-.26 0-.26-.273V4.943q0-.273.26-.273h1.306q.273 0 .273.273v1.272q0 .273-.273.273zm3.172 0q-.267 0-.267-.273V4.943q0-.273.267-.273h1.306q.266 0 .266.273v1.272q0 .273-.266.273zM5.126 9.106q-.26 0-.26-.273V7.568q0-.273.26-.273h1.306q.273 0 .273.273v1.265q0 .273-.273.273zm3.172 0q-.267 0-.267-.273V7.568q0-.273.267-.273h1.306q.266 0 .266.273v1.265q0 .273-.266.273zm-3.172 2.625q-.26 0-.26-.28v-1.264q0-.274.26-.274h1.306q.273 0 .273.274v1.264q0 .28-.273.28zm3.172 0q-.267 0-.267-.28v-1.264q0-.274.267-.274h1.306q.266 0 .266.274v1.264q0 .28-.266.28z"></path>
                </svg>
            </div>
        </div>
        <div style="padding-left:4px">
            Belonging
        </div>
    `
    fatherFrame.appendChild(switchWorkspaceBtnFrame);
}


export async function createTagSetting(userId,tag,fatherFrame,onClose) {
    currentColorId = tag.color_id;
    tagName = document.querySelector(`div[tag-id="${tag.id}"]`).innerText

    const colors = await getColors(userId);
    const colorFrame = document.createElement('div')
    colorFrame.classList.add('color-selections')

    tagNameEditing(userId,tag.id,fatherFrame,tagName,onClose);

    deleteTag(userId,tag.id,fatherFrame)

    // switchWorkspace(userId,tag.id,fatherFrame)

    divider(fatherFrame);

    await defaultColorSelection(userId,tag.id,colorFrame, colors.colorList,);

    fatherFrame.appendChild(colorFrame);
}

