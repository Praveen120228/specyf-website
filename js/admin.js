// Global variables
let currentPage = 1;
const usersPerPage = 10;
let currentUsers = [];
let editingUserId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return;
    }
    await loadDashboardStats();
    await loadUsers();
});

// Check if user is admin
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }

    try {
        const response = await fetch('/api/auth/check-admin', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Not authorized');
        }
        return true;
    } catch (error) {
        console.error('Admin check failed:', error);
        window.location.href = '/dashboard.html';
        return false;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load stats');
        }

        const stats = await response.json();
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
        document.getElementById('newUsers').textContent = stats.newUsers || 0;
        document.getElementById('verifiedUsers').textContent = stats.verifiedUsers || 0;
    } catch (error) {
        console.error('Failed to load statistics:', error);
        showToast('error', 'Failed to load statistics');
    }
}

// Load users
async function loadUsers(filter = 'all', search = '') {
    try {
        const response = await fetch(`/api/admin/users?filter=${filter}&search=${search}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const users = await response.json();
        currentUsers = users;
        displayUsers();
        updatePagination();
    } catch (error) {
        console.error('Failed to load users:', error);
        showToast('error', 'Failed to load users');
    }
}

// Display users in table
function displayUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToDisplay = currentUsers.slice(startIndex, endIndex);

    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    usersToDisplay.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.isVerified ? '<span class="badge success">Verified</span>' : '<span class="badge warning">Unverified</span>'}</td>
            <td>${user.isAdmin ? '<span class="badge primary">Admin</span>' : '<span class="badge">User</span>'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td class="action-buttons">
                <button class="btn btn-edit" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(currentUsers.length / usersPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    if (currentPage > 1) {
        pagination.innerHTML += `
            <button class="page-btn" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }

    // Next button
    if (currentPage < totalPages) {
        pagination.innerHTML += `
            <button class="page-btn" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
}

// Change page
function changePage(page) {
    currentPage = page;
    displayUsers();
    updatePagination();
}

// Search users
function searchUsers(query) {
    loadUsers('all', query);
}

// Filter users
function filterUsers(filter) {
    loadUsers(filter);
}

// Show add user modal
function showAddUserModal() {
    editingUserId = null;
    document.getElementById('modalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userPassword').required = true;
    document.getElementById('userModal').style.display = 'block';
}

// Show edit user modal
async function editUser(userId) {
    editingUserId = userId;
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userPassword').required = false;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load user data');
        }

        const user = await response.json();
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userIsAdmin').checked = user.isAdmin;
        document.getElementById('userModal').style.display = 'block';
    } catch (error) {
        console.error('Failed to load user data:', error);
        showToast('error', 'Failed to load user data');
    }
}

// Close modal
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Handle user form submit
async function handleUserSubmit(event) {
    event.preventDefault();

    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        isAdmin: document.getElementById('userIsAdmin').checked
    };

    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }

    try {
        const url = editingUserId 
            ? `/api/admin/users/${editingUserId}`
            : '/api/admin/users';
        
        const method = editingUserId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to save user');
        }

        showToast('success', `User ${editingUserId ? 'updated' : 'added'} successfully`);
        closeModal();
        await loadUsers();
        await loadDashboardStats();
    } catch (error) {
        console.error('Failed to save user:', error);
        showToast('error', error.message);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        showToast('success', 'User deleted successfully');
        await loadUsers();
        await loadDashboardStats();
    } catch (error) {
        console.error('Failed to delete user:', error);
        showToast('error', error.message);
    }
}

// Show toast notification
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Window click event to close modal
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
};
