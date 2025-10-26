document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;
            
            // Show loading state
            const loginBtn = document.querySelector('.login-btn');
            const originalBtnText = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول';
            
            // Small delay to show loading state
            setTimeout(() => {
                try {
                    // Validate credentials
                    const user = validateCredentials(email, password);
                    
                    if (user) {
                        // Prepare user data for storage
                        const userData = {
                            id: user.id,
                            username: user.username || '',
                            name: user.name || '',
                            position: user.position || '',
                            email: user.email || '',
                            avatar: user.avatar || 'images/profile-placeholder.png',
                            role: user.role || 'aadhou',
                            allowedButtons: user.allowedButtons || [user.role || 'aadhou']
                        };
                        
                        // Save to localStorage if "Remember me" is checked
                        try {
                            if (rememberMe) {
                                localStorage.setItem('rememberedUser', JSON.stringify(userData));
                            } else {
                                localStorage.removeItem('rememberedUser');
                            }
                            
                            // Save user session
                            sessionStorage.setItem('currentUser', JSON.stringify(userData));
                            
                            // Redirect to index.html
                            window.location.href = 'index.html';
                            return; // Exit the function after successful login
                        } catch (storageError) {
                            console.error('Error saving user data:', storageError);
                            showError('حدث خطأ في حفظ بيانات الجلسة. يرجى المحاولة مرة أخرى.');
                        }
                    } else {
                        showError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    showError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
                }
                
                // Reset login button if login failed
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnText;
            }, 500); // 0.5 second delay
        });
    }
    
    // Check for remembered user
    checkRememberedUser();
    
    // Contact admin link
    const contactAdmin = document.getElementById('contactAdmin');
    if (contactAdmin) {
        contactAdmin.addEventListener('click', function(e) {
            e.preventDefault();
            alert('للاستفسار عن إنشاء حساب جديد، يرجى التواصل مع مدير النظام على البريد الإلكتروني: elbarakamosta@gmail.com');
        });
    }
});

// Function to initialize user map
function initializeUserMap() {
    // Ensure users data is available
    if (!window.users || !Array.isArray(window.users)) {
        console.error('Users data is not properly loaded');
        return {};
    }

    // Create an email-to-user map for easy lookup
    return window.users.reduce((map, user) => {
        if (user && user.email) {
            map[user.email.toLowerCase()] = user;
        }
        return map;
    }, {});
}

// Initialize user map
const userMap = initializeUserMap();

// Validate user credentials
function validateCredentials(email, password) {
    if (!email || !password) {
        return null;
    }
    
    const user = userMap[email.toLowerCase()];
    
    if (user && user.password === password) {
        // Create a clean user object without the password
        const { password: _, ...userData } = user;
        return {
            ...userData,
            allowedButtons: [user.role]
        };
    }
    
    return null;
}

// Show error message
function showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#cb2127';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.padding = '10px';
    errorDiv.style.backgroundColor = '#fde8e8';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.borderRight = '3px solid #cb2127';
    errorDiv.textContent = message;
    
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.parentNode.insertBefore(errorDiv, loginBtn.nextSibling);
    }
    
    // Auto remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                errorDiv.remove();
            }, 300);
        }
    }, 5000);
}

// Check for remembered user
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        try {
            const user = JSON.parse(rememberedUser);
            document.getElementById('email').value = user.email;
            document.getElementById('remember').checked = true;
        } catch (e) {
            console.error('Error parsing remembered user:', e);
        }
    }
}

// Function to check if user is logged in (to be used in index.html)
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
    return currentUser ? JSON.parse(currentUser) : null;
}

// Function to log out
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
