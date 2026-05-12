const app = getApp();

Page({
    data: {
        totalCount: 0,
        activeSubjects: 0,
        currentLevel: { name: '初入校门', icon: '🌱' },
        subjectsWithData: [],
        currentDate: '',
        aiAdvice: ''
    },

    onShow() {
        this.setData({
            currentDate: new Date().toLocaleDateString()
        });
        this.processStats();
    },

    processStats() {
        const stats = wx.getStorageSync('study_stats') || { totalCount: 0, teacherCounts: {} };
        const teacherCounts = stats.teacherCounts || {};
        const teacherConfig = app.globalData.teacherConfig;
        const teachers = Object.keys(teacherCounts);

        // 1. 计算学科数据
        let subjectData = teachers.map(name => {
            const count = teacherCounts[name];
            const config = teacherConfig[name] || { icon: '👨‍🏫', color: '#6366f1' };

            // 计算等级
            let levelName = '初学者';
            if (count >= 20) levelName = '大师';
            else if (count >= 10) levelName = '专家';
            else if (count >= 5) levelName = '进阶';
            else if (count >= 2) levelName = '探索者';

            return {
                name,
                count,
                icon: config.icon,
                color: config.color || '#6366f1',
                levelName,
                percent: Math.min(100, (count / 20) * 100) // 假设20次是满条
            };
        });

        // 按次数排序
        subjectData.sort((a, b) => b.count - a.count);

        // 2. 计算当前总段位
        let totalLevel = { name: '初学乍练', icon: '🌱' };
        if (stats.totalCount >= 100) totalLevel = { name: '学究天人', icon: '🏔️' };
        else if (stats.totalCount >= 50) totalLevel = { name: '博学多才', icon: '📚' };
        else if (stats.totalCount >= 20) totalLevel = { name: '渐入佳境', icon: '✨' };
        else if (stats.totalCount >= 5) totalLevel = { name: '小有所成', icon: '🏅' };

        // 3. 生成AI分析建议
        let advice = '你刚开启智慧之旅！建议先和班主任聊聊，制定一个学习计划。';
        if (subjectData.length > 0) {
            const topSubject = subjectData[0].name;
            if (subjectData.length === 1) {
                advice = `你最近对${topSubject}非常专注！可以尝试咨询其他学科，全面发展也不错哦。`;
            } else {
                advice = `看来你最近是${topSubject}的铁粉！目前你在${subjectData.length}个领域都有探索，保持这个好奇心！`;
            }
        }

        this.setData({
            totalCount: stats.totalCount,
            activeSubjects: teachers.length,
            subjectsWithData: subjectData,
            currentLevel: totalLevel,
            aiAdvice: advice
        });
    }
});
