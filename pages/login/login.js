const app = getApp();

Page({
    data: {
        nickname: '',
        studentId: '',
        selectedGrade: '',
        grades: ['高一', '高二', '高三', '初三', '初二', '初一'],
        canSubmit: false
    },

    onNameInput(e) {
        this.setData({ nickname: e.detail.value });
        this.checkForm();
    },

    onIdInput(e) {
        this.setData({ studentId: e.detail.value });
        this.checkForm();
    },

    selectGrade(e) {
        this.setData({ selectedGrade: e.currentTarget.dataset.val });
        this.checkForm();
    },

    checkForm() {
        this.setData({
            canSubmit: this.data.nickname.trim().length > 0 &&
                this.data.studentId.trim().length > 0 &&
                this.data.selectedGrade.length > 0
        });
    },

    onSubmit() {
        if (!this.data.canSubmit) return;

        const userInfo = {
            nickname: this.data.nickname.trim(),
            studentId: this.data.studentId.trim(),
            grade: this.data.selectedGrade,
            avatarUrl: '', // 默认头像
            id: 'student_' + this.data.studentId.trim()
        };

        // 保存到全局和本地
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('isRegistered', true);

        wx.showToast({
            title: '欢迎入学！',
            icon: 'success',
            duration: 1500,
            success: () => {
                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                }, 1500);
            }
        });
    }
});
