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

    if (userNameEl) userNameEl.textContent = this.user.full_name || this.user.name || 'Usuario';
    if (userRoleEl) userRoleEl.textContent = this.user.role || 'customer';
    if (welcomeEl) welcomeEl.textContent = `Bienvenido, ${this.user.full_name || this.user.name || 'Usuario'}`;
    if (userAvatarEl) userAvatarEl.textContent = (this.user.full_name || this.user.name || 'U')[0].toUpperCase();

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
    } finally {
      this.showSpinner(false);
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

  removeFromCart(idx) {
    this.cart.splice(idx,1);
    this.renderCart();
  }

  updateEbooksCount() {
    const countEl = document.getElementById('ebooks-count');
    if (countEl) countEl.textContent = `${this.ebooks.length} items`;
  }

  showSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (!spinner) return;
    spinner.classList.toggle('hidden', !show);
  }

  showError(msg) {
    const errEl = document.getElementById('error-message');
    const errText = document.getElementById('error-text');
    if (errEl && errText) {
      errText.textContent = msg;
      errEl.classList.remove('hidden');
      setTimeout(() => errEl.classList.add('hidden'), 3000);
    }
  }

  showSuccess(msg) {
    const sucEl = document.getElementById('success-message');
    const sucText = document.getElementById('success-text');
    if (sucEl && sucText) {
      sucText.textContent = msg;
      sucEl.classList.remove('hidden');
      setTimeout(() => sucEl.classList.add('hidden'), 3000);
    }
  }

  /* ------------------------
     Listeners
  ------------------------ */
  attachStaticListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        const filtered = this.ebooks.filter(eb => eb.name.toLowerCase().includes(term));
        this.renderFilteredEbooks(filtered);
      });
    }

    const addBtn = document.getElementById('add-ebook-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.openEbookModal());
  }

  renderFilteredEbooks(list) {
    const grid = document.getElementById('ebooks-grid');
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach(ebook => {
      const div = document.createElement('div');
      div.textContent = ebook.name; 
      grid.appendChild(div);
    });
  }

  openEbookModal(ebook=null) {
    const modal = document.getElementById('ebook-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    if (ebook) {
      document.getElementById('ebook-id').value = ebook.id || '';
      document.getElementById('ebook-name').value = ebook.name || '';
      document.getElementById('ebook-description').value = ebook.description || '';
      document.getElementById('ebook-price').value = ebook.price || '';
      document.getElementById('ebook-category').value = ebook.category_id || '';
    } else {
      document.getElementById('ebook-form').reset();
    }

    document.getElementById('close-modal')?.addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('cancel-btn')?.addEventListener('click', () => modal.classList.add('hidden'));

    document.getElementById('ebook-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveEbook();
      modal.classList.add('hidden');
    }, {once:true});
  }

  async saveEbook() {
    const id = document.getElementById('ebook-id').value;
    const name = document.getElementById('ebook-name').value;
    const description = document.getElementById('ebook-description').value;
    const price = parseFloat(document.getElementById('ebook-price').value);
    const category_id = document.getElementById('ebook-category').value;

    try {
      if (id) await apiClient.updateEbook(id, {name, description, price, category_id});
      else await apiClient.createEbook({name, description, price, category_id, seller_id:this.user.user_id});
      this.showSuccess(id ? 'Ebook actualizado' : 'Ebook creado');
      await this.loadEbooks();
    } catch (err) {
      console.error(err);
      this.showError('Error al guardar ebook');
    }
  }

  openDeleteModal(ebook) {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.getElementById('delete-ebook-name').textContent = ebook.name || '';

    document.getElementById('cancel-delete')?.addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('confirm-delete')?.addEventListener('click', async () => {
      try {
        await apiClient.deleteEbook(ebook.id);
        this.showSuccess('Ebook eliminado');
        await this.loadEbooks();
      } catch (err) {
        console.error(err);
        this.showError('Error al eliminar ebook');
      } finally {
        modal.classList.add('hidden');
      }
    }, {once:true});
  }
}

// Inicialización global
window.dashboard = new EbooksDashboard();
