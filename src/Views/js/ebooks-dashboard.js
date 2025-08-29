import { authManager } from './auth.js';
import { apiClient } from './api.js';

class EbooksDashboard {
  constructor() {
    this.user = null;
    this.ebooks = [];
    this.categories = [];
    this.cart = [];
    this.currentPage = 1;
    this.itemsPerPage = 8;
    this.totalPages = 1;
    this.totalItems = 0;
    this.searchTerm = '';
    this.selectedCategory = '';
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
      this.initModernPagination();
    } catch (err) {
      console.error('EbooksDashboard init error:', err);
      this.showError('Error al inicializar dashboard.');
    }
  }

  initModernPagination() {
    if (window.ModernPagination) {
      this.modernPagination = new window.ModernPagination();
      this.modernPagination.initializeDashboard();
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
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = '/dashboard');

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
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage
      });

      if (this.searchTerm) {
        params.append('search', this.searchTerm);
      }

      if (this.selectedCategory) {
        params.append('category', this.selectedCategory);
      }

      // Add page change animation
      const container = document.getElementById('ebooksContainer');
      if (this.modernPagination && container) {
        this.modernPagination.animatePageChange(container, async () => {
          await this.fetchAndRenderEbooks(params);
        });
      } else {
        await this.fetchAndRenderEbooks(params);
      }
    } catch (err) {
      console.error('Error cargando ebooks:', err);
      this.showError('No se pudieron cargar los ebooks.');
    }
  }

  async fetchAndRenderEbooks(params) {
    const response = await fetch(`/api/ebooks/paginated?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authManager.getToken()}`
      }
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error loading ebooks');
    }

    const { data: ebooks, pagination } = result;
    this.ebooks = ebooks;
    this.totalPages = pagination.totalPages;
    this.totalItems = pagination.totalItems;
    
    this.renderEbooks(ebooks);
    this.renderPagination(pagination);
    this.updateResultsInfo(pagination);
  }

  renderEbooks(ebooks) {
    const container = document.getElementById('ebooksContainer');
    if (!container) return;
    
    // Add fade out effect
    container.classList.add('loading');
    
    setTimeout(() => {
      container.innerHTML = '';

      ebooks.forEach((ebook) => {
        const price = parseFloat(ebook.price) || 0;
        const card = document.createElement('div');
        card.className = 'bg-white shadow-lg rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1';
        card.innerHTML = `
          <h4 class="font-semibold text-lg mb-2">${ebook.name}</h4>
          <p class="text-gray-600 text-sm mb-4">${ebook.description || ''}</p>
          <span class="font-bold text-indigo-600 mb-2">${price > 0 ? `$${price.toFixed(2)}` : '—'}</span>
          <button class="add-to-cart-btn bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors" data-id="${ebook.ebook_id}">Agregar al carrito</button>
        `;
        
        // Add click animation to card
        this.addClickAnimation(card);
        
        container.appendChild(card);
      });
      
      // Add event listeners
      container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        this.addClickAnimation(btn);
        btn.addEventListener('click', e => {
        const ebookId = parseInt(e.currentTarget.dataset.id);
          if (!this.user?.id) {
          return this.showError('Usuario no identificado');
        }
          this.addToCart(ebookId);
        });
      });
      
      // Remove loading state and show content
      container.classList.remove('loading');
      container.classList.add('loaded');
    }, 400);

  }

  addClickAnimation(element) {
    element.addEventListener('mousedown', () => {
      element.style.transition = 'all 0.1s ease';
      element.style.opacity = '0.7';
      element.style.transform = 'scale(0.98)';
    });

    element.addEventListener('mouseup', () => {
      element.style.transition = 'all 0.2s ease';
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    });

    element.addEventListener('mouseleave', () => {
      element.style.transition = 'all 0.2s ease';
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
    });
  }

  attachStaticListeners() {
    const filterInput = document.getElementById('filter-input');
    const filterSelect = document.getElementById('filter-category');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    if (filterInput) {
      filterInput.addEventListener('input', () => {
        this.searchTerm = filterInput.value;
        this.currentPage = 1;
        this.loadEbooks();
      });
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        this.selectedCategory = filterSelect.value;
        this.currentPage = 1;
        this.loadEbooks();
      });
    }

    if (prevPageBtn) {
      this.addClickAnimation(prevPageBtn);
      prevPageBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadEbooks();
        }
      });
    }

    if (nextPageBtn) {
      this.addClickAnimation(nextPageBtn);
      nextPageBtn.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.loadEbooks();
        }
      });
    }
  }

  renderPagination(pagination) {
    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');

    if (prevBtn) {
      prevBtn.disabled = !hasPrevPage;
      prevBtn.classList.toggle('opacity-50', !hasPrevPage);
      prevBtn.classList.toggle('cursor-not-allowed', !hasPrevPage);
    }

    if (nextBtn) {
      nextBtn.disabled = !hasNextPage;
      nextBtn.classList.toggle('opacity-50', !hasNextPage);
      nextBtn.classList.toggle('cursor-not-allowed', !hasNextPage);
    }

    if (pageNumbers) {
      pageNumbers.innerHTML = '';
      
      if (totalPages <= 1) return;

      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // Add dots if needed (start)
      if (startPage > 1) {
        this.createPageButton(1, pageNumbers, 1 === currentPage);
        if (startPage > 2) {
          const dots = document.createElement('span');
          dots.className = 'pagination-dots';
          dots.textContent = '...';
          pageNumbers.appendChild(dots);
        }
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        this.createPageButton(i, pageNumbers, i === currentPage);
      }

      // Add dots if needed (end)
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          const dots = document.createElement('span');
          dots.className = 'pagination-dots';
          dots.textContent = '...';
          pageNumbers.appendChild(dots);
        }
        this.createPageButton(totalPages, pageNumbers, totalPages === currentPage);
      }

      // Style page numbers with modern effects
      if (this.modernPagination) {
        this.modernPagination.stylePageNumbers();
      }
    }
  }

  createPageButton(pageNum, container, isActive = false) {
    const btn = document.createElement('button');
    btn.textContent = pageNum;
    btn.className = `page-number ${isActive ? 'active' : ''}`;
    
    if (!isActive) {
      btn.addEventListener('click', () => {
        const direction = pageNum > this.currentPage ? 'next' : 'prev';
        
        // Add page transition effect
        if (this.modernPagination) {
          const ebooksContainer = document.getElementById('ebooksContainer');
          this.modernPagination.addPageTransition(ebooksContainer, direction);
        }
        
        this.currentPage = pageNum;
        this.loadEbooks();
      });
    }
    
    container.appendChild(btn);
  }

  updateResultsInfo(pagination) {
    const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
      const newText = `Mostrando ${startItem}-${endItem} de ${totalItems} ebooks`;
      
      // Use modern animation for results update
      if (this.modernPagination) {
        this.modernPagination.updateResultsWithAnimation(resultsCount, newText);
      } else {
        resultsCount.textContent = newText;
      }
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
