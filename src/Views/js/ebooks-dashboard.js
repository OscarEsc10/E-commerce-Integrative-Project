// js/EbooksDashboard.js
import { authManager } from './auth.js';
import { apiClient } from './api.js';
import { cartManager } from './CartManager.js';

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
      this.attachStaticListeners();
      this.toggleFeaturesByRole();
    } catch (err) {
      console.error('EbooksDashboard init error:', err);
      this.showError('Error al inicializar dashboard.');
    }
  }

  /* ------------------------
     Navbar
  ------------------------ */
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

    document.getElementById('btn-view-profile')?.addEventListener('click', async () => {
      document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
      document.getElementById('profile-section').classList.remove('hidden');
      await this.populateProfile();
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => authManager.logout());
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
      const resp = await apiClient.getEbooks();
      const allEbooks = Array.isArray(resp) ? resp : resp.data || [];
      const role = this.user.role || 'customer';

      if (role === 'admin') this.ebooks = allEbooks;
      else if (role === 'seller') this.ebooks = allEbooks.filter(e => e.seller_id === this.user.user_id);
      else this.ebooks = allEbooks;

      this.renderEbooks();
    } catch (err) {
      console.error('Error cargando ebooks:', err);
      this.showError('No se pudieron cargar los ebooks.');
    } finally {
      this.showSpinner(false);
    }
  }

  renderEbooks() {
    const grid = document.getElementById('ebooks-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!this.ebooks.length) {
      document.getElementById('empty-state')?.classList.remove('hidden');
      return;
    } else {
      document.getElementById('empty-state')?.classList.add('hidden');
    }

    this.ebooks.forEach(ebook => {
      const card = document.createElement('div');
      card.className = 'bg-white p-4 rounded-lg shadow';

      const title = document.createElement('h3');
      title.className = 'font-bold text-lg mb-2';
      title.textContent = ebook.name;

      const desc = document.createElement('p');
      desc.className = 'text-gray-600 mb-2';
      desc.textContent = ebook.description || '';

      const price = document.createElement('p');
      price.className = 'text-blue-600 font-semibold mb-2';
      price.textContent = `$${parseFloat(ebook.price || 0).toFixed(2)}`;

      const actions = document.createElement('div');
      actions.className = 'flex space-x-2';

      const role = this.user.role || 'customer';
      if (role === 'customer') {
        const addBtn = document.createElement('button');
        addBtn.className = 'px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm';
        addBtn.textContent = 'Añadir al carrito';
        addBtn.addEventListener('click', () => this.addToCart(ebook));
        actions.appendChild(addBtn);
      }

      if (role === 'seller' || role === 'admin') {
        const editBtn = document.createElement('button');
        editBtn.className = 'px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm';
        editBtn.textContent = 'Editar';
        editBtn.addEventListener('click', () => this.openEbookModal(ebook));
        actions.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.addEventListener('click', () => this.openDeleteModal(ebook));
        actions.appendChild(deleteBtn);
      }

      card.append(title, desc, price, actions);
      grid.appendChild(card);
    });

    this.updateEbooksCount();
  }

  addToCart(ebook) {
    this.cart.push(ebook);
    this.renderCart();
    this.showSuccess(`${ebook.name} añadido al carrito.`);
  }

  renderCart() {
    const cartEl = document.getElementById('cart-content');
    if (!cartEl) return;
    if (!this.cart.length) {
      cartEl.innerHTML = '<p class="text-gray-600">Carrito vacío</p>';
      return;
    }
    cartEl.innerHTML = '';
    this.cart.forEach((ebook, idx) => {
      const div = document.createElement('div');
      div.className = 'flex justify-between mb-2';
      div.innerHTML = `<span>${ebook.name} - $${parseFloat(ebook.price || 0).toFixed(2)}</span>
                       <button class="text-red-500" onclick="dashboard.removeFromCart(${idx})">X</button>`;
      cartEl.appendChild(div);
    });
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
