// API client for making HTTP requests to the backend
// Includes methods for authentication, ebooks, categories, seller requests, and utility functions

import { authManager } from "./auth.js";

/**
 * API utilities for making HTTP requests to the backend
 */
export class ApiClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make a generic HTTP request to the backend
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
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
            throw error;
        }
    }

    // ==================== AUTH ====================
    /**
     * Login with email and password
     */
    async login(email, password) {
        return this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    /**
     * Register a new user
     */
    async register(userData) {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Get current user profile
     */
    async getProfile() {
        return this.makeRequest('/auth/profile');
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        return this.makeRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // ==================== EBOOKS ====================
    /**
     * Get all ebooks
     */
    async getEbooks() {
        console.log('API: Getting ebooks...');
        const resp = await this.makeRequest('/ebooks');
        console.log('API: Ebooks response:', resp);
        return resp.data || resp.ebooks || [];
    }

    /**
     * Get ebook by ID
     */
    async getEbook(ebookId) {
        const resp = await this.makeRequest(`/ebooks/${ebookId}`);
        return resp.data || resp.ebook;
    }

    /**
     * Search ebooks by query
     */
    async searchEbooks(query) {
        const ebooks = await this.getEbooks();
        if (!query) return ebooks;
        const term = query.toLowerCase();
        return ebooks.filter(e => e.name.toLowerCase().includes(term) ||
        (e.description && e.description.toLowerCase().includes(term)));
    }

    /**
     * Get ebooks by category
     */
    async getEbooksByCategory(categoryId) {
        const ebooks = await this.getEbooks();
        return ebooks.filter(e => e.category_id === categoryId);
    }

    /**
     * Create a new ebook
     */
    async createEbook(data) {
        const resp = await this.makeRequest('/ebooks', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return resp.ebook;
    }

    /**
     * Update an ebook by ID
     */
    async updateEbook(id, data) {
        const resp = await this.makeRequest(`/ebooks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return resp.ebook;
    }

    /**
     * Delete an ebook by ID
     */
    async deleteEbook(id) {
        return this.makeRequest(`/ebooks/${id}`, { method: 'DELETE' });
    }

    // ==================== CATEGORIES ====================
    /**
     * Get all categories
     */
    async getCategories() {
        const resp = await this.makeRequest('/categories');
        return resp.data || resp.categories || [];
    }

    /**
     * Create a new category
     */
    async createCategory(data) {
        const resp = await this.makeRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return resp.category;
    }

    /**
     * Update a category by ID
     */
    async updateCategory(id, data) {
        const resp = await this.makeRequest(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return resp.category;
    }

    /**
     * Delete a category by ID
     */
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

    /**
     * Create a seller request
     */
    async createSellerRequest(data) {
    const response = await this.makeRequest('/seller-requests', {
    method: 'POST',
    body: JSON.stringify(data)
    });
    return response.data || response.request || response;
    }

    /**
     * Get all seller requests (admin)
     */
    async getSellerRequests() {
    const response = await this.makeRequest('/seller-requests');
    return response.data || response.sellerRequests || [];
    }

    /**
     * Update seller request status (approve/reject)
     */
    async updateSellerRequestStatus(request_id, sr_status_id) {
    const response = await this.makeRequest(`/    seller-requests/${request_id}`, {
        method: 'PUT',
        body: JSON.stringify({ sr_status_id })
        });
        return response.data || response.sellerRequest || response;
    }
}   

// Create global API client instance
export const apiClient = new ApiClient();
