// pages/profile/profile.js
Page({
    data: {
        userInfo: {
            nickname: '学生用户',
            id: 'student_' + Date.now()
        },
        stats: {
            totalChats: 0,
            totalTeachers: 0,
            studyDays: 0
        }
    },

    onLoad() {
        this.loadUserInfo();
        this.loadStats();
    },

    onShow() {
        // 每次显示页面时刷新统计数据
        this.loadStats();
    },

    // 加载用户信息
    loadUserInfo() {
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({ userInfo });
        }
    },

    // 加载统计数据
    loadStats() {
        // 从本地存储读取统计数据
        const chatHistory = wx.getStorageSync('chatHistory') || [];
        const teachersSet = new Set();

        chatHistory.forEach(item => {
            if (item.teacher) {
                teachersSet.add(item.teacher);
            }
        });

        // 计算学习天数（简化版，基于第一次使用时间）
        const firstUseDate = wx.getStorageSync('firstUseDate');
        let studyDays = 0;
        if (firstUseDate) {
            const days = Math.floor((Date.now() - firstUseDate) / (1000 * 60 * 60 * 24));
            studyDays = days + 1;
        } else {
            wx.setStorageSync('firstUseDate', Date.now());
            studyDays = 1;
        }

        this.setData({
            stats: {
                totalChats: chatHistory.length,
                totalTeachers: teachersSet.size,
                studyDays: studyDays
            }
        });
    },

    // 跳转到对话历史
    goToHistory() {
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });
    },

    // 跳转到学习记录
    goToRecords() {
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });
    },

    // 跳转到收藏问题
    goToFavorites() {
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });
    },

    // 清除缓存
    clearCache() {
        wx.showModal({
            title: '确认清除',
            content: '确定要清除所有缓存数据吗？',
            success: (res) => {
                if (res.confirm) {
                    // 清除聊天历史
                    wx.removeStorageSync('chatHistory');

                    // 刷新统计数据
                    this.loadStats();

                    wx.showToast({
                        title: '清除成功',
                        icon: 'success'
                    });
                }
            }
        });
    },

    // 关于我们
    goToAbout() {
        wx.showModal({
            title: '关于我们',
            content: '智慧学科实验室\n\n一款AI驱动的智能学习助手\n\n版本：v1.0.0',
            showCancel: false
        });
    }
});
