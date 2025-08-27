/**
 * Authentication utilities for managing JWT tokens and user sessions
 * Handles token storage, validation, and user authentication state
 */

class AuthManager {
    constructor() {
        this.tokenKey = 'jwt_token';
        this.userKey = 'user_data';
    }

    /**
     * Store JWT token in localStorage
     * @param {string} token - JWT token from login response
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * Get JWT token from localStorage
     * @returns {string|null} JWT token or null if not found
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Store user data in localStorage
     * @param {Object} userData - User information from API
     */
    setUserData(userData) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
    }

    /**
     * Get user data from localStorage
     * @returns {Object|null} User data object or null if not found
     */
    getUserData() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} True if user has valid token
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Basic JWT token validation (check if not expired)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            console.error('Invalid token format:', error);
            // Clear invalid token but don't redirect
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            return false;
        }
    }

    /**
     * Get authorization headers for API requests
     * @returns {Object} Headers object with Authorization bearer token
     */
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Clear all authentication data and redirect to login
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        // Manual redirect only when logout button is clicked
        window.location.href = '/';
    }

    /**
     * Redirect to login page if user is not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }

    /**
     * Check if user has specific role
     * @param {string|Array} allowedRoles - Role name or array of role names
     * @returns {boolean} True if user has required role
     */
    hasRole(allowedRoles) {
        const userData = this.getUserData();
        if (!userData || !userData.role) return false;

        const userRole = userData.role.toLowerCase();
        const roles = Array.isArray(allowedRoles) 
            ? allowedRoles.map(r => r.toLowerCase()) 
            : [allowedRoles.toLowerCase()];

        return roles.includes(userRole);
    }

    /**
     * Initialize user interface with authentication data
     */
    initializeUI() {
        const userData = this.getUserData();
        if (!userData) return;

        // Update user name in UI
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = userData.name || userData.full_name || 'User';
        }

        // Update user role badge in UI
        const userRoleElement = document.getElementById('user-role');
        if (userRoleElement && userData.role) {
            const role = userData.role.toLowerCase();
            userRoleElement.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            
            // Apply role-specific styling
            userRoleElement.className = 'px-2 py-1 text-xs rounded-full ';
            switch (role) {
                case 'admin':
                    userRoleElement.className += 'bg-red-100 text-red-800';
                    break;
                case 'seller':
                    userRoleElement.className += 'bg-green-100 text-green-800';
                    break;
                case 'customer':
                    userRoleElement.className += 'bg-blue-100 text-blue-800';
                    break;
                default:
                    userRoleElement.className += 'bg-gray-100 text-gray-800';
            }
        }
    }
}

// Create global instance
const authManager = new AuthManager();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize UI, don't auto-redirect
    authManager.initializeUI();

    // Setup logout button if present
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.logout();
        });
    }
});
