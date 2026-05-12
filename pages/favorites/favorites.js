Page({
    data: {
        favorites: []
    },

    onShow() {
        this.refreshFavorites();
    },

    refreshFavorites() {
        const favorites = wx.getStorageSync('favorites') || [];
        // 为每个收藏项进行Markdown格式化处理（用于显示）
        const formatted = favorites.map(item => {
            return {
                ...item,
                displayContent: this.formatMarkdown(item.content)
            };
        });
        this.setData({ favorites: formatted });
    },

    removeFavorite(e) {
        const { id } = e.currentTarget.dataset;
        wx.showModal({
            title: '取消收藏',
            content: '确定要将这条内容移出收藏夹吗？',
            success: (res) => {
                if (res.confirm) {
                    let favorites = wx.getStorageSync('favorites') || [];
                    favorites = favorites.filter(f => f.id !== id);
                    wx.setStorageSync('favorites', favorites);

                    // 同时同步 chat_histories 中的状态
                    this.syncChatHistory(id);

                    this.refreshFavorites();
                    wx.showToast({ title: '已移除', icon: 'success' });
                }
            }
        });
    },

    // 同步更新历史记录中的收藏状态
    syncChatHistory(id) {
        const allHistory = wx.getStorageSync('chat_histories') || {};
        Object.keys(allHistory).forEach(teacherName => {
            const history = allHistory[teacherName];
            const index = history.findIndex(m => m.id === id);
            if (index > -1) {
                history[index].isFavorite = false;
                allHistory[teacherName] = history;
            }
        });
        wx.setStorageSync('chat_histories', allHistory);
    },

    formatMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #6366f1;">$1</strong>')
            .replace(/\n/g, '<br/>');
    }
});
