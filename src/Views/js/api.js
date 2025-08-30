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

    async searchEbooks(query) {
        const ebooks = await this.getEbooks();
        if (!query) return ebooks;
        const term = query.toLowerCase();
        return ebooks.filter(e => e.name.toLowerCase().includes(term) ||
        (e.description && e.description.toLowerCase().includes(term)));
    }

    async getEbooksByCategory(categoryId) {
        const ebooks = await this.getEbooks();
        return ebooks.filter(e => e.category_id === categoryId);
    }

    async createEbook(data) {
        const resp = await this.makeRequest('/ebooks', {
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

    // ==================== CART ====================
    async getCart() {
        // Obtiene carrito del usuario autenticado (usa token)
        const resp = await this.makeRequest('/cart');
        return resp.data || resp.cart || [];
    }

    async addToCart(cartItem) {
        // cartItem = { ebook_id, quantity }
        const resp = await this.makeRequest('/cart', {
            method: 'POST',
            body: JSON.stringify(cartItem)
        });
        return resp.data || resp.cartItem || resp;
    }

    async updateCartItem(cartItemId, quantity) {
        const resp = await this.makeRequest(`/cart/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
        return resp.data || resp.cartItem || resp;
    }

    async deleteCartItem(cartItemId) {
        return this.makeRequest(`/cart/${cartItemId}`, { method: 'DELETE' });
    }

    async createSellerRequest(data) {
    const response = await this.makeRequest('/seller-requests', {
    method: 'POST',
    body: JSON.stringify(data)
    });
    return response.data || response.request || response;
    }

    // Obtener todas las solicitudes (para admin)
    async getSellerRequests() {
    const response = await this.makeRequest('/seller-requests');
    return response.data || response.sellerRequests || [];
    }

    // Actualizar estado de solicitud (aprobar/rechazar)
    async updateSellerRequestStatus(request_id, sr_status_id) {
    const response = await this.makeRequest(`/    seller-requests/${request_id}`, {
        method: 'PUT',
        body: JSON.stringify({ sr_status_id })
        });
        return response.data || response.sellerRequest || response;
    }
}   

export const apiClient = new ApiClient();
