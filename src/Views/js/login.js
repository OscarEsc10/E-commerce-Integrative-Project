import { authManager } from "./auth.js";
import { apiClient } from "./api.js";

/**
 * Login page functionality
 * Handles user authentication and redirects to dashboard
 */

class LoginManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.loading = document.getElementById('loading');
        this.alertContainer = document.getElementById('alert-container');
        
        this.initializeEventListeners();
        this.checkExistingAuth();
    }

    /**
     * Initialize event listeners for login form
     */
    initializeEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    /**
     * Check if user is already authenticated and redirect
     */
    checkExistingAuth() {
        // Don't auto-redirect, let user choose to navigate manually
        // This prevents infinite redirect loops
    }

    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    async handleLogin(e) {
        e.preventDefault();
        
        try {
            // Show loading state
            this.setLoadingState(true);
            this.clearAlerts();
            
            // Get form data
            const formData = new FormData(e.target);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            // Validate form data
            if (!this.validateLoginData(loginData)) {
                return;
            }

            // Make login API call
            const response = await apiClient.login(loginData.email, loginData.password);

            if (response.success) {
                // Store authentication data
                authManager.setToken(response.data.token);
                authManager.setUserData(response.data.user);
                
                // Show success message
                this.showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect based on user role
                setTimeout(() => {
                    this.redirectToDashboard(response.data.user.role);
                }, 1500);
            } else {
                this.showAlert(response.message || 'Login failed', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Connection error. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Validate login form data
     * @param {Object} loginData - Login form data
     * @returns {boolean} True if data is valid
     */
    validateLoginData(loginData) {
        if (!loginData.email || !loginData.password) {
            this.showAlert('Please fill in all fields', 'error');
            return false;
        }

        if (!this.isValidEmail(loginData.email)) {
            this.showAlert('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    }

    /**
     * Check if email format is valid
     * @param {string} email - Email to validate
     * @returns {boolean} True if email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Redirect user to appropriate dashboard based on role
     * @param {string} userRole - User's role (admin, seller, customer)
     */
    redirectToDashboard(userRole) {
        // All users go to main dashboard first, then they can navigate to specific sections
        window.location.href = '/dashboard.html';
    }

    /**
     * Set loading state for login button and form
     * @param {boolean} isLoading - Whether to show loading state
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.loginBtn.disabled = true;
            this.loginBtn.textContent = 'Signing in...';
            this.loading.classList.remove('hidden');
        } else {
            this.loginBtn.disabled = false;
            this.loginBtn.textContent = 'Iniciar Sesión';
            this.loading.classList.add('hidden');
        }
    }

    /**
     * Show alert message to user
     * @param {string} message - Message to display
     * @param {string} type - Alert type ('success' or 'error')
     */
    showAlert(message, type) {
        const bgColor = type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-green-50 border-green-200 text-green-700';
        
        this.alertContainer.innerHTML = `
            <div class="p-3 rounded-lg border text-sm ${bgColor}">
                <div class="flex items-center">
                    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} mr-2"></i>
                    ${message}
                </div>
            </div>
        `;

        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.clearAlerts();
            }, 3000);
        }
    }

    /**
     * Clear all alert messages
     */
    clearAlerts() {
        this.alertContainer.innerHTML = '';
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});
