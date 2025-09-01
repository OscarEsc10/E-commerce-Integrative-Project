/**
 * Ebooks Dashboard View Logic
 * Handles displaying, filtering, and paginating ebooks for the dashboard view.
 * Supports category filtering, search, donation condition, and role-based features.
 */
import { authManager } from './auth.js';
import { apiClient } from './api.js';
import { cartManager } from './CartManager.js';

class EbooksDashboard {
  constructor() {
    this.user = null;
    this.ebooks = [];
    this.categories = [];
    this.currentPage = 1;
    this.itemsPerPage = 6;
    this.totalPages = 1;
    this.totalItems = 0;

   /**
    * Initialize dashboard and load user, categories, and ebooks.
    */
    this.init();
  }

  /**
  * Initialize dashboard logic, navbar, categories, and ebooks.
  */
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
    this.showError('Error initializing dashboard.');
        }

    this.conditionSelect = document.getElementById('ebook-condition');
      if (this.conditionSelect) {
      this.conditionSelect.addEventListener('change', async () => {
      this.currentPage = 1;
      await this.loadEbooks();
      });
    }

  }

  /**
  * Set up the navbar with user info and navigation buttons.
  */
  setupNavbar() {
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    const welcomeEl = document.getElementById('welcomeMessage');
    const logoutBtn = document.getElementById('logout-btn');
    const backBtn = document.getElementById('btn-back-dashboard');

   if (userNameEl) userNameEl.textContent = this.user.full_name || this.user.name || 'User';
   if (welcomeEl) welcomeEl.textContent = `Welcome, ${this.user.full_name || this.user.name || 'User'}`;
   if (userAvatarEl) userAvatarEl.textContent = (this.user.full_name || this.user.name || 'U')[0].toUpperCase();

    if (logoutBtn) logoutBtn.addEventListener('click', () => authManager.logout());
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = '/dashboard');
  }

  /**
  * Show/hide features based on user role (admin/seller/customer).
  */
  toggleFeaturesByRole() {
    const role = this.user.role || 'customer';
    const addBtn = document.getElementById('add-ebook-btn');
    if (addBtn) {
      if (role === 'admin' || role === 'seller') addBtn.classList.remove('hidden');
      else addBtn.classList.add('hidden');
    }
  }

  /**
  * Load categories from API and populate category filter dropdown.
  */
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
    this.showError('Could not load categories.');
    }
  }

  /**
  * Load ebooks from API, with optional search and condition filters.
  * Handles pagination and donation condition.
  */
  async loadEbooks(searchTerm = '', condition = '') {
  try {
    this.showSpinner(true);

    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('filter-category');

    const search = searchTerm || (searchInput ? searchInput.value.trim() : '');
    const category = categorySelect ? categorySelect.value : '';

    const page = this.currentPage || 1;
    const limit = this.itemsPerPage || 6;

    // Endpoint por condición o general
    let apiUrl = '';
    if (condition) {
      apiUrl = `http://localhost:3000/api/ebooks/condition/${condition}`;
    } else {
      apiUrl = `http://localhost:3000/api/ebooks/paginated?page=${page}&limit=${limit}`;
      if (search) apiUrl += `&search=${encodeURIComponent(search)}`;
      if (category) apiUrl += `&category=${category}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.success) throw new Error(data.message || 'Error cargando ebooks');

    const ebooks = data.ebooks || data.data || [];

    // Separar ebooks de donación si condition = 3
    if (condition === '3') {
      this.renderEbooks(ebooks, '3');
      return;
    }

    // Guardar para paginación si no es donación
    this.ebooks = ebooks;
    this.totalPages = data.pagination?.totalPages || 1;
    this.totalItems = data.pagination?.totalItems || ebooks.length;

    this.renderEbooks(this.ebooks);
    this.renderPagination();

  } catch (err) {
    console.error('Error cargando ebooks:', err);
   this.showError('Could not load ebooks: ' + err.message);
  } finally {
    this.showSpinner(false);
  }
}

  /**
  * Render the ebooks as cards in the dashboard view.
  * Handles donation condition and empty state.
  */
renderEbooks(ebooks, condition = '') {
  const container = condition === '3'
    ? document.getElementById('donate-grid')
    : document.getElementById('ebooksContainer');

  if (!container) return;

  container.innerHTML = '';
  if (ebooks.length === 0) {
   container.innerHTML = '<div class="text-center text-gray-500 py-8">No ebooks available</div>';
    return;
  }

  ebooks.forEach(e => {
    const price = parseFloat(e.price) || 0;
    const card = document.createElement('div');
    card.className = 'bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between hover:shadow-xl transition-shadow';
    card.innerHTML = `
      <div>
        <h4 class="font-semibold text-lg mb-2">${e.name}</h4>
        <p class="text-gray-600 text-sm mb-4">${e.description || ''}</p>
        <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-2">
       ${e.category_name || 'No category'}
        </span>
      </div>
      <div>
        <span class="font-bold text-indigo-600 text-lg">${price > 0 ? `$${price.toFixed(2)}` : 'Gratis'}</span>
      </div>
      `;
      container.appendChild(card);
      });
    }

  /**
  * Render pagination controls for the dashboard view.
  */
  renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    let html = '';
    if (this.currentPage > 1) html += `<li><button onclick="dashboard.goToPage(${this.currentPage - 1})">&lt;</button></li>`;

    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      html += `<li><button class="${i === this.currentPage ? 'font-bold' : ''}" onclick="dashboard.goToPage(${i})">${i}</button></li>`;
    }

    if (this.currentPage < this.totalPages) html += `<li><button onclick="dashboard.goToPage(${this.currentPage + 1})">&gt;</button></li>`;

    paginationContainer.innerHTML = html;
  }

  /**
  * Go to a specific page in the dashboard and reload ebooks.
  * @param {number} page - Page number to go to
  */
  async goToPage(page) {
    this.currentPage = page;
    await this.loadEbooks();
  }

  /**
  * Attach listeners for search, category filter, and cart button.
  */
  attachStaticListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', async e => {
      this.currentPage = 1;
      await this.loadEbooks(e.target.value.trim());
    });

    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) categorySelect.addEventListener('change', async () => {
      this.currentPage = 1;
      await this.loadEbooks();
    });

    // Solo botón flotante de carrito
    const cartBtn = document.getElementById('btn-cart');
    if (cartBtn) cartBtn.addEventListener('click', () => cartManager.renderCart());
  }

  /**
  * Show or hide the loading spinner during async operations.
  * @param {boolean} show - Whether to show the spinner
  */
  showSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (!spinner) return;
    spinner.classList.toggle('hidden', !show);
  }

  /**
  * Show an error message to the user in the dashboard view.
  * @param {string} msg - Error message to display
  */
  showError(msg) {
    const errEl = document.getElementById('error-message');
    const errText = document.getElementById('error-text');
    if (errEl && errText) {
      errText.textContent = msg;
      errEl.classList.remove('hidden');
      setTimeout(() => errEl.classList.add('hidden'), 3000);
    }
  }
}

// Global initialization
window.dashboard = new EbooksDashboard();
