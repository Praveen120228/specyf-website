// API endpoints
const API_URL = 'http://localhost:3001/api';
const AUTH_ENDPOINTS = {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    me: `${API_URL}/auth/me`,
    google: `${API_URL}/auth/google`,
    apple: `${API_URL}/auth/apple`
};

// Social Login Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const APPLE_CLIENT_ID = 'YOUR_APPLE_CLIENT_ID';
const REDIRECT_URI = 'https://your-website.com/callback';

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}

function validateName(name) {
    return name.length >= 2 && /^[a-zA-Z\s]*$/.test(name);
}

// UI helper functions
function showError(message, elementId = 'error-message') {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

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

// Authentication functions
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Client-side validation
    if (!validateName(name)) {
        showError('Name must be at least 2 characters long and contain only letters and spaces', 'name-error');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address', 'email-error');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 'password-error');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match', 'confirmPassword-error');
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch(AUTH_ENDPOINTS.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Store auth token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSuccess('Registration successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    } catch (error) {
        showError(error.message || 'An error occurred during registration');
        console.error('Registration error:', error);
    } finally {
        setLoading(false);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Client-side validation
    if (!validateEmail(email)) {
        showError('Please enter a valid email address', 'email-error');
        return;
    }
    
    if (!password) {
        showError('Please enter your password', 'password-error');
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await fetch(AUTH_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store auth token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    } catch (error) {
        showError(error.message || 'An error occurred during login');
        console.error('Login error:', error);
    } finally {
        setLoading(false);
    }
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }

    try {
        const response = await fetch(AUTH_ENDPOINTS.me, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
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

// Handle Google Sign-In Response
async function handleGoogleSignIn(response) {
    try {
        const credential = response.credential;
        const decodedToken = JSON.parse(atob(credential.split('.')[1]));
        
        const userData = {
            name: decodedToken.name,
            email: decodedToken.email,
            picture: decodedToken.picture,
            provider: 'google'
        };

        // You can send this data to your backend here
        const apiResponse = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!apiResponse.ok) {
            throw new Error('Google authentication failed');
        }

        const data = await apiResponse.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showError('Google Sign-In failed. Please try again.');
    }
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

// Handle Apple Sign-In Success
async function handleAppleSignIn(event) {
    try {
        const { authorization } = event.detail;
        
        const userData = {
            email: authorization.email,
            name: authorization.name && `${authorization.name.firstName} ${authorization.name.lastName}`,
            provider: 'apple'
        };

        // You can send this data to your backend here
        const apiResponse = await fetch(`${API_URL}/auth/apple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!apiResponse.ok) {
            throw new Error('Apple authentication failed');
        }

        const data = await apiResponse.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Apple Sign-In error:', error);
        showError('Apple Sign-In failed. Please try again.');
    }
}

// Apple Sign-In Error Handler
function handleAppleSignInError(event) {
    console.error('Apple Sign-In failed:', event.detail.error);
    showError('Apple Sign-In failed. Please try again.');
}

// Initialize auth listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
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
    if (window.location.pathname !== '/login.html' && 
        window.location.pathname !== '/register.html' && 
        window.location.pathname !== '/signup.html' && 
        window.location.pathname !== '/') {
        checkAuth();
    }
});
