document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserProfile();
    initializeEventListeners();
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const user = await response.json();
        updateProfileUI(user);
        loadUserActivity(user.id);
    } catch (error) {
        showError('Failed to load profile. Please try again later.');
    }
}

function updateProfileUI(user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    
    if (user.avatar) {
        document.getElementById('profileAvatar').src = user.avatar;
    }

    // Update social connections UI
    if (user.googleConnected) {
        document.getElementById('googleConnect').textContent = 'Google Connected';
        document.getElementById('googleConnect').disabled = true;
    }
    if (user.appleConnected) {
        document.getElementById('appleConnect').textContent = 'Apple Connected';
        document.getElementById('appleConnect').disabled = true;
    }
}

async function loadUserActivity(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/user/activity/${userId}`, {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load activity');
        }

        const activities = await response.json();
        updateActivityUI(activities);
    } catch (error) {
        console.error('Failed to load activity:', error);
    }
}

function updateActivityUI(activities) {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = activities.map(activity => `
        <li class="activity-item">
            <div>${activity.description}</div>
            <div class="activity-date">${new Date(activity.date).toLocaleDateString()}</div>
        </li>
    `).join('');
}

function initializeEventListeners() {
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData(e.target);
            
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email')
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            showSuccess('Profile updated successfully');
            loadUserProfile();
        } catch (error) {
            showError('Failed to update profile. Please try again.');
        }
    });

    // Password change form submission
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData(e.target);
            
            const response = await fetch(`${API_URL}/user/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    currentPassword: formData.get('currentPassword'),
                    newPassword: formData.get('newPassword')
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update password');
            }

            showSuccess('Password updated successfully');
            e.target.reset();
        } catch (error) {
            showError('Failed to update password. Please check your current password and try again.');
        }
    });

    // Avatar upload
    document.getElementById('profileAvatar').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('avatar', file);
                    
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/user/avatar`, {
                        method: 'POST',
                        headers: {
                            'x-auth-token': token
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Failed to upload avatar');
                    }

                    const { avatarUrl } = await response.json();
                    document.getElementById('profileAvatar').src = avatarUrl;
                    showSuccess('Profile picture updated successfully');
                } catch (error) {
                    showError('Failed to upload profile picture. Please try again.');
                }
            }
        };
        input.click();
    });
}
