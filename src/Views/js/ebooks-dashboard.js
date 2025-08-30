// js/EbooksDashboard.js
import { authManager } from './auth.js';
import { apiClient } from './api.js';
import { cartManager } from './CartManager.js';

class EbooksDashboard {
  constructor() {
    this.user = null;
    this.ebooks = [];
    this.categories = [];
    this.init();
  }

  async init() {
    try {
      if (!authManager.requireAuth()) return;

      this.user = authManager.getUserData() || {};
      this.setupNavbar();
      await this.loadCategories();
      await this.loadEbooks();
      await cartManager.loadCart(); // ✅ cargar carrito desde DB
      this.attachStaticListeners();
      this.toggleFeaturesByRole();

      // ✅ refrescar carrito cuando cambie
      window.addEventListener("cartUpdated", () => cartManager.renderCart());
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
        cartManager.renderCart(); // ✅ mostrar carrito actualizado
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
        <span class="font-bold text-indigo-600 mb-2">${price > 0 ? `$${price.toFixed(2)}` : 'Gratis'}</span>
        <button class="add-to-cart-btn bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors" data-id="${ebook.ebook_id}">
          Agregar al carrito
        </button>
      `;
      container.appendChild(card);
    });

    // ✅ Eventos de agregar al carrito
    container.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const ebookId = parseInt(e.currentTarget.dataset.id);
        await cartManager.addItem(ebookId, 1);
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

  showError(msg) { alert(msg); }
  showSuccess(msg) { alert(msg); }
}

window.dashboard = new EbooksDashboard();
