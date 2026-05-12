const app = getApp();

Page({
    data: {
        historyList: []
    },

    onShow() {
        this.loadHistory();
    },

    loadHistory() {
        const chatHistories = wx.getStorageSync('chat_histories') || {};
        const teacherConfig = app.globalData.teacherConfig;
        let list = [];

        Object.keys(chatHistories).forEach(name => {
            const messages = chatHistories[name];
            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                // 过滤掉HTML标签
                let cleanMsg = (lastMsg.rawContent || lastMsg.content || '').replace(/<[^>]+>/g, '');

                list.push({
                    name: name,
                    icon: teacherConfig[name]?.icon || '👨‍🏫',
                    color: teacherConfig[name]?.color || '#6366f1',
                    lastMsg: cleanMsg,
                    time: lastMsg.id, // 用ID作为时间戳排序
                    displayTime: this.timeFormat(lastMsg.id)
                });
            }
        });

        // 按时间倒序排列
        list.sort((a, b) => b.time - a.time);
        this.setData({ historyList: list });
    },

    goToChat(e) {
        const name = e.currentTarget.dataset.name;
        wx.navigateTo({
            url: `/pages/chat/chat?teacher=${encodeURIComponent(name)}`
        });
    },

    timeFormat(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        if (now.toDateString() === date.toDateString()) {
            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
});
