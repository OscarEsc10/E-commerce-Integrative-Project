/**
 * API utilities for making HTTP requests to the e-commerce backend
 * Handles all CRUD operations for ebooks, categories, and authentication
 */

class ApiClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make HTTP request with proper error handling
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Fetch options (method, headers, body, etc.)
     * @returns {Promise<Object>} API response data
     */
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                ...options,
                headers: {
                    ...this.defaultHeaders,
                    ...authManager.getAuthHeaders(),
                    ...options.headers
                }
            };

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Handle authentication errors - but don't auto-logout on API errors
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                console.warn('Authentication error in API call:', error.message);
                // Don't automatically logout, let the calling code handle it
            }
            
            throw error;
        }
    }

    // ==================== AUTHENTICATION ENDPOINTS ====================

    /**
     * User login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response with token and user data
     */
    async login(email, password) {
        return this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    /**
     * User registration
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async register(userData) {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Get user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        return this.makeRequest('/auth/profile');
    }

    /**
     * Update user profile
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object>} Updated profile response
     */
    async updateProfile(profileData) {
        return this.makeRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // ==================== EBOOKS CRUD ENDPOINTS ====================

    /**
     * Get all ebooks (filtered by user role)
     * @returns {Promise<Array>} Array of ebook objects
     */
    async getEbooks() {
        const response = await this.makeRequest('/ebooks');
        return response.data || [];
    }

    /**
     * Get single ebook by ID
     * @param {number} ebookId - Ebook ID
     * @returns {Promise<Object>} Ebook object
     */
    async getEbook(ebookId) {
        const response = await this.makeRequest(`/ebooks/${ebookId}`);
        return response.data || response.ebook;
    }

    /**
     * Create new ebook
     * @param {Object} ebookData - Ebook data (name, description, price, category_id)
     * @returns {Promise<Object>} Created ebook object
     */
    async createEbook(ebookData) {
        const response = await this.makeRequest('/ebooks', {
            method: 'POST',
            body: JSON.stringify(ebookData)
        });
        return response.ebook;
    }

    /**
     * Update existing ebook
     * @param {number} ebookId - Ebook ID to update
     * @param {Object} ebookData - Updated ebook data
     * @returns {Promise<Object>} Updated ebook object
     */
    async updateEbook(ebookId, ebookData) {
        const response = await this.makeRequest(`/ebooks/${ebookId}`, {
            method: 'PUT',
            body: JSON.stringify(ebookData)
        });
        return response.ebook;
    }

    /**
     * Delete ebook
     * @param {number} ebookId - Ebook ID to delete
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteEbook(ebookId) {
        return this.makeRequest(`/ebooks/${ebookId}`, {
            method: 'DELETE'
        });
    }

    // ==================== CATEGORIES ENDPOINTS ====================

    /**
     * Get all categories
     * @returns {Promise<Array>} Array of category objects
     */
    async getCategories() {
        const response = await this.makeRequest('/categories');
        return response.data || response.categories || [];
    }

    /**
     * Create new category (admin only)
     * @param {Object} categoryData - Category data (name, description)
     * @returns {Promise<Object>} Created category object
     */
    async createCategory(categoryData) {
        const response = await this.makeRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
        return response.category;
    }

    /**
     * Update category (admin only)
     * @param {number} categoryId - Category ID to update
     * @param {Object} categoryData - Updated category data
     * @returns {Promise<Object>} Updated category object
     */
    async updateCategory(categoryId, categoryData) {
        const response = await this.makeRequest(`/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
        return response.category;
    }

    /**
     * Delete category (admin only)
     * @param {number} categoryId - Category ID to delete
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteCategory(categoryId) {
        return this.makeRequest(`/categories/${categoryId}`, {
            method: 'DELETE'
        });
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Check API health
     * @returns {Promise<Object>} Health check response
     */
    async healthCheck() {
        return this.makeRequest('/health');
    }

    /**
     * Search ebooks by name or description
     * @param {string} query - Search query
     * @returns {Promise<Array>} Filtered ebooks array
     */
    async searchEbooks(query) {
        const ebooks = await this.getEbooks();
        if (!query) return ebooks;

        const searchTerm = query.toLowerCase();
        return ebooks.filter(ebook => 
            ebook.name.toLowerCase().includes(searchTerm) ||
            (ebook.description && ebook.description.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Get ebooks by category
     * @param {number} categoryId - Category ID to filter by
     * @returns {Promise<Array>} Filtered ebooks array
     */
    async getEbooksByCategory(categoryId) {
        const ebooks = await this.getEbooks();
        return ebooks.filter(ebook => ebook.category_id === categoryId);
    }
}

// Create global API client instance
const apiClient = new ApiClient();

// Export for use in other modules
window.apiClient = apiClient;
