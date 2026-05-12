// app.js
App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
      });
    }

    // 修复关键：生成并持久化一个唯一的本地用户ID
    let userId = wx.getStorageSync('userId');
    if (!userId) {
      userId = 'stu_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      wx.setStorageSync('userId', userId);
    }
    this.globalData.userId = userId;

    // 获取用户信息
    this.getUserInfo();

    // 检查注册状态
    const isRegistered = wx.getStorageSync('isRegistered');
    if (!isRegistered) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  },

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  globalData: {
    userInfo: null,
    // 25位老师配置（已配置API Key）
    teacherConfig: {
      '语文老师': { icon: '📜', color: '#ef4444', apiKey: 'YOUR_API_KEY_HERE' },
      '数学老师': { icon: '📐', color: '#3b82f6', apiKey: 'YOUR_API_KEY_HERE' },
      '英语老师': { icon: '🇬🇧', color: '#a855f7', apiKey: 'YOUR_API_KEY_HERE' },
      '物理老师': { icon: '⚛️', color: '#06b6d4', apiKey: 'YOUR_API_KEY_HERE' },
      '化学老师': { icon: '🧪', color: '#10b981', apiKey: 'YOUR_API_KEY_HERE' },
      '生物老师': { icon: '🧬', color: '#22c55e', apiKey: 'YOUR_API_KEY_HERE' },
      '政治老师': { icon: '⚖️', color: '#f59e0b', apiKey: 'YOUR_API_KEY_HERE' },
      '历史老师': { icon: '🏛️', color: '#eab308', apiKey: 'YOUR_API_KEY_HERE' },
      '地理老师': { icon: '🗺️', color: '#14b8a6', apiKey: 'YOUR_API_KEY_HERE' },
      '韩语老师': { icon: '🇰🇷', color: '#ec4899', apiKey: 'YOUR_API_KEY_HERE' },
      '日语老师': { icon: '🇯🇵', color: '#ef4444', apiKey: 'YOUR_API_KEY_HERE' },
      '俄语老师': { icon: '🇷🇺', color: '#3b82f6', apiKey: 'YOUR_API_KEY_HERE' },
      '德语老师': { icon: '🇩🇪', color: '#374151', apiKey: 'YOUR_API_KEY_HERE' },
      '法语老师': { icon: '🇫🇷', color: '#4f46e5', apiKey: 'YOUR_API_KEY_HERE' },
      '音乐老师': { icon: '🎵', color: '#a855f7', apiKey: 'YOUR_API_KEY_HERE' },
      '美术老师': { icon: '🎨', color: '#f97316', apiKey: 'YOUR_API_KEY_HERE' },
      '编导老师': { icon: '🎬', color: '#4b5563', apiKey: 'YOUR_API_KEY_HERE' },
      '体育老师': { icon: '⚽', color: '#059669', apiKey: 'YOUR_API_KEY_HERE' },
      '心理老师': { icon: '🧠', color: '#6366f1', apiKey: 'YOUR_API_KEY_HERE' },
      '校医': { icon: '🩺', color: '#ef4444', apiKey: 'YOUR_API_KEY_HERE' },
      '班主任': { icon: '👩‍🏫', color: '#3b82f6', apiKey: 'YOUR_API_KEY_HERE' },
      '留学顾问': { icon: '✈️', color: '#0ea5e9', apiKey: 'YOUR_API_KEY_HERE' },
      '科技老师': { icon: '💻', color: '#4b5563', apiKey: 'YOUR_API_KEY_HERE' },
      '模拟人生': { icon: '🎮', color: '#a855f7', apiKey: 'YOUR_API_KEY_HERE' }
    }
  }
});
