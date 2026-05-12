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
        const teacherName = decodeURIComponent(options.teacher || '化学老师');
        const teacherConfig = app.globalData.teacherConfig;
        const teacherInfo = teacherConfig[teacherName] || teacherConfig['化学老师'];

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
    },

    // 输入框内容变化
    onInput(e) {
        this.setData({
            inputText: e.detail.value
        });
    },

    // 发送消息
    sendMessage() {
        const { inputText, teacherInfo } = this.data;

        if (!inputText.trim()) {
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
