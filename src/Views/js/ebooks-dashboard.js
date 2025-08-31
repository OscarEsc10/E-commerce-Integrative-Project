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
      this.setupFloatingCart();
      await this.loadCategories();
      await this.loadEbooks();
      await cartManager.loadCart();
      this.attachStaticListeners();
      this.toggleFeaturesByRole();
      this.setupPagination();

      // Listen for cart events
      window.addEventListener("cartUpdated", () => {
        cartManager.renderCart();
        this.updateCartDisplay();
      });
      
      window.addEventListener("cartCleared", () => {
        this.updateCartDisplay();
      });
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
    if (welcomeEl) welcomeEl.textContent = `Bienvenido, ${this.user.full_name || this.user.name || 'Usuario'}`;
    if (userAvatarEl) userAvatarEl.textContent = (this.user.full_name || this.user.name || 'U')[0].toUpperCase();

    if (logoutBtn) logoutBtn.addEventListener('click', () => authManager.logout());
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = '/dashboard');

    if (cartBtn && cartSection) {
      cartBtn.addEventListener('click', () => {
        cartManager.renderCart(); // ✅ mostrar carrito actualizado
        cartSection.classList.toggle('hidden');
      });
    }
  }

  setupFloatingCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const clearCart = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartToggle && cartModal) {
      cartToggle.addEventListener('click', () => {
        cartModal.classList.remove('hidden');
        this.updateCartDisplay();
      });
    }

    if (closeCart && cartModal) {
      closeCart.addEventListener('click', () => {
        cartModal.classList.add('hidden');
      });
    }

    if (clearCart) {
      clearCart.addEventListener('click', async () => {
        await cartManager.clearCart();
        this.updateCartDisplay();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', async () => {
        const cartItems = cartManager.getCartItems();
        if (cartItems.length === 0) {
          alert('El carrito está vacío');
          return;
        }
        // Redirect to checkout page with cart items
        const itemsParam = encodeURIComponent(JSON.stringify(cartItems));
        window.location.href = `/checkout?items=${itemsParam}`;
      });
    }

    // Close modal when clicking outside
    if (cartModal) {
      cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
          cartModal.classList.add('hidden');
        }
      });
    }
  }

  setupPagination() {
    this.currentPage = 1;
    this.itemsPerPage = 6;
    this.totalPages = 1;
  }

  updateCartDisplay() {
    const cartItems = cartManager.getCartItems();
    const cartCount = document.getElementById('cart-count-badge');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Update cart count badge
    if (cartCount) {
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Update cart items display
    if (cartItemsContainer) {
      if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<div class="text-center text-gray-500 py-8">Carrito vacío</div>';
      } else {
        cartItemsContainer.innerHTML = cartItems.map(item => `
          <div class="py-3 flex justify-between items-center">
            <div class="flex-1">
              <h4 class="font-medium text-sm">${item.ebook_name || item.name || 'Ebook'}</h4>
              <p class="text-gray-500 text-xs">Cantidad: ${item.quantity}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">$${((item.ebook_price || item.price || 0) * item.quantity).toFixed(2)}</p>
              <button class="remove-item-btn text-red-500 text-xs hover:text-red-700" data-ebook-id="${item.ebook_id}">
                Eliminar
              </button>
            </div>
          </div>
        `).join('');
        
        // Add event listeners for remove buttons
        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const ebookId = parseInt(e.target.dataset.ebookId);
            await cartManager.removeItem(ebookId);
            this.updateCartDisplay();
          });
        });
      }
    }

    // Update total
    if (cartTotal) {
      const total = cartItems.reduce((sum, item) => sum + ((item.ebook_price || item.price || 0) * item.quantity), 0);
      cartTotal.textContent = `$${total.toFixed(2)}`;
    }
  }

  renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    let paginationHTML = '';

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `
        <li><button class="px-3 py-2 bg-white border border-gray-300 rounded-l hover:bg-gray-50" onclick="dashboard.goToPage(${this.currentPage - 1})">
          <i class="fas fa-chevron-left"></i>
        </button></li>
      `;
    }

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === this.currentPage;
      paginationHTML += `
        <li><button class="px-3 py-2 border ${isActive ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white border-gray-300 hover:bg-gray-50'}" onclick="dashboard.goToPage(${i})">
          ${i}
        </button></li>
      `;
    }

    // Next button
    if (this.currentPage < this.totalPages) {
      paginationHTML += `
        <li><button class="px-3 py-2 bg-white border border-gray-300 rounded-r hover:bg-gray-50" onclick="dashboard.goToPage(${this.currentPage + 1})">
          <i class="fas fa-chevron-right"></i>
        </button></li>
      `;
    }

    paginationContainer.innerHTML = paginationHTML;
  }

  async goToPage(page) {
    this.currentPage = page;
    await this.loadEbooks();
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

  async loadEbooks(searchTerm = '') {
    try {
      console.log('Loading ebooks...');
      this.showSpinner(true);
      
      // Get search term and category filter
      const searchInput = document.getElementById('search-input');
      const categorySelect = document.getElementById('ebook-category');
      const search = searchTerm || (searchInput ? searchInput.value.trim() : '');
      const category = categorySelect ? categorySelect.value : '';
      
      // Build API URL with pagination and filters
      let apiUrl = `http://localhost:3000/api/ebooks/paginated?page=${this.currentPage}&limit=${this.itemsPerPage}`;
      if (search) apiUrl += `&search=${encodeURIComponent(search)}`;
      if (category) apiUrl += `&category=${category}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        this.ebooks = data.data || [];
        this.totalPages = data.pagination?.totalPages || 1;
        this.totalItems = data.pagination?.totalItems || this.ebooks.length;
        console.log('Ebooks loaded:', this.ebooks.length, 'Total pages:', this.totalPages);
        this.renderEbooks(this.ebooks);
        this.renderPagination();
        this.updateCartDisplay();
        this.updateEbooksCount();
      } else {
        throw new Error(data.message || 'Failed to load ebooks');
      }
    } catch (err) {
      console.error('Error cargando ebooks:', err);
      this.showError('No se pudieron cargar los ebooks: ' + err.message);
    } finally {
      this.showSpinner(false);
    }
  }

  renderEbooks(ebooks) {
    console.log('Rendering ebooks:', ebooks.length);
    const container = document.getElementById('ebooksContainer');
    if (!container) {
      console.error('ebooksContainer not found');
      return;
    }
    container.innerHTML = '';

    if (ebooks.length === 0) {
      container.innerHTML = '<div class="text-center text-gray-500 py-8">No hay ebooks disponibles</div>';
      return;
    }

    ebooks.forEach(ebook => {
      const price = parseFloat(ebook.price) || 0;
      const card = document.createElement('div');
      card.className = 'bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between hover:shadow-xl transition-shadow';
      card.innerHTML = `
        <div>
          <h4 class="font-semibold text-lg mb-2">${ebook.name}</h4>
          <p class="text-gray-600 text-sm mb-4">${ebook.description || ''}</p>
          <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-2">
            ${ebook.category_name || 'Sin categoría'}
          </span>
        </div>
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="font-bold text-indigo-600 text-lg">${price > 0 ? `$${price.toFixed(2)}` : 'Gratis'}</span>
          </div>
          <button class="add-to-cart-btn w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors" data-id="${ebook.ebook_id}">
            <i class="fas fa-cart-plus mr-2"></i>Agregar al carrito
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    // Eventos de agregar al carrito
    container.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const ebookId = parseInt(e.currentTarget.dataset.id);
        const ebook = this.ebooks.find(eb => eb.ebook_id === ebookId);
        
        // Add to cart with ebook details for fallback
        await cartManager.addItem(ebookId, 1, ebook);
        this.updateCartDisplay();
        
        // Visual feedback
        btn.innerHTML = '<i class="fas fa-check mr-2"></i>Agregado';
        btn.disabled = true;
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-cart-plus mr-2"></i>Agregar al carrito';
          btn.disabled = false;
        }, 2000);
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
    if (countEl) {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems || this.ebooks.length);
      countEl.textContent = `Mostrando ${start}-${end} de ${this.totalItems || this.ebooks.length} ebooks`;
    }
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
      searchInput.addEventListener('input', async (e) => {
        const term = e.target.value.trim();
        this.currentPage = 1; // Reset to first page when searching
        await this.loadEbooks(term);
      });
    }

    const categorySelect = document.getElementById('ebook-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', async (e) => {
        this.currentPage = 1; // Reset to first page when filtering
        await this.loadEbooks();
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

  async processCheckout(cartItems) {
    try {
      // Calculate total
      const total = cartItems.reduce((sum, item) => 
        sum + ((item.ebook_price || item.price || 0) * item.quantity), 0);

      // Show confirmation dialog
      const confirmed = confirm(`¿Confirmar compra por $${total.toFixed(2)}?`);
      if (!confirmed) return;

      // Show loading
      this.showSpinner(true);

      // Create order
      const orderData = {
        items: cartItems.map(item => ({
          ebook_id: item.ebook_id,
          quantity: item.quantity,
          price: item.ebook_price || item.price || 0
        })),
        total: total,
        payment_method: 'credit_card' // Default payment method
      };

      const response = await apiClient.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (response.success) {
        // Clear cart after successful order
        await cartManager.clearCart();
        this.updateCartDisplay();
        
        // Close cart modal
        const cartModal = document.getElementById('cartModal');
        if (cartModal) cartModal.classList.add('hidden');
        
        // Show success message
        this.showSuccess(`¡Compra realizada exitosamente! Orden #${response.order?.order_id || 'N/A'}`);
        
        // Optional: Redirect to orders page
        setTimeout(() => {
          if (confirm('¿Deseas ver tus órdenes?')) {
            window.location.href = '/orders';
          }
        }, 2000);
      } else {
        throw new Error(response.message || 'Error al procesar la orden');
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      this.showError('Error al procesar el pago: ' + err.message);
    } finally {
      this.showSpinner(false);
    }
  }
}

// Inicialización global
window.dashboard = new EbooksDashboard();
