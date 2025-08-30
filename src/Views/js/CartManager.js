// js/CartManager.js
import { apiClient } from './api.js';
import { authManager } from './auth.js';

export const cartManager = {
  async loadCart() {
    try {
      const resp = await apiClient.makeRequest('/cart', { method: 'GET' });
      const items = resp?.items || resp?.data?.items || [];
      this.renderCart(items);
      this.updateBadge(items.length);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      this.renderCart([]);
      this.updateBadge(0);
    }
  },

  async addItem(ebookId, quantity = 1) {
    try {
      await apiClient.makeRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ ebook_id: ebookId, quantity })
      });
      await this.loadCart();
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      throw err;
    }
  },

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

  async deleteItem(itemId) {
    try {
      await apiClient.makeRequest(`/cart/${itemId}`, { method: 'DELETE' });
      await this.loadCart();
    } catch (err) {
      console.error('Error al eliminar del carrito:', err);
    }
  },

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

  updateBadge(count) {
    const badge = document.querySelector('.cart-badge');
    if (badge) badge.textContent = count;
  }
};
