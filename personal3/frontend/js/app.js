class ContentApp {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
        this.loadingElement = document.getElementById('loading');
        this.contentListElement = document.getElementById('content-list');
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.addBtn = document.getElementById('addBtn');
        this.userManagementBtn = document.getElementById('userManagementBtn');
        this.addForm = document.getElementById('addForm');
        this.contentForm = document.getElementById('contentForm');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.allContents = [];
        this.init();
    }
    
    init() {
        this.checkLogin();
        this.loadContents();
        this.bindEvents();
        this.setupRoleBasedAccess();
        this.addLogoutButton();
    }
    
    checkLogin() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    // 新增：根据用户角色控制功能访问
    setupRoleBasedAccess() {
        const userRole = localStorage.getItem('userRole');
        const isAdmin = userRole === 'ADMIN';
        
        // 如果未登录，重定向到登录页面
        if (!userRole) {
            window.location.href = 'login.html';
            return;
        }
        
        // 控制"添加新内容"按钮
        if (!isAdmin && this.addBtn) {
            this.addBtn.style.display = 'none';
        }
        
        // 控制"用户管理"按钮
        if (!isAdmin && this.userManagementBtn) {
            this.userManagementBtn.style.display = 'none';
        }
    }
    
    // 添加退出登录按钮
    addLogoutButton() {
        const header = document.querySelector('.header');
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.textContent = '退出登录';
        logoutBtn.onclick = () => this.logout();
        
        // 在用户管理按钮之前插入退出按钮
        header.insertBefore(logoutBtn, this.userManagementBtn);
    }
    
    // 退出登录
    logout() {
        if (confirm('确认退出登录？')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
            window.location.href = 'login.html';
        }
    }
    
    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchContents());
        this.resetBtn.addEventListener('click', () => this.resetSearch());
        this.userManagementBtn.addEventListener('click', () => this.goToUserManagement());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchContents();
            }
        });
        this.addBtn.addEventListener('click', () => this.showAddForm());
        this.cancelBtn.addEventListener('click', () => this.hideAddForm());
        this.contentForm.addEventListener('submit', (e) => this.addContent(e));
    }
    
    // 跳转到用户管理页面
    goToUserManagement() {
        window.location.href = 'user-management.html';
    }
    
    // 获取认证头
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    
    async loadContents() {
        try {
            this.showLoading();
            const response = await fetch(`${this.apiUrl}/contents`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            this.allContents = await response.json();
            this.renderContents(this.allContents);
        } catch (error) {
            console.error('Error loading contents:', error);
            this.showError('加载内容失败，请检查后端服务是否启动');
        } finally {
            this.hideLoading();
        }
    }
    
    searchContents() {
        const keyword = this.searchInput.value.trim().toLowerCase();
        if (!keyword) {
            this.renderContents(this.allContents);
            return;
        }
        
        const filteredContents = this.allContents.filter(content =>
            content.name.toLowerCase().includes(keyword)
        );
        this.renderContents(filteredContents);
    }
    
    resetSearch() {
        this.searchInput.value = '';
        this.renderContents(this.allContents);
    }
    
    async addContent(e) {
        e.preventDefault();
        
        const newContent = {
            name: document.getElementById('nameInput').value.trim(),
            description: document.getElementById('descInput').value.trim(),
            downloadLink: document.getElementById('linkInput').value.trim()
        };
        
        // 验证输入
        if (!newContent.name || !newContent.description || !newContent.downloadLink) {
            alert('请填写所有字段');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/contents`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(newContent)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showMessage('内容添加成功', 'success');
                this.hideAddForm();
                this.contentForm.reset();
                this.loadContents();
            } else {
                this.showMessage(result.message || '添加失败', 'error');
            }
        } catch (error) {
            console.error('Add content error:', error);
            this.showMessage('网络错误，请重试', 'error');
        }
    }
    
    // 显示自定义居中提示框
    showToast(message, duration = 3000) {
        // 移除已存在的提示框
        const existingToast = document.querySelector('.toast-overlay');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'toast-overlay';
        
        // 创建提示框
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // 点击遮罩层关闭提示框
        overlay.addEventListener('click', () => {
            overlay.remove();
        });
        
        // 添加到页面
        overlay.appendChild(toast);
        document.body.appendChild(overlay);
        
        // 自动关闭
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.remove();
            }
        }, duration);
    }
    
    // 复制网盘地址到剪贴板
    async copyToClipboard(downloadLink) {
        try {
            await navigator.clipboard.writeText(downloadLink);
            this.showToast(`${downloadLink}复制成功，请到对应网盘打开保存`);
        } catch (err) {
            // 如果现代API不支持，使用传统方法
            this.fallbackCopyTextToClipboard(downloadLink);
        }
    }
    
    // 备用复制方法（兼容老浏览器）
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // 避免滚动到底部
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast(`${text}复制成功，请到对应网盘打开保存`);
            } else {
                this.showToast('复制失败，请手动复制');
            }
        } catch (err) {
            this.showToast('复制失败，请手动复制');
        }
        
        document.body.removeChild(textArea);
    }
    
    showAddForm() {
        this.addForm.classList.remove('hidden');
        document.getElementById('nameInput').focus();
    }
    
    hideAddForm() {
        this.addForm.classList.add('hidden');
        this.contentForm.reset();
    }
    
    showLoading() {
        this.loadingElement.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loadingElement.classList.add('hidden');
    }
    
    renderContents(contents) {
        this.contentListElement.innerHTML = '';
        
        if (contents.length === 0) {
            this.contentListElement.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px; grid-column: 1 / -1;">
                    没有找到相关内容
                </div>
            `;
            return;
        }
        
        contents.forEach(content => {
            const contentElement = this.createContentElement(content);
            this.contentListElement.appendChild(contentElement);
        });
    }
    
    createContentElement(content) {
        const div = document.createElement('div');
        div.className = 'content-item';
        
        div.innerHTML = `
            <div class="content-name">${content.name}</div>
            <div class="content-description">${content.description}</div>
            <button class="copy-btn" onclick="app.copyToClipboard('${content.downloadLink}')">
                复制网盘
            </button>
        `;
        
        return div;
    }
    
    showError(message) {
        this.contentListElement.innerHTML = `
            <div style="text-align: center; color: #e74c3c; padding: 20px; grid-column: 1 / -1;">
                ${message}
            </div>
        `;
    }
    
    showMessage(message, type) {
        // 移除已存在的提示框
        const existingToast = document.querySelector('.toast-overlay');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'toast-overlay';
        
        // 创建提示框
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 点击遮罩层关闭提示框
        overlay.addEventListener('click', () => {
            overlay.remove();
        });
        
        // 添加到页面
        overlay.appendChild(toast);
        document.body.appendChild(overlay);
        
        // 自动关闭
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.remove();
            }
        }, 3000);
    }
}

// 页面加载完成后初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ContentApp();
});