/**
 * Authentication utilities for managing JWT tokens and user sessions
 * Handles token storage, validation, and user authentication state
 */

class AuthManager {
    constructor() {
        this.tokenKey = 'jwt_token';
        this.userKey = 'user_data';
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setUserData(userData) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
    }

    getUserData() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    isAuthenticated() {
        const token = this.getToken();
        console.log('Checking token:', token ? 'exists' : 'missing');
        
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const isValid = payload.exp > currentTime;
            console.log('Token valid:', isValid, 'expires:', new Date(payload.exp * 1000));
            return isValid;
        } catch (error) {
            console.error('Invalid token format:', error);
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            return false;
        }
    }

    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    logout() {
        console.log('Logout called - clearing localStorage');
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.clear(); // Clear all localStorage just in case
        console.log('Redirecting to /login');
        window.location.href = '/login';
    }

    requireAuth() {
        console.log('Checking authentication...');
        const isAuth = this.isAuthenticated();
        console.log('Is authenticated:', isAuth);
        
        if (!isAuth) {
            console.log('Not authenticated, redirecting to login');
            window.location.href = '/login';
            return false;
        }
        console.log('Authentication check passed');
        return true;
    }

    hasRole(allowedRoles) {
        const userData = this.getUserData();
        if (!userData || !userData.role) return false;

        const userRole = userData.role.toLowerCase();
        const roles = Array.isArray(allowedRoles)
            ? allowedRoles.map(r => r.toLowerCase())
            : [allowedRoles.toLowerCase()];

        return roles.includes(userRole);
    }

    initializeUI() {
        const userData = this.getUserData();
        if (!userData) return;

        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = userData.name || userData.full_name || 'User';
        }

        const userRoleElement = document.getElementById('user-role');
        if (userRoleElement && userData.role) {
            const role = userData.role.toLowerCase();
            userRoleElement.textContent = role.charAt(0).toUpperCase() + role.slice(1);

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

// 👇 exportación clara
export const authManager = new AuthManager();
