// src/Views/js/cart.js
// Cart page logic for rendering cart items and handling quantity changes/removal

import { cartManager } from './CartManager.js';

// Initialize cart and render items when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await cartManager.init();
  renderCartItems();
});

function renderCartItems() {
  // Render cart items in the cart list element
  const list = document.getElementById('cart-list');
  const items = cartManager.getCart();

  if (!items.length) {
    list.innerHTML = `<p class="text-gray-600">Tu carrito está vacío.</p>`;
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="flex justify-between items-center border-b py-3">
      <div>
        <p class="font-semibold">${item.name}</p>
        <p class="text-sm text-gray-500">$${item.price} x ${item.quantity}</p>
      </div>
      <div class="flex items-center space-x-2">
        <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="cart-qty w-16 border rounded text-center"/>
        <button data-id="${item.id}" class="remove-btn text-red-600">Eliminar</button>
      </div>
    </div>
  `).join('');

  // Eventos
  list.querySelectorAll('.cart-qty').forEach(input => {
    input.addEventListener('change', e => {
      cartManager.updateQuantity(input.dataset.id, parseInt(input.value));
      renderCartItems();
    });
  });

  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      cartManager.removeItem(btn.dataset.id);
      renderCartItems();
    });
  });
}
