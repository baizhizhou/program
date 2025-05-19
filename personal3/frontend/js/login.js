class LoginManager {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
        this.loginForm = document.getElementById('loginForm');
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkLoginStatus();
        // 确保弹窗默认隐藏
        this.ensureModalHidden();
    }
    
    // 确保弹窗默认隐藏
    ensureModalHidden() {
        const modal = document.getElementById('applyModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    bindEvents() {
        // 登录表单提交
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // 申请按钮点击
        const applyBtn = document.getElementById('applyBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.openApplyModal());
        }

        // 申请表单提交
        const applyForm = document.getElementById('applyForm');
        if (applyForm) {
            applyForm.addEventListener('submit', (e) => this.handleApply(e));
        }

        // 关闭按钮点击
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeApplyModal());
        }

        // 取消按钮点击
        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeApplyModal());
        }

        // 点击模态框外部关闭
        const modal = document.getElementById('applyModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeApplyModal();
                }
            });
        }
    }
    
    // 检查是否已经登录
    checkLoginStatus() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.redirectToMainPage();
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = '登录中...';
            
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('authToken', 'Bearer ' + result.username);
                localStorage.setItem('username', result.username);
                localStorage.setItem('userRole', result.role);
                
                this.redirectToMainPage();
            } else {
                this.showError(result.message || '登录失败');
            }
        } catch (error) {
            console.error('登录错误:', error);
            this.showError('登录失败，请检查网络连接或联系管理员');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '登录';
        }
    }
    
    // 处理用户申请
    async handleApply(e) {
        e.preventDefault();
        
        const name = document.getElementById('applyName').value.trim();
        const username = document.getElementById('applyUsername').value.trim();
        const password = document.getElementById('applyPassword').value.trim();
        const reason = document.getElementById('applyReason').value.trim();
        
        // 表单验证
        if (!name || !username || !password || !reason) {
            this.showApplyMessage('请填写所有必填字段', 'error');
            return;
        }

        // 打印申请数据
        console.log('准备发送申请数据:', {
            name,
            username,
            password,
            reason,
            status: 'PENDING',
            createTime: new Date().toISOString()
        });
        
        const submitBtn = e.target.querySelector('.submit-btn');
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';
            
            const response = await fetch(`${this.apiUrl}/users/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    username,
                    password,
                    reason,
                    status: 'PENDING',
                    createTime: new Date().toISOString()
                })
            });

            console.log('申请响应状态:', response.status);
            const result = await response.json();
            console.log('申请响应结果:', result);

            if (response.ok && result.success) {
                this.showApplyMessage('申请提交成功，请等待管理员审核', 'success');
                document.getElementById('applyForm').reset();
                setTimeout(() => {
                    this.closeApplyModal();
                }, 2000);
            } else {
                this.showApplyMessage(result.message || '申请失败，请重试', 'error');
            }
        } catch (error) {
            console.error('申请错误:', error);
            this.showApplyMessage('申请失败，请检查网络连接', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交申请';
        }
    }
    
    // 打开申请弹窗
    openApplyModal() {
        const modal = document.getElementById('applyModal');
        if (modal) {
            modal.classList.remove('hidden');
            // 聚焦到第一个输入框
            const firstInput = document.getElementById('applyName');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }
    
    // 关闭申请弹窗
    closeApplyModal() {
        const modal = document.getElementById('applyModal');
        if (modal) {
            modal.classList.add('hidden');
            // 重置表单和消息
            const form = document.getElementById('applyForm');
            if (form) {
                form.reset();
            }
            this.hideApplyMessage();
        }
    }
    
    showError(message) {
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.classList.remove('hidden');
        }
    }
    
    hideError() {
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.classList.add('hidden');
        }
    }
    
    showApplyMessage(message, type) {
        const messageElement = document.getElementById('applyMessage');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `message ${type}`;
            messageElement.classList.remove('hidden');
        }
    }
    
    hideApplyMessage() {
        const messageElement = document.getElementById('applyMessage');
        if (messageElement) {
            messageElement.classList.add('hidden');
        }
    }
    
    redirectToMainPage() {
        window.location.href = './main.html';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
}); 