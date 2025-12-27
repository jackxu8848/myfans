// Updated login.js using API instead of localStorage
// This version stores data in the database via the backend API

const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('myfans_auth_token');
}

// Helper function to save auth token
function saveAuthToken(token) {
    localStorage.setItem('myfans_auth_token', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('myfans_auth_token');
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Check if user is already logged in
function checkAuth() {
    const token = getAuthToken();
    if (token) {
        window.location.href = 'index.html';
    }
}

// Register new user via API
async function registerUser(name, email, password) {
    const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
    
    if (response.token) {
        saveAuthToken(response.token);
        // Also store user info for compatibility
        localStorage.setItem('myfans_current_user', JSON.stringify(response.user));
    }
    
    return response.user;
}

// Login user via API
async function loginUser(email, password) {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
        saveAuthToken(response.token);
        // Also store user info for compatibility
        localStorage.setItem('myfans_current_user', JSON.stringify(response.user));
    }
    
    return response.user;
}

// Google login (simulated - same as before)
function googleLogin() {
    // In production, this would use Google OAuth
    // For demo purposes, we'll create a user with Google email
    const googleEmail = `user${Date.now()}@gmail.com`;
    const googleName = 'Google User';
    
    // Register as a new user via API
    return registerUser(googleName, googleEmail, null);
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

// Hide messages
function hideMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    checkAuth();
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide forms
            if (tab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
            }
            
            hideMessages();
        });
    });
    
    // Login form submission
    const loginFormElement = document.getElementById('loginFormElement');
    loginFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideMessages();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        try {
            await loginUser(email, password);
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Register form submission
    const registerFormElement = document.getElementById('registerFormElement');
    registerFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideMessages();
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }
        
        try {
            await registerUser(name, email, password);
            showSuccess('Registration successful! Logging you in...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Google login buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    googleLoginBtn.addEventListener('click', async function() {
        hideMessages();
        try {
            await googleLogin();
            showSuccess('Google login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            showError('Google login failed. Please try again.');
        }
    });
    
    googleRegisterBtn.addEventListener('click', async function() {
        hideMessages();
        try {
            await googleLogin();
            showSuccess('Google registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            showError('Google registration failed. Please try again.');
        }
    });
});

