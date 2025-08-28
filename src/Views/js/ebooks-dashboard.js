import { authManager } from './auth.js';
import { apiClient } from './api.js';

class EbooksDashboard {
  constructor() {
    this.user = null;
    this.ebooks = [];
    this.categories = [];
    this.cart = [];
    this.init();
  }

  async init() {
    try {
      if (!authManager.requireAuth()) return;

      this.user = authManager.getUserData() || {};
      this.setupNavbar();
      await this.loadCategories();
      await this.loadEbooks();
      await this.loadCart();
      this.attachStaticListeners();
      this.toggleFeaturesByRole();
    } catch (err) {
      console.error('EbooksDashboard init error:', err);
      this.showError('Error al inicializar dashboard.');
    }
  }

  setupNavbar() {
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    const welcomeEl = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logout-btn');
    const backBtn = document.getElementById('btn-back-dashboard');
    const cartBtn = document.getElementById('btn-cart');
    const cartSection = document.getElementById('cart-section');

    if (userNameEl) userNameEl.textContent = this.user.name || 'Usuario';
    if (userAvatarEl) userAvatarEl.textContent = (this.user.name || 'U')[0].toUpperCase();
    if (welcomeEl) welcomeEl.textContent = `Bienvenido, ${this.user.name || 'Usuario'}`;

    if (logoutBtn) logoutBtn.addEventListener('click', () => authManager.logout());
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = '/dashboard.html');

    if (cartBtn && cartSection) {
      cartBtn.addEventListener('click', () => {
        cartSection.classList.toggle('hidden');
      });
    }
  }

  toggleFeaturesByRole() {
    const role = this.user.role || 'customer';
    const show = id => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); };
    const hide = id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };

    ['add-ebook-btn'].forEach(hide);

    if (role === 'admin' || role === 'seller') show('add-ebook-btn');
  }

  async loadCategories() {
    try {
      this.categories = await apiClient.getCategories();
      const catSelect = document.getElementById('filter-category');
      if (catSelect) {
        catSelect.innerHTML = `<option value="">Todas</option>`;
        this.categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.category_id;
          opt.textContent = cat.name;
          catSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
      this.showError('No se pudieron cargar las categorías.');
    }
  }

  async loadEbooks() {
    try {
      this.ebooks = await apiClient.getEbooks();
      this.renderEbooks(this.ebooks);
    } catch (err) {
      console.error('Error cargando ebooks:', err);
      this.showError('No se pudieron cargar los ebooks.');
    }
  }

  renderEbooks(ebooks) {
    const container = document.getElementById('ebooksContainer');
    if (!container) return;
    container.innerHTML = '';

    ebooks.forEach(ebook => {
      const price = parseFloat(ebook.price) || 0;
      const card = document.createElement('div');
      card.className = 'bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between';
      card.innerHTML = `
        <h4 class="font-semibold text-lg mb-2">${ebook.name}</h4>
        <p class="text-gray-600 text-sm mb-4">${ebook.description || ''}</p>
        <span class="font-bold text-indigo-600 mb-2">${price > 0 ? `$${price.toFixed(2)}` : '—'}</span>
        <button class="add-to-cart-btn bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors" data-id="${ebook.ebook_id}">Agregar al carrito</button>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', e => {
      const ebookId = parseInt(e.currentTarget.dataset.id); // currentTarget siempre es el botón
        if (!this.user?.id) {
        return this.showError('Usuario no identificado');
      }
        this.addToCart(ebookId);
      });
    });

  }

  attachStaticListeners() {
    const filterInput = document.getElementById('filter-input');
    const filterSelect = document.getElementById('filter-category');

    if (filterInput) {
      filterInput.addEventListener('input', async () => {
        const filtered = await apiClient.searchEbooks(filterInput.value);
        this.renderEbooks(filtered);
      });
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', async () => {
        const catId = parseInt(filterSelect.value);
        const filtered = catId ? await apiClient.getEbooksByCategory(catId) : await apiClient.getEbooks();
        this.renderEbooks(filtered);
      });
    }
  }

  async addToCart(ebookId) {
  try {
    await apiClient.addToCart({ 
      user_id: this.user.id, 
      ebook_id: ebookId, 
      quantity: 1 
    });
      this.showSuccess(`Ebook ID ${ebookId} agregado al carrito.`);
      await this.loadCart(); // 🔥 refresca la UI del carrito inmediatamente
    } catch (err) {
      console.error('Error agregando al carrito:', err);
      this.showError('No se pudo agregar al carrito.');
    }
  }

  async loadCart() {
  try {
    if (!this.user?.id) return;

    // Obtener el carrito desde la API
    this.cart = await apiClient.getCart(this.user.id);

    const cartSection = document.getElementById('cart-section');
    const cartContent = document.getElementById('cart-content');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    if (!cartSection || !cartContent || !cartCount || !cartTotal) return;

    // Limpiar el contenedor
    cartContent.innerHTML = '';

    let total = 0;

    this.cart.forEach(item => {
      const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center py-2 border-b';
        itemDiv.innerHTML = `
          <span>${item.ebook.name || '—'}</span>
          <span>$${item.quantity * (parseFloat(item.ebook.price) || 0).toFixed(2)}</span>
        `;
        cartContent.appendChild(itemDiv);
        total += (parseFloat(item.ebook.price) || 0) * item.quantity;
      });

        cartCount.textContent = this.cart.length;
        cartTotal.textContent = total.toFixed(2);
      } catch (err) {
        console.error('Error cargando carrito:', err);
        this.showError('No se pudo cargar el carrito.');
     }
   }


  renderCart() {
    const cartContent = document.getElementById('cart-content');
    const cartCount = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    if (!cartContent || !cartCount || !cartTotalEl) return;

    cartContent.innerHTML = '';
    let total = 0;

    this.cart.forEach(item => {
      const price = parseFloat(item.price) || 0;
      const subtotal = price * item.quantity;
      total += subtotal;

      const div = document.createElement('div');
      div.className = 'flex justify-between items-center mb-2 border-b pb-1';
      div.innerHTML = `
        <div>
          <p class="font-semibold">${item.name}</p>
          <p class="text-sm text-gray-600">$${price.toFixed(2)} x <input type="number" min="1" value="${item.quantity}" data-id="${item.cart_item_id}" class="w-12 border rounded p-1 inline-block"></p>
        </div>
        <button data-id="${item.cart_item_id}" class="text-red-500 hover:text-red-700 font-bold">&times;</button>
      `;
      cartContent.appendChild(div);

      // Eliminar item
      div.querySelector('button').addEventListener('click', async e => {
        await apiClient.deleteCartItem(parseInt(e.target.dataset.id));
        await this.loadCart();
      });

      // Cambiar cantidad
      div.querySelector('input').addEventListener('change', async e => {
        const newQty = parseInt(e.target.value);
        if (newQty < 1) return;
        await apiClient.updateCartItem(parseInt(e.target.dataset.id), newQty);
        await this.loadCart();
      });
    });

    cartCount.textContent = this.cart.length;
    cartTotalEl.textContent = total.toFixed(2);
  }

  showError(msg) { alert(msg); }
  showSuccess(msg) { alert(msg); }
}

window.dashboard = new EbooksDashboard();
