// pages/index/index.js
const app = getApp();

Page({
    data: {
        userInfo: {},
        coreSubjects: [
            { name: '语文老师', icon: '📜', desc: '古诗词鉴赏与作文指导' },
            { name: '数学老师', icon: '📐', desc: '思维训练与难题解析' },
            { name: '英语老师', icon: '🇬🇧', desc: '听说读写全面提升' },
            { name: '物理老师', icon: '⚛️', desc: '物理概念与实验模拟' },
            { name: '化学老师', icon: '🧪', desc: '引导式教学，不直接给答案' },
            { name: '生物老师', icon: '🧬', desc: '生命现象探索与实验分析' },
            { name: '政治老师', icon: '⚖️', desc: '时政热点解读与理论框架' },
            { name: '历史老师', icon: '🏛️', desc: '历史事件还原与因果分析' },
            { name: '地理老师', icon: '🗺️', desc: '地图识读与自然人文知识' }
        ],
        languages: [
            { name: '韩语老师', icon: '🇰🇷', desc: '韩语发音与日常对话练习' },
            { name: '日语老师', icon: '🇯🇵', desc: '日语语法与JLPT备考' },
            { name: '俄语老师', icon: '🇷🇺', desc: '俄语基础与文化融入' },
            { name: '德语老师', icon: '🇩🇪', desc: '德语听说与留学准备' },
            { name: '法语老师', icon: '🇫🇷', desc: '法语发音与法式表达' },
            { name: '西班牙语老师', icon: '🇪🇸', desc: '西班牙语发音与拉丁文化探索' }
        ],
        arts: [
            { name: '音乐老师', icon: '🎵', desc: '乐理基础与乐器入门' },
            { name: '美术老师', icon: '🎨', desc: '绘画技法与创意表达' },
            { name: '编导老师', icon: '🎬', desc: '影视编导与短片创作' },
            { name: '体育老师', icon: '⚽', desc: '增肌减脂与运动指导' }
        ],
        support: [
            { name: '心理老师', icon: '💖', desc: '情绪管理与心理疏导' },
            { name: '校医', icon: '🩺', desc: '健康咨询与急救知识' },
            { name: '班主任', icon: '👩‍🏫', desc: '班级管理与学习规划' },
            { name: '留学顾问', icon: '✈️', desc: '海外留学申请指导' },
            { name: '科技老师', icon: '💻', desc: '编程与数字素养' },
            { name: '模拟人生', icon: '🎮', desc: '人生选择模拟与职业探索' }
        ],
        showMedalPopup: false,
        unlockedMedal: null
    },

    onLoad() {
        this.getUserInfo();
    },

    onShow() {
        // 每次回到首页，刷新用户信息
        this.getUserInfo();
        // 每次回到首页，检查是否有新解锁的勋章
        this.checkNewMedals();
    },

    // 触发魔法相机（扫码/拍作业）
    onScanHomework() {
        wx.showActionSheet({
            itemList: ['扫码识别学号', '拍照批改作业'],
            success: (res) => {
                if (res.tapIndex === 0) {
                    wx.scanCode({
                        success: (scanRes) => {
                            wx.showModal({
                                title: '识别成功',
                                content: `学号: ${scanRes.result}\n已成功关联作业，AI老师正在批改中...`,
                                showCancel: false
                            });
                        }
                    });
                } else {
                    wx.showToast({
                        title: '智能批改开发中',
                        icon: 'none'
                    });
                }
            }
        });
    },

    // 勋章解锁逻辑检查
    checkNewMedals() {
        const stats = wx.getStorageSync('study_stats') || { totalCount: 0, teacherCounts: {} };
        const shownMedals = wx.getStorageSync('shown_medals') || [];
        const teacherCounts = stats.teacherCounts || {};
        const teachers = Object.keys(teacherCounts);
        const firstUseDate = wx.getStorageSync('firstUseDate');
        let studyDays = 0;
        if (firstUseDate) {
            studyDays = Math.floor((Date.now() - firstUseDate) / (1000 * 60 * 60 * 24)) + 1;
        }

        const medalLibrary = [
            { id: 'first_chat', name: '初试啼声', icon: '🐣', condition: '累计对话1次', check: (s) => s.totalCount >= 1 },
            { id: 'multidisciplinary', name: '博学好问', icon: '🎓', condition: '咨询3类学科', check: (s) => teachers.length >= 3 },
            { id: 'long_study', name: '持之以恒', icon: '🔥', condition: '累计学习3天', check: (s) => studyDays >= 3 },
            { id: 'lit_lover', name: '文学少年', icon: '📝', condition: '语文对话5次', check: (s) => (teacherCounts['语文老师'] || 0) >= 5 },
            { id: 'science_star', name: '理科之星', icon: '🧪', condition: '理综对话5次', check: (s) => ((teacherCounts['物理老师'] || 0) + (teacherCounts['化学老师'] || 0) + (teacherCounts['生物老师'] || 0)) >= 5 }
        ];

        // 寻找第一个符合条件但从未展示过的勋章
        for (let medal of medalLibrary) {
            if (medal.check(stats) && !shownMedals.includes(medal.id)) {
                // 触发华丽弹窗
                this.setData({
                    unlockedMedal: medal,
                    showMedalPopup: true
                });
                // 标记为已展示
                shownMedals.push(medal.id);
                wx.setStorageSync('shown_medals', shownMedals);
                break; // 每次只跳一个，避免干扰
            }
        }
    },

    // 关闭勋章弹窗
    closeMedalPopup() {
        this.setData({
            showMedalPopup: false
        });
    },

    // 获取用户信息
    getUserInfo() {
        const userInfo = app.globalData.userInfo;
        if (userInfo) {
            this.setData({ userInfo });
        } else {
            // 如果没有用户信息，显示默认头像
            this.setData({
                userInfo: {
                    nickName: '学生',
                    avatarUrl: ''
                }
            });
        }
    },

    // 选择老师
    selectTeacher(e) {
        const teacher = e.currentTarget.dataset.teacher;
        wx.navigateTo({
            url: `/pages/chat/chat?teacher=${encodeURIComponent(teacher)}`
        });
    },

    // 跳转到个人中心
    goToProfile() {
        wx.switchTab({
            url: '/pages/profile/profile'
        });
    }
});
