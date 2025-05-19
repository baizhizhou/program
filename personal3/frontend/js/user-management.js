class UserManagement {
    constructor() {
        this.apiUrl = 'http://localhost:8080/api';
        this.currentModule = 'review';
        this.checkAuth();
        this.init();
    }
    
    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    init() {
        this.bindEvents();
        this.loadUsers();
    }
    
    bindEvents() {
        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // 切换标签
        document.getElementById('userReviewTab').addEventListener('click', () => {
            this.switchModule('review');
        });
        
        document.getElementById('userManageTab').addEventListener('click', () => {
            this.switchModule('manage');
        });
    }
    
    switchModule(module) {
        this.currentModule = module;
        
        // 更新标签样式
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (module === 'review') {
            document.getElementById('userReviewTab').classList.add('active');
            document.getElementById('userReviewModule').classList.remove('hidden');
            document.getElementById('userManageModule').classList.add('hidden');
        } else {
            document.getElementById('userManageTab').classList.add('active');
            document.getElementById('userReviewModule').classList.add('hidden');
            document.getElementById('userManageModule').classList.remove('hidden');
        }
    }
    
    // 获取认证头
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    
    // 从后端加载用户数据
    async loadUsers() {
        try {
            // 加载待审核用户
            const pendingResponse = await fetch(`${this.apiUrl}/users/pending`, {
                headers: this.getAuthHeaders()
            });
            const pendingUsers = await pendingResponse.json();
            
            // 加载已审核用户
            const approvedResponse = await fetch(`${this.apiUrl}/users/approved`, {
                headers: this.getAuthHeaders()
            });
            const approvedUsers = await approvedResponse.json();
            
            this.renderUsers('userReviewList', pendingUsers, 'review');
            this.renderUsers('userManageList', approvedUsers, 'manage');
            
        } catch (error) {
            console.error('Error loading users:', error);
            alert('加载用户数据失败');
        }
    }
    
    renderUsers(containerId, users, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (users.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px; grid-column: 1 / -1;">
                    暂无${type === 'review' ? '待审核' : '已审核'}用户
                </div>
            `;
            return;
        }
        
        users.forEach(user => {
            const userCard = this.createUserCard(user, type);
            container.appendChild(userCard);
        });
    }
    
    createUserCard(user, type) {
        const div = document.createElement('div');
        div.className = 'user-card';
        
        const statusClass = this.getStatusClass(user.status);
        const statusText = this.getStatusText(user.status);
        const avatar = user.name.charAt(0);
        
        div.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${avatar}</div>
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.username}</div>
                <div class="user-status ${statusClass}">${statusText}</div>
                <div class="user-actions">
                    ${this.getActionButtons(user, type)}
                </div>
            </div>
        `;
        
        return div;
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-active';
            case 'rejected': return 'status-inactive';
            default: return '';
        }
    }
    
    getStatusText(status) {
        switch (status) {
            case 'pending': return '待审核';
            case 'approved': return '已通过';
            case 'rejected': return '已拒绝';
            default: return '';
        }
    }
    
    getActionButtons(user, type) {
        if (type === 'review') {
            return `
                <button class="btn-approve" onclick="userManagement.approveUser(${user.id})">通过</button>
                <button class="btn-reject" onclick="userManagement.rejectUser(${user.id})">拒绝</button>
            `;
        } else {
            const actionBtn = user.status === 'approved' 
                ? `<button class="btn-disable" onclick="userManagement.disableUser(${user.id})">禁用</button>`
                : `<button class="btn-approve" onclick="userManagement.enableUser(${user.id})">启用</button>`;
            
            return `
                <button class="btn-edit" onclick="userManagement.editUser(${user.id})">编辑</button>
                ${actionBtn}
            `;
        }
    }
    
    // 用户操作方法
    async approveUser(userId) {
        if (confirm('确认通过该用户的注册申请？')) {
            try {
                const response = await fetch(`${this.apiUrl}/users/${userId}/approve`, {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
                
                const result = await response.json();
                if (result.success) {
                    alert(result.message);
                    this.loadUsers(); // 重新加载数据
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error approving user:', error);
                alert('操作失败，请重试');
            }
        }
    }
    
    async rejectUser(userId) {
        if (confirm('确认拒绝该用户的注册申请？')) {
            try {
                const response = await fetch(`${this.apiUrl}/users/${userId}/reject`, {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
                
                const result = await response.json();
                if (result.success) {
                    alert(result.message);
                    this.loadUsers(); // 重新加载数据
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error rejecting user:', error);
                alert('操作失败，请重试');
            }
        }
    }
    
    editUser(userId) {
        console.log('编辑用户:', userId);
        alert('编辑功能待实现');
    }
    
    async disableUser(userId) {
        if (confirm('确认禁用该用户？')) {
            try {
                const response = await fetch(`${this.apiUrl}/users/${userId}/disable`, {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
                
                const result = await response.json();
                if (result.success) {
                    alert(result.message);
                    this.loadUsers(); // 重新加载数据
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error disabling user:', error);
                alert('操作失败，请重试');
            }
        }
    }
    
    async enableUser(userId) {
        if (confirm('确认启用该用户？')) {
            try {
                const response = await fetch(`${this.apiUrl}/users/${userId}/enable`, {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
                
                const result = await response.json();
                if (result.success) {
                    alert(result.message);
                    this.loadUsers(); // 重新加载数据
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Error enabling user:', error);
                alert('操作失败，请重试');
            }
        }
    }
}

// 页面加载完成后初始化
let userManagement;
document.addEventListener('DOMContentLoaded', () => {
    userManagement = new UserManagement();
}); 