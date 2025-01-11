import { getUserOwnTags, CreatTag, BindTag, QuoteTags } from "/static/js/api/tag_api.js";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM fully loaded and parsed.");

    // 动态绑定事件到 'Get User Tags' 按钮
    const getUserTagsButton = document.getElementById('get-user-tags-button');
    getUserTagsButton.addEventListener('click', async () => {
        const userId = document.getElementById("user-id").value;
        console.log(userId);
        if (!userId) {
            alert("Please provide a valid User ID.");
            return;
        }

        try {
            // 调用 API 获取用户标签
            const data = await getUserOwnTags(userId,'');

            // 更新页面显示
            document.getElementById("get-user-tags-response").innerText = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error("Error fetching user tags:", error);
            document.getElementById("get-user-tags-response").innerText = "Failed to fetch user tags.";
        }
    });

    // 动态绑定事件到 'Create Tag' 按钮
    const createTagButton = document.getElementById('create-tag-button');
    createTagButton.addEventListener('click', async () => {
        const userId = document.getElementById('create-user-id').value;
        const tagId = document.getElementById('create-tag-id').value;
        const displayName = document.getElementById('create-display-name').value;
        const workspaceId = document.getElementById('create-workspace-id').value;
        const relatedFilmId = document.getElementById('create-related-film-id').value;

        console.log("Creating tag with data:", { userId, tagName: tagId, displayName, workspaceId, relatedFilmId });

        // 校验输入
        if (!userId || !tagId || !displayName) {
            alert("User ID, Tag ID, and Display Name are required.");
            return;
        }

        try {
            // 调用 API 创建标签
            const response = await CreatTag(
                userId,
                tagId,
                displayName,
                workspaceId || "", // 如果为空，则传递空字符串
                relatedFilmId || "" // 如果为空，则传递空字符串
            );

            // 更新页面显示
            document.getElementById("create-tag-response").innerText = JSON.stringify(response, null, 2);
        } catch (error) {
            console.error("Error creating tag:", error);
            document.getElementById("create-tag-response").innerText = "Failed to create tag.";
        }
    });

    const getQuoteTagsButton = document.getElementById("get-quote-tags-button");
    getQuoteTagsButton.addEventListener("click", async () => {
        const userId = document.getElementById("user_id_tags").value;
        const quoteId = document.getElementById("quote_id_tags").value;

        console.log("Fetching tags for quote with data:", { userId, quoteId });

        // 校验输入
        if (!userId || !quoteId) {
            alert("User ID and Quote ID are required.");
            return;
        }

        try {
            const response = await QuoteTags(userId, quoteId);

            document.getElementById("get-quote-tags-response").innerText = JSON.stringify(response, null, 2);
        } catch (error) {
            console.error("Error fetching tags for quote:", error);
            document.getElementById("get-quote-tags-response").innerText = "Failed to fetch tags.";
        }

    });

    const bindTagButton = document.getElementById('bind-tag-button');
    bindTagButton.addEventListener('click', async () => {
        const userId = document.getElementById("user_id").value;
        const tagId = document.getElementById("tag_id").value;
        const quoteId = document.getElementById("quote_id").value;
        if (!userId || !quoteId || !tagId) {
            alert("User ID and Quote ID are required.");
            return;
        }

        try {
            const response = await BindTag(userId, tagId ,quoteId);

            document.getElementById("bind-tag-response").innerText = JSON.stringify(response, null, 2);
        } catch (error) {
            console.error("Error fetching tags for quote:", error);
            document.getElementById("bind-tag-response").innerText = "Failed to fetch tags.";
        }


    })

});