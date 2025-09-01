// src/Views/js/CartManager.js
// CartManager: handles cart operations (add, remove, update, render, badge updates)
// Integrates with backend API and manages local cart state

import { apiClient } from './api.js';
import { authManager } from './auth.js';

export const cartManager = {
  /**
   * Array of cart items currently in the cart
   */
  cartItems: [],

  /**
   * Get all cart items
   * @returns {Array}
   */
  getCartItems() {
    return this.cartItems || [];
  },

  /**
   * Clear the cart (server and local)
   */
  async clearCart() {
    try {
      // Try to clear cart on server
      await apiClient.makeRequest('/cart/clear', { method: 'DELETE' });
    } catch (err) {
      console.error('Error clearing cart on server:', err);
    }
    
    // Always clear locally and reset completely
    this.cartItems = [];
    this.updateBadge(0);
    this.renderCart([]);
    
    // Force update all UI elements
    this.forceUpdateAllBadges();
    
    // Trigger custom event to notify other components
    window.dispatchEvent(new CustomEvent('cartCleared'));
  },

  /**
   * Update all cart badges in the UI to show the current count
   */
  forceUpdateAllBadges() {
    const badges = [
      document.querySelector('.cart-badge'),
      document.getElementById('cart-count-badge'),
      document.getElementById('cart-count'),
      document.querySelector('#cart-count'),
      document.querySelector('[id*="cart"]')
    ];
    
    badges.forEach(badge => {
      if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    });
  },

  /**
   * Remove an item from the cart by ebookId
   */
  async removeItem(ebookId) {
    try {
      // Try to remove from server first
      const itemToRemove = this.cartItems.find(item => item.ebook_id === ebookId);
      if (itemToRemove && itemToRemove.cart_item_id) {
        await this.deleteItem(itemToRemove.cart_item_id);
      }
    } catch (err) {
      console.error('Error removing from server, removing locally:', err);
    }
    
    // Always remove locally
    this.cartItems = this.cartItems.filter(item => item.ebook_id !== ebookId);
    this.updateBadge(this.cartItems.length);
    this.renderCart(this.cartItems);
  },

  /**
   * Load cart items from the server
   */
  async loadCart() {
    try {
      const resp = await apiClient.makeRequest('/cart', { method: 'GET' });
      const items = resp?.items || resp?.data?.items || [];
      this.cartItems = items;
      this.renderCart(items);
      this.updateBadge(items.length);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      this.cartItems = [];
      this.renderCart([]);
      this.updateBadge(0);
    }
  },

  /**
   * Add an item to the cart
   */
  async addItem(ebookId, quantity = 1, ebookData = null) {
    try {
      await apiClient.makeRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ ebook_id: ebookId, quantity })
      });
      await this.loadCart();
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      // Fallback: add to local cart if API fails
      const existingItem = this.cartItems.find(item => item.ebook_id === ebookId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.cartItems.push({
          ebook_id: ebookId,
          quantity: quantity,
          ebook_name: ebookData?.name || `Ebook ${ebookId}`,
          ebook_price: ebookData?.price || 0,
          name: ebookData?.name || `Ebook ${ebookId}`,
          price: ebookData?.price || 0
        });
      }
      // Always update badge with correct count
      const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
      this.updateBadge(totalItems);
      
      // Trigger cart updated event
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { items: this.cartItems, total: totalItems } 
      }));
    }
  },

  /**
   * Update the quantity of a cart item
   */
  async updateItem(itemId, quantity) {
    try {
      await apiClient.makeRequest(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      await this.loadCart();
    } catch (err) {
      console.error('Error al actualizar carrito:', err);
    }
  },

  /**
   * Delete a cart item by itemId
   */
  async deleteItem(itemId) {
    try {
      await apiClient.makeRequest(`/cart/${itemId}`, { method: 'DELETE' });
      await this.loadCart();
    } catch (err) {
      console.error('Error al eliminar del carrito:', err);
    }
  },

  /**
   * Render the cart items in the UI
   * @param {Array} items - Array of cart items
   */
  renderCart(items) {
    const list = document.getElementById('cart-list');
    if (!list) return;

    list.innerHTML = '';

    if (!items.length) {
      list.innerHTML = `<p class="text-gray-600">Carrito vacío 🚀</p>`;
      return;
    }

      items.forEach(item => {
    const cartId = item.cart_item_id;
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center border-b py-2';
    div.innerHTML = `
      <span>
        ${item.ebook_name ?? item.title ?? item.name ?? '—'} 
        (x${item.quantity})
      </span>
      <div class="flex gap-3 items-center">
        <span class="font-semibold">$${Number(item.ebook_price ?? item.price ?? 0).toFixed(2)}</span>
        <input type="number" min="1" value="${item.quantity}" 
          class="w-16 border rounded px-1 cart-qty-input" 
          data-id="${cartId}">
        <button class="cart-delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${item.cart_item_id ?? item.id}">
          Eliminar
        </button>
        </div>
        `;
        list.appendChild(div);
     });

    // Eventos de inputs y botones
  list.querySelectorAll('.cart-qty-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = e.target.dataset.id;
      const qty = parseInt(e.target.value);
      if (qty > 0) this.updateItem(id, qty);
    });
  });

    list.querySelectorAll('.cart-delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.dataset.id;
            this.deleteItem(id);
        });
     });
    },

  /**
   * Update the cart badge count in the UI
   * @param {number} count - Number of items in cart
   */
  updateBadge(count) {
    // Update all possible cart badges
    const badges = [
      document.querySelector('.cart-badge'),
      document.getElementById('cart-count-badge'),
      document.getElementById('cart-count')
    ];
    
    badges.forEach(badge => {
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    });
  }
};
