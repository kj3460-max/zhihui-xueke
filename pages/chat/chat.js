// pages/chat/chat.js
const app = getApp();

Page({
    data: {
        teacherName: '',
        teacherInfo: {},
        messages: [],
        inputText: '',
        isTyping: false,
        scrollToView: 'bottom',
        currentTime: '',
        conversationId: '' // Dify会话ID
    },

    onLoad(options) {
        // 获取老师名称
        const teacherName = decodeURIComponent(options.teacher || '语文老师');
        const teacherConfig = app.globalData.teacherConfig;
        const teacherInfo = teacherConfig[teacherName] || teacherConfig['语文老师'];

        // 获取当前时间
        const now = new Date();
        const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

        this.setData({
            teacherName,
            teacherInfo,
            currentTime
        });

        // 设置导航栏标题
        wx.setNavigationBarTitle({
            title: teacherName
        });

        // 核心功能：加载本地保存的历史记录
        this.loadChatHistory(teacherName);
    },

    // 加载该老师的历史对话
    loadChatHistory(teacherName) {
        const allHistory = wx.getStorageSync('chat_histories') || {};
        const teacherHistory = allHistory[teacherName] || [];
        const favorites = wx.getStorageSync('favorites') || [];

        // 标记已收藏的消息
        const historyWithFav = teacherHistory.map(msg => {
            return {
                ...msg,
                isFavorite: favorites.some(fav => fav.id === msg.id)
            };
        });

        if (historyWithFav.length > 0) {
            this.setData({
                messages: historyWithFav.slice(-20),
                conversationId: wx.getStorageSync(`conv_id_${teacherName}`) || ''
            });
        }
    },

    // 切换收藏状态
    toggleFavorite(e) {
        const { id, content } = e.currentTarget.dataset;
        const messages = this.data.messages;
        const favorites = wx.getStorageSync('favorites') || [];

        const msgIndex = messages.findIndex(m => m.id === id);
        if (msgIndex === -1) return;

        const isFavorite = !messages[msgIndex].isFavorite;

        // 更新页面显示
        const key = `messages[${msgIndex}].isFavorite`;
        this.setData({ [key]: isFavorite });

        if (isFavorite) {
            // 添加到收藏列表
            const favoriteItem = {
                id,
                content,
                teacher: this.data.teacherName,
                icon: this.data.teacherInfo.icon,
                time: new Date().getTime(),
                dateStr: new Date().toLocaleDateString()
            };
            favorites.unshift(favoriteItem);
            wx.showToast({ title: '已加入收藏', icon: 'success' });
        } else {
            // 从收藏中移除
            const favIndex = favorites.findIndex(f => f.id === id);
            if (favIndex > -1) favorites.splice(favIndex, 1);
            wx.showToast({ title: '已取消收藏', icon: 'none' });
        }

        wx.setStorageSync('favorites', favorites);

        // 同时更新 chat_histories 中的状态（可选，为了持久化标记）
        const allHistory = wx.getStorageSync('chat_histories') || {};
        const teacherHistory = allHistory[this.data.teacherName] || [];
        const historyMsgIndex = teacherHistory.findIndex(m => m.id === id);
        if (historyMsgIndex > -1) {
            teacherHistory[historyMsgIndex].isFavorite = isFavorite;
            allHistory[this.data.teacherName] = teacherHistory;
            wx.setStorageSync('chat_histories', allHistory);
        }
    },

    // 保存对话到本地
    saveToHistory(message) {
        const teacherName = this.data.teacherName;
        const allHistory = wx.getStorageSync('chat_histories') || {};
        const teacherHistory = allHistory[teacherName] || [];

        teacherHistory.push(message);

        // 限制存储容量，每个老师存50条
        if (teacherHistory.length > 50) {
            teacherHistory.shift();
        }

        allHistory[teacherName] = teacherHistory;
        wx.setStorageSync('chat_histories', allHistory);

        // 顺便保存会话ID
        if (this.data.conversationId) {
            wx.setStorageSync(`conv_id_${teacherName}`, this.data.conversationId);
        }

        // 同步更新统计数据（不显式展示聊天内容，只记次数）
        this.updateStats();
    },

    // 更新学习统计
    updateStats() {
        let stats = wx.getStorageSync('study_stats') || { totalCount: 0, teacherCounts: {} };
        stats.totalCount += 1;
        stats.teacherCounts[this.data.teacherName] = (stats.teacherCounts[this.data.teacherName] || 0) + 1;
        wx.setStorageSync('study_stats', stats);
    },

    // 输入框内容变化
    onInput(e) {
        this.setData({
            inputText: e.detail.value
        });
    },

    // 发送消息
    sendMessage() {
        const { inputText, isTyping } = this.data;

        if (!inputText.trim() || isTyping) {
            return;
        }

        // 添加用户消息
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputText.trim(),
            time: this.getCurrentTime()
        };

        this.setData({
            messages: [...this.data.messages, userMessage],
            inputText: '',
            isTyping: true,
            scrollToView: 'bottom'
        });

        // 保存用户消息到本地历史
        this.saveToHistory(userMessage);

        // 调用Dify API
        this.callDifyAPI(inputText.trim());
    },

    // 调用Dify API
    callDifyAPI(query) {
        const { teacherInfo, conversationId } = this.data;

        wx.request({
            url: 'http://122.51.174.96/v1/chat-messages',
            method: 'POST',
            header: {
                'Authorization': `Bearer ${teacherInfo.apiKey}`,
                'Content-Type': 'application/json'
            },
            data: {
                inputs: {},
                query: query,
                user: getApp().globalData.userId || 'student',
                response_mode: 'blocking',
                conversation_id: conversationId || ''
            },
            success: (res) => {
                console.log('=== API完整响应 ===');
                console.log('状态码:', res.statusCode);
                console.log('返回数据:', JSON.stringify(res.data, null, 2));
                console.log('==================');

                if (res.statusCode === 200 && res.data && res.data.answer) {
                    const aiMessage = {
                        id: Date.now(),
                        role: 'assistant',
                        content: this.formatMarkdown(res.data.answer), // 解析Markdown
                        rawContent: res.data.answer,
                        time: this.getCurrentTime()
                    };

                    // 保存并更新会话ID
                    if (res.data.conversation_id) {
                        this.setData({
                            conversationId: res.data.conversation_id
                        });
                    }

                    this.setData({
                        messages: [...this.data.messages, aiMessage],
                        isTyping: false,
                        scrollToView: 'bottom'
                    });

                    // 保存AI回复到本地历史
                    this.saveToHistory(aiMessage);
                } else if (res.statusCode === 404 && conversationId) {
                    // 核心改进：会话失效时自动清空ID并重试
                    console.warn('检测到会话ID已失效，尝试自动开启新会话...');
                    this.setData({
                        conversationId: ''
                    }, () => {
                        this.callDifyAPI(query);
                    });
                } else {
                    console.error('响应异常:', res);
                    this.showError('AI老师暂时开小差了，请稍后再试');
                }
            },
            fail: (error) => {
                console.error('网络请求失败:', error);
                this.showError('网络连接失败，请检查设置');
            }
        });
    },

    // 简易Markdown解析器，支持加粗和换行
    formatMarkdown(text) {
        if (!text) return '';
        let html = text
            // 处理加粗 **text** -> <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold; color: #2d3748; margin: 0 4rpx;">$1</strong>')
            // 处理换行 \n -> <br/>
            .replace(/\n/g, '<br/>');
        return html;
    },

    // 显示错误消息
    showError(errorText) {
        const errorMessage = {
            id: Date.now(),
            role: 'assistant',
            content: `抱歉，${errorText} 😔`,
            time: this.getCurrentTime()
        };

        this.setData({
            messages: [...this.data.messages, errorMessage],
            isTyping: false,
            scrollToView: 'bottom'
        });

        wx.showToast({
            title: errorText,
            icon: 'none',
            duration: 2000
        });
    },

    // 获取当前时间
    getCurrentTime() {
        const now = new Date();
        return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    },

    // 返回上一页
    goBack() {
        wx.navigateBack();
    }
});
