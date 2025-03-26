// 配置marked选项
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

// 状态管理
const state = {
    messages: [],
    history: [],
    isGenerating: false,
    currentSession: null
};

// DOM元素
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const chatHistory = document.getElementById('chatHistory');

// 命令系统
const commands = {
    '/clear': () => {
        state.messages = [];
        renderMessages();
    },
    '/export': () => {
        const text = state.messages.map(msg => 
            `${msg.type === 'user' ? '用户' : 'AI'}: ${msg.content}`
        ).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat-history.txt';
        a.click();
        URL.revokeObjectURL(url);
    },
    '/help': () => {
        addMessage('系统', '可用命令：\n/clear - 清空对话\n/export - 导出对话记录\n/help - 显示帮助信息', 'ai');
    }
};

// 消息处理
function addMessage(content, type) {
    const message = {
        content,
        type,
        timestamp: new Date().toLocaleTimeString()
    };
    state.messages.push(message);
    renderMessages();
    saveToHistory();
}

function renderMessages() {
    chatMessages.innerHTML = state.messages.map(msg => `
        <div class="message ${msg.type}">
            <div class="message-content">${marked.parse(msg.content)}</div>
            <div class="timestamp">${msg.timestamp}</div>
        </div>
    `).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 历史记录管理
function saveToHistory() {
    const session = {
        id: Date.now(),
        messages: [...state.messages],
        lastUpdated: new Date().toLocaleString()
    };
    state.history.push(session);
    renderHistory();
    localStorage.setItem('chatHistory', JSON.stringify(state.history));
}

function renderHistory() {
    chatHistory.innerHTML = state.history.map(session => `
        <div class="history-item p-2 hover:bg-gray-100 cursor-pointer rounded" 
             onclick="loadSession(${session.id})">
            <div class="text-sm font-medium">会话 ${new Date(session.id).toLocaleString()}</div>
            <div class="text-xs text-gray-500">${session.lastUpdated}</div>
        </div>
    `).join('');
}

function loadSession(sessionId) {
    const session = state.history.find(s => s.id === sessionId);
    if (session) {
        state.messages = [...session.messages];
        renderMessages();
    }
}

// 命令面板
function showCommandPanel() {
    const panel = document.createElement('div');
    panel.className = 'command-panel active';
    panel.innerHTML = Object.keys(commands).map(cmd => `
        <div class="command-item" onclick="executeCommand('${cmd}')">
            ${cmd}
        </div>
    `).join('');
    userInput.parentNode.appendChild(panel);
}

function hideCommandPanel() {
    const panel = document.querySelector('.command-panel');
    if (panel) panel.remove();
}

function executeCommand(cmd) {
    if (commands[cmd]) {
        commands[cmd]();
        hideCommandPanel();
        userInput.value = '';
    }
}

// 事件监听
userInput.addEventListener('input', (e) => {
    if (e.target.value.startsWith('/')) {
        showCommandPanel();
    } else {
        hideCommandPanel();
    }
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

// 发送消息
async function sendMessage() {
    const content = userInput.value.trim();
    if (!content) return;

    addMessage(content, 'user');
    userInput.value = '';
    hideCommandPanel();

    // 显示加载动画
    loadingIndicator.classList.remove('hidden');
    state.isGenerating = true;

    try {
        // 模拟AI响应
        await simulateAIResponse(content);
    } catch (error) {
        addMessage('抱歉，发生了一些错误，请稍后重试。', 'ai');
    } finally {
        loadingIndicator.classList.add('hidden');
        state.isGenerating = false;
    }
}

// 模拟AI响应
async function simulateAIResponse(content) {
    // 这里替换为实际的AI API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    addMessage('这是一个模拟的AI响应。在实际应用中，这里将连接到真实的AI服务。', 'ai');
}

// 初始化
function init() {
    // 加载历史记录
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        state.history = JSON.parse(savedHistory);
        renderHistory();
    }
}

// 启动应用
init();

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加滚动动画
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 导航栏滚动效果
    let lastScroll = 0;
    const nav = document.querySelector('nav');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            nav.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
            // 向下滚动
            nav.classList.remove('scroll-up');
            nav.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
            // 向上滚动
            nav.classList.remove('scroll-down');
            nav.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // 表单提交处理
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // 这里添加表单提交逻辑
            console.log('表单数据：', data);
            
            // 显示提交成功消息
            alert('消息已发送！我们会尽快回复您。');
            this.reset();
        });
    }

    // 价格卡片悬停效果
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover-scale');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover-scale');
        });
    });

    // 移动端菜单
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'md:hidden p-2';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    const navLinks = document.querySelector('.hidden.md\\:flex');
    if (navLinks) {
        navLinks.parentNode.insertBefore(mobileMenuButton, navLinks);
        
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
        });
    }

    // 图片预览功能
    const images = document.querySelectorAll('.image-preview');
    images.forEach(img => {
        img.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="max-w-4xl max-h-[90vh] p-4">
                    <img src="${img.src}" class="max-w-full max-h-[80vh] object-contain">
                    <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">&times;</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.tagName === 'BUTTON') {
                    modal.remove();
                }
            });
        });
    });

    // 添加按钮点击效果
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.add('button-click');
    });
}); 