// API endpoints
const API_URL = 'https://your-backend-url.com/api';

// Social Login Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const REDIRECT_URI = window.location.origin + '/auth/callback';

// Enhanced form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: re.test(email),
        message: re.test(email) ? '' : 'Please enter a valid email address'
    };
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && 
                   hasNumbers && hasSpecialChar;

    let message = '';
    if (!isValid) {
        message = 'Password must be at least 8 characters long and contain: ';
        if (!hasUpperCase) message += 'uppercase letter, ';
        if (!hasLowerCase) message += 'lowercase letter, ';
        if (!hasNumbers) message += 'number, ';
        if (!hasSpecialChar) message += 'special character, ';
        message = message.slice(0, -2);
    }

    return { isValid, message };
}

function validateName(name) {
    return name.length >= 2 && /^[a-zA-Z\s]*$/.test(name);
}

// UI helper functions
function showSuccess(message, elementId = 'success-message') {
    const successDiv = document.getElementById(elementId);
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

function setLoading(isLoading) {
    const spinner = document.getElementById('spinner');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (spinner && submitButton) {
        spinner.style.display = isLoading ? 'inline-block' : 'none';
        submitButton.disabled = isLoading;
    }
}

// Enhanced authentication functions
async function register(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Validate form data
    const emailValidation = validateEmail(formData.get('email'));
    const passwordValidation = validatePassword(formData.get('password'));
    const nameValidation = validateName(formData.get('name'));

    if (!emailValidation.isValid) {
        showError(emailValidation.message);
        return;
    }

    if (!passwordValidation.isValid) {
        showError(passwordValidation.message);
        return;
    }

    if (!nameValidation) {
        showError('Please enter a valid name');
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        localStorage.setItem('token', data.token);
        showSuccess('Registration successful! Verification email sent.');
        
        // Redirect to email verification page
        window.location.href = '/verify-email.html';
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.name);
            window.location.href = '/dashboard.html';
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    }
}

async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }

    try {
        const response = await fetch('/api/auth/check', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        const data = await response.json();
        if (!data.isAdmin && window.location.pathname.includes('admin.html')) {
            window.location.href = '/dashboard.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
        return false;
    }
}

function updateUserInterface(userData) {
    // Update profile photos
    const headerPhoto = document.getElementById('headerProfilePhoto');
    const dropdownPhoto = document.getElementById('dropdownProfilePhoto');
    if (userData.profilePhoto) {
        const photoUrl = userData.profilePhoto;
        if (headerPhoto) headerPhoto.src = photoUrl;
        if (dropdownPhoto) dropdownPhoto.src = photoUrl;
    }

    // Update name and email
    const nameElement = document.getElementById('profileName');
    const emailElement = document.getElementById('profileEmail');
    if (nameElement) nameElement.textContent = userData.name || 'User';
    if (emailElement) emailElement.textContent = userData.email || '';
}

// Settings page functionality
async function saveSettings() {
    const settings = {
        language: document.getElementById('language').value,
        timezone: document.getElementById('timezone').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        pushNotifications: document.getElementById('pushNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        profileVisibility: document.getElementById('profileVisibility').checked,
        onlineStatus: document.getElementById('onlineStatus').checked
    };

    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            showSuccess('Settings saved successfully');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        showError('Failed to save settings: ' + error.message);
    }
}

async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const settings = await response.json();
            
            // Apply settings to form
            document.getElementById('language').value = settings.language || 'en';
            document.getElementById('timezone').value = settings.timezone || 'UTC';
            document.getElementById('emailNotifications').checked = settings.emailNotifications ?? true;
            document.getElementById('pushNotifications').checked = settings.pushNotifications ?? true;
            document.getElementById('smsNotifications').checked = settings.smsNotifications ?? false;
            document.getElementById('profileVisibility').checked = settings.profileVisibility ?? true;
            document.getElementById('onlineStatus').checked = settings.onlineStatus ?? true;
        }
    } catch (error) {
        showError('Failed to load settings: ' + error.message);
    }
}

function resetSettings() {
    // Reset to default values
    document.getElementById('language').value = 'en';
    document.getElementById('timezone').value = 'UTC';
    document.getElementById('emailNotifications').checked = true;
    document.getElementById('pushNotifications').checked = true;
    document.getElementById('smsNotifications').checked = false;
    document.getElementById('profileVisibility').checked = true;
    document.getElementById('onlineStatus').checked = true;
    
    showSuccess('Settings reset to default values');
}

// Utility functions for showing messages
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Enhanced Google Sign-In
async function handleGoogleSignIn(response) {
    try {
        const token = response.credential;
        
        const apiResponse = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            throw new Error(data.message || 'Google sign-in failed');
        }

        localStorage.setItem('token', data.token);
        showSuccess('Successfully signed in with Google');
        window.location.href = '/dashboard.html';
    } catch (error) {
        showError(error.message);
    }
}

// Enhanced Apple Sign-In
async function handleAppleSignIn(event) {
    try {
        const { authorization } = event.detail;
        
        const response = await fetch(`${API_URL}/auth/apple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                code: authorization.code,
                id_token: authorization.id_token
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Apple sign-in failed');
        }

        localStorage.setItem('token', data.token);
        showSuccess('Successfully signed in with Apple');
        window.location.href = '/dashboard.html';
    } catch (error) {
        showError(error.message);
    }
}

// Password reset functionality
async function requestPasswordReset(email) {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset email');
        }

        showSuccess('Password reset email sent. Please check your inbox.');
    } catch (error) {
        showError(error.message);
    }
}

async function resetPassword(token, newPassword) {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to reset password');
        }

        showSuccess('Password successfully reset. Please login with your new password.');
        window.location.href = '/login.html';
    } catch (error) {
        showError(error.message);
    }
}

// Initialize Google Sign-In
function initGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn
    });
    google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: '100%' }
    );
}

// Initialize Apple Sign-In
function initAppleSignIn() {
    AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: REDIRECT_URI,
        state: 'origin:web',
        usePopup: true
    });
}

// Initialize auth listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', register);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Initialize social login buttons if they exist
    if (document.getElementById('google-signin-button')) {
        initGoogleSignIn();
    }
    
    if (document.getElementById('apple-signin-button')) {
        initAppleSignIn();
        
        // Add Apple Sign-In listeners
        document.addEventListener('AppleIDSignInOnSuccess', handleAppleSignIn);
        document.addEventListener('AppleIDSignInOnFailure', handleAppleSignInError);
    }

    // Check auth on protected pages
    if (window.location.pathname.includes('dashboard.html')) {
        checkAuth();
    }
});

// Apple Sign-In Error Handler
function handleAppleSignInError(event) {
    console.error('Apple Sign-In failed:', event.detail.error);
    showError('Apple Sign-In failed. Please try again.');
}

// Logout functionality and navigation handlers
function handleLogout() {
    // Clear authentication token
    localStorage.removeItem('token');
    
    // Clear any user data
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login.html';
}

function handleNavClick(element, type) {
    // Close any open dropdowns
    const dropdowns = document.querySelectorAll('.header-dropdown');
    dropdowns.forEach(dropdown => {
        if (!dropdown.classList.contains(type + '-dropdown')) {
            dropdown.classList.remove('active');
        }
    });

    // Toggle the clicked dropdown
    const dropdown = element.querySelector('.' + type + '-dropdown');
    dropdown.classList.toggle('active');
}
