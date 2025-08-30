import { authManager } from "./auth.js";

/**
 * API utilities for making HTTP requests to the backend
 */

class ApiClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

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
            throw error;
        }
    }

    // ==================== AUTH ====================
    async login(email, password) {
        return this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getProfile() {
        return this.makeRequest('/auth/profile');
    }

    async updateProfile(profileData) {
        return this.makeRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // ==================== EBOOKS ====================
    async getEbooks() {
        const resp = await this.makeRequest('/ebooks');
        return resp.data || resp.ebooks || [];
    }

    async getEbook(ebookId) {
        const resp = await this.makeRequest(`/ebooks/${ebookId}`);
        return resp.data || resp.ebook;
    }

    /**
     * Create new ebook
     * @param {Object} ebookData - Ebook data (name, description, price, category_id)
     * @returns {Promise<Object>} Created ebook object
     */
    async createEbook(ebookData) {
        const response = await this.makeRequest('/ebooks', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return resp.ebook;
    }

    async updateEbook(id, data) {
        const resp = await this.makeRequest(`/ebooks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return resp.ebook;
    }

    async deleteEbook(id) {
        return this.makeRequest(`/ebooks/${id}`, { method: 'DELETE' });
    }

    // ==================== CATEGORIES ====================
    async getCategories() {
        const resp = await this.makeRequest('/categories');
        return resp.data || resp.categories || [];
    }

    async createCategory(data) {
        const resp = await this.makeRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return resp.category;
    }

    async updateCategory(id, data) {
        const resp = await this.makeRequest(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return resp.category;
    }

    async deleteCategory(id) {
        return this.makeRequest(`/categories/${id}`, { method: 'DELETE' });
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
export const apiClient = new ApiClient();
