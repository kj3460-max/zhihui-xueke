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
        },
        medals: [
            { id: 'first_chat', name: '初试啼声', icon: '🐣', condition: '累计对话1次', unlocked: false },
            { id: 'multidisciplinary', name: '博学好问', icon: '🎓', condition: '咨询3类学科', unlocked: false },
            { id: 'long_study', name: '持之以恒', icon: '🔥', condition: '累计学习3天', unlocked: false },
            { id: 'lit_lover', name: '文学少年', icon: '📝', condition: '语文对话5次', unlocked: false },
            { id: 'science_star', name: '理科之星', icon: '🧪', condition: '理综对话5次', unlocked: false },
            { id: 'polyglot', name: '语林高手', icon: '🌍', condition: '咨询2门外语', unlocked: false }
        ]
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
        // 从本地存储读取真实统计数据
        const stats = wx.getStorageSync('study_stats') || { totalCount: 0, teacherCounts: {} };
        const teacherCounts = stats.teacherCounts || {};
        const teachersSet = Object.keys(teacherCounts);

        // 计算学习天数
        const firstUseDate = wx.getStorageSync('firstUseDate');
        let studyDays = 0;
        if (firstUseDate) {
            studyDays = Math.floor((Date.now() - firstUseDate) / (1000 * 60 * 60 * 24)) + 1;
        } else {
            wx.setStorageSync('firstUseDate', Date.now());
            studyDays = 1;
        }

        const newStats = {
            totalChats: stats.totalCount,
            totalTeachers: teachersSet.size || teachersSet.length,
            studyDays: studyDays
        };

        this.setData({
            stats: newStats
        });

        // 计算勋章
        this.checkMedals(newStats, teacherCounts);
    },

    // 检查勋章解锁逻辑
    checkMedals(stats, teacherCounts) {
        const medals = this.data.medals;
        const teachers = Object.keys(teacherCounts);

        // 1. 初试啼声
        medals[0].unlocked = stats.totalChats >= 1;

        // 2. 博学好问 (检查分类数量，这里简化为检查老师总数)
        medals[1].unlocked = stats.totalTeachers >= 3;

        // 3. 持之以恒
        medals[2].unlocked = stats.studyDays >= 3;

        // 4. 文学少年 (语文老师次数)
        medals[3].unlocked = (teacherCounts['语文老师'] || 0) >= 5;

        // 5. 理科之星 (物理/化学/生物的总和)
        const scienceCount = (teacherCounts['物理老师'] || 0) + (teacherCounts['化学老师'] || 0) + (teacherCounts['生物老师'] || 0);
        medals[4].unlocked = scienceCount >= 5;

        // 6. 语林高手 (外语老师数量)
        const langTeachers = ['韩语老师', '日语老师', '俄语老师', '德语老师', '法语老师', '英语老师'];
        const userLangCount = teachers.filter(t => langTeachers.includes(t)).length;
        medals[5].unlocked = userLangCount >= 2;

        this.setData({ medals });
    },

    // 跳转到对话历史
    goToHistory() {
        wx.navigateTo({
            url: '/pages/history/history'
        });
    },

    // 跳转到学习记录
    goToRecords() {
        wx.navigateTo({
            url: '/pages/records/records'
        });
    },

    // 跳转到收藏问题
    goToFavorites() {
        wx.navigateTo({
            url: '/pages/favorites/favorites'
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
