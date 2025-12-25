// Simple authentication system using localStorage
// In production, this would connect to a backend API

// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('myfans_current_user');
    if (currentUser) {
        window.location.href = 'myfans.html';
    }
}

// Register new user
function registerUser(name, email, password) {
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        throw new Error('Email already registered. Please login instead.');
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('myfans_users', JSON.stringify(users));
    
    return newUser;
}

// Login user
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error('Invalid email or password.');
    }
    
    // Set current user
    localStorage.setItem('myfans_current_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));
    
    return user;
}

// Google login (simulated)
function googleLogin() {
    // In production, this would use Google OAuth
    // For demo purposes, we'll create a user with Google email
    const googleEmail = `user${Date.now()}@gmail.com`;
    const googleName = 'Google User';
    
    const users = getUsers();
    let user = users.find(u => u.email === googleEmail);
    
    if (!user) {
        // Create new user
        user = {
            id: Date.now().toString(),
            name: googleName,
            email: googleEmail,
            password: null, // Google users don't need password
            createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('myfans_users', JSON.stringify(users));
    }
    
    // Set current user
    localStorage.setItem('myfans_current_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));
    
    return user;
}

// Get all users
function getUsers() {
    const stored = localStorage.getItem('myfans_users');
    return stored ? JSON.parse(stored) : [];
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
    loginFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        hideMessages();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        try {
            loginUser(email, password);
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'myfans.html';
            }, 1000);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Register form submission
    const registerFormElement = document.getElementById('registerFormElement');
    registerFormElement.addEventListener('submit', function(e) {
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
            registerUser(name, email, password);
            showSuccess('Registration successful! Logging you in...');
            setTimeout(() => {
                window.location.href = 'myfans.html';
            }, 1000);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Google login buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    googleLoginBtn.addEventListener('click', function() {
        hideMessages();
        try {
            googleLogin();
            showSuccess('Google login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'myfans.html';
            }, 1000);
        } catch (error) {
            showError('Google login failed. Please try again.');
        }
    });
    
    googleRegisterBtn.addEventListener('click', function() {
        hideMessages();
        try {
            googleLogin();
            showSuccess('Google registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'myfans.html';
            }, 1000);
        } catch (error) {
            showError('Google registration failed. Please try again.');
        }
    });
});

