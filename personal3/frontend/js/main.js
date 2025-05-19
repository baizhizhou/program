class MainPage {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuth();
        this.displayUserInfo();
        this.bindEvents();
        this.loadDashboardData();
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('未登录，重定向到登录页面');
            window.location.href = './login.html';
            return;
        }
    }

    displayUserInfo() {
        const username = localStorage.getItem('username');
        const userRole = localStorage.getItem('userRole');
        
        const usernameElement = document.getElementById('username');
        const userRoleElement = document.getElementById('userRole');
        
        if (username && usernameElement) {
            usernameElement.textContent = `用户: ${username}`;
        }
        if (userRole && userRoleElement) {
            userRoleElement.textContent = `角色: ${userRole}`;
        }
    }

    bindEvents() {
        // 导航事件
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });

        // 登出按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 内容管理相关事件
        const addContentBtn = document.getElementById('addContentBtn');
        if (addContentBtn) {
            addContentBtn.addEventListener('click', () => this.showContentModal());
        }

        // 内容搜索
        const contentSearch = document.getElementById('contentSearch');
        if (contentSearch) {
            contentSearch.addEventListener('input', (e) => this.handleContentSearch(e.target.value));
        }

        // 用户搜索
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => this.handleUserSearch(e.target.value));
        }

        // 内容表单提交
        const contentForm = document.getElementById('contentForm');
        if (contentForm) {
            contentForm.addEventListener('submit', (e) => this.handleContentSubmit(e));
        }

        // 模态框关闭按钮
        const modalCancelBtn = document.querySelector('.modal .cancel');
        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', () => this.hideContentModal());
        }

        // 用户管理标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchUserTab(tab);
            });
        });
    }

    switchPage(page) {
        // 更新导航激活状态
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // 更新页面显示
        document.querySelectorAll('.page').forEach(pageElement => {
            pageElement.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');

        // 加载页面数据
        this.currentPage = page;
        switch (page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'content':
                this.loadContentList();
                break;
            case 'users':
                this.loadUserList();
                break;
        }
    }

    async loadDashboardData() {
        try {
            console.log('开始加载仪表盘数据...');
            const [contentResponse, userResponse] = await Promise.all([
                fetch(`${this.apiUrl}/content/stats`, {
                    headers: {
                        'Authorization': localStorage.getItem('authToken')
                    }
                }),
                fetch(`${this.apiUrl}/users/stats`, {
                    headers: {
                        'Authorization': localStorage.getItem('authToken')
                    }
                })
            ]);

            console.log('仪表盘数据响应状态:', {
                content: contentResponse.status,
                users: userResponse.status
            });

            const contentStats = await contentResponse.json();
            const userStats = await userResponse.json();

            console.log('获取到的仪表盘数据:', {
                content: contentStats,
                users: userStats
            });

            document.getElementById('contentCount').textContent = contentStats.total || 0;
            document.getElementById('userCount').textContent = userStats.total || 0;
        } catch (error) {
            console.error('加载仪表盘数据失败:', error);
            document.getElementById('contentCount').textContent = '加载失败';
            document.getElementById('userCount').textContent = '加载失败';
        }
    }

    async loadContentList() {
        try {
            const contents = await this.fetchData('/content/list');
            const tbody = document.getElementById('contentTableBody');
            tbody.innerHTML = contents.map(content => `
                <tr>
                    <td>${content.id}</td>
                    <td>${content.title}</td>
                    <td>${new Date(content.createTime).toLocaleString()}</td>
                    <td>${content.status}</td>
                    <td>
                        <button onclick="mainPage.editContent(${content.id})">编辑</button>
                        <button onclick="mainPage.deleteContent(${content.id})">删除</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('加载内容列表失败:', error);
        }
    }

    async loadUserList() {
        try {
            console.log('开始加载用户列表...');
            const response = await fetch(`${this.apiUrl}/users/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('authToken')
                }
            });

            console.log('用户列表响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const users = await response.json();
            console.log('获取到的用户列表:', users);

            const tbody = document.getElementById('userTableBody');
            if (!tbody) {
                console.error('找不到用户列表表格体元素');
                return;
            }

            if (!Array.isArray(users)) {
                console.error('用户列表数据格式错误:', users);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="error-message">
                            数据格式错误，请联系管理员
                        </td>
                    </tr>
                `;
                return;
            }

            if (users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px;">
                            暂无用户数据
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.name || '-'}</td>
                    <td>${user.role}</td>
                    <td>
                        <span class="application-status ${user.status === 'active' ? 'status-approved' : 'status-rejected'}">
                            ${user.status}
                        </span>
                    </td>
                    <td>
                        <button onclick="mainPage.toggleUserStatus(${user.id})" class="action-btn ${user.status === 'active' ? 'reject-btn' : 'approve-btn'}">
                            ${user.status === 'active' ? '禁用' : '启用'}
                        </button>
                        <button onclick="mainPage.deleteUser(${user.id})" class="action-btn reject-btn">删除</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('加载用户列表失败:', error);
            const tbody = document.getElementById('userTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="error-message">
                            加载用户列表失败：${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    }

    async loadApplications() {
        try {
            console.log('开始加载申请记录...');
            const token = localStorage.getItem('authToken');
            console.log('当前用户Token:', token);

            const response = await fetch(`${this.apiUrl}/users/applications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });

            console.log('申请记录响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const applications = await response.json();
            console.log('获取到的申请记录:', applications);

            const tbody = document.getElementById('applicationTableBody');
            if (!tbody) {
                console.error('找不到申请记录表格体元素');
                return;
            }

            if (!Array.isArray(applications)) {
                console.error('申请记录数据格式错误:', applications);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="error-message">
                            数据格式错误，请联系管理员
                        </td>
                    </tr>
                `;
                return;
            }

            if (applications.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px;">
                            暂无申请记录
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = applications.map(app => {
                const user = app.user || app;  // 处理可能的嵌套结构
                return `
                    <tr>
                        <td>${new Date(user.createdAt).toLocaleString()}</td>
                        <td>${user.name || '-'}</td>
                        <td>${user.username || '-'}</td>
                        <td class="reason-cell">${user.reason || '-'}</td>
                        <td>
                            <span class="application-status status-${(user.status || 'PENDING').toLowerCase()}">
                                ${this.getStatusText(user.status || 'PENDING')}
                            </span>
                        </td>
                        <td>
                            ${user.status === 'PENDING' ? `
                                <button onclick="mainPage.handleApplication(${user.id}, 'approve')" class="action-btn approve-btn">通过</button>
                                <button onclick="mainPage.handleApplication(${user.id}, 'reject')" class="action-btn reject-btn">拒绝</button>
                            ` : '-'}
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('加载申请记录失败:', error);
            const tbody = document.getElementById('applicationTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="error-message">
                            加载申请记录失败：${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    }

    getStatusText(status) {
        const statusMap = {
            'PENDING': '待审核',
            'APPROVED': '已通过',
            'REJECTED': '已拒绝'
        };
        return statusMap[status] || status;
    }

    switchUserTab(tab) {
        console.log('切换到标签页:', tab);
        
        // 更新标签页按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tab);
        });

        // 加载对应的数据
        if (tab === 'applications') {
            console.log('正在加载申请记录...');
            this.loadApplications();
        } else {
            console.log('正在加载用户列表...');
            this.loadUserList();
        }
    }

    async handleApplication(applicationId, action) {
        try {
            console.log(`准备${action === 'approve' ? '通过' : '拒绝'}申请:`, applicationId);
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${this.apiUrl}/users/applications/${applicationId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            });

            console.log('处理申请响应状态:', response.status);
            const result = await response.json();
            console.log('处理申请结果:', result);

            if (response.ok && result.success) {
                this.showMessage(`申请${action === 'approve' ? '通过' : '拒绝'}成功`);
                await this.loadApplications(); // 重新加载申请列表
                await this.loadUserList(); // 同时更新用户列表
            } else {
                this.showMessage(result.message || '操作失败', 'error');
            }
        } catch (error) {
            console.error('处理申请失败:', error);
            this.showMessage(`操作失败: ${error.message}`, 'error');
        }
    }

    async handleContentSearch(query) {
        try {
            const contents = await this.fetchData(`/content/search?q=${encodeURIComponent(query)}`);
            // 更新内容列表...
        } catch (error) {
            console.error('搜索内容失败:', error);
        }
    }

    async handleUserSearch(query) {
        try {
            const users = await this.fetchData(`/users/search?q=${encodeURIComponent(query)}`);
            // 更新用户列表...
        } catch (error) {
            console.error('搜索用户失败:', error);
        }
    }

    showContentModal(contentId = null) {
        const modal = document.getElementById('contentModal');
        const title = modal.querySelector('h2');
        title.textContent = contentId ? '编辑内容' : '添加内容';
        modal.classList.add('active');

        if (contentId) {
            // 加载内容数据到表单
            this.fetchData(`/content/${contentId}`).then(content => {
                document.getElementById('contentTitle').value = content.title;
                document.getElementById('contentBody').value = content.body;
            });
        }
    }

    hideContentModal() {
        const modal = document.getElementById('contentModal');
        modal.classList.remove('active');
        document.getElementById('contentForm').reset();
    }

    async handleContentSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('contentTitle').value;
        const body = document.getElementById('contentBody').value;

        try {
            await this.fetchData('/content/save', {
                method: 'POST',
                body: JSON.stringify({ title, body })
            });
            this.hideContentModal();
            this.loadContentList();
        } catch (error) {
            console.error('保存内容失败:', error);
        }
    }

    async toggleUserStatus(userId) {
        try {
            console.log('准备切换用户状态:', userId);
            const response = await fetch(`${this.apiUrl}/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('authToken')
                }
            });

            console.log('切换用户状态响应:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('切换用户状态结果:', result);

            if (result.success) {
                this.showMessage('用户状态已更新');
                await this.loadUserList();
            } else {
                this.showMessage(result.message || '操作失败', 'error');
            }
        } catch (error) {
            console.error('切换用户状态失败:', error);
            this.showMessage(`操作失败: ${error.message}`, 'error');
        }
    }

    async deleteContent(contentId) {
        if (confirm('确定要删除这条内容吗？')) {
            try {
                await this.fetchData(`/content/${contentId}`, { method: 'DELETE' });
                this.loadContentList();
            } catch (error) {
                console.error('删除内容失败:', error);
            }
        }
    }

    async deleteUser(userId) {
        if (!confirm('确定要删除这个用户吗？')) {
            return;
        }

        try {
            console.log('准备删除用户:', userId);
            const response = await fetch(`${this.apiUrl}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': localStorage.getItem('authToken')
                }
            });

            console.log('删除用户响应:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('删除用户结果:', result);

            if (result.success) {
                this.showMessage('用户已删除');
                await this.loadUserList();
            } else {
                this.showMessage(result.message || '删除失败', 'error');
            }
        } catch (error) {
            console.error('删除用户失败:', error);
            this.showMessage(`删除失败: ${error.message}`, 'error');
        }
    }

    async fetchData(endpoint, options = {}) {
        const token = localStorage.getItem('authToken');
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        };

        try {
            const response = await fetch(this.apiUrl + endpoint, { ...defaultOptions, ...options });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    handleLogout() {
        // 清除本地存储的认证信息
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        
        // 重定向到登录页面
        window.location.href = './login.html';
    }

    showMessage(message, type = 'success') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageDiv);
        
        // 2秒后移除
        setTimeout(() => {
            messageDiv.remove();
        }, 2000);
    }
}

// 创建全局实例
let mainPage;
document.addEventListener('DOMContentLoaded', () => {
    mainPage = new MainPage();
}); 