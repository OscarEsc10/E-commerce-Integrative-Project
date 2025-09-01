// Catalog JavaScript Logic
class EbookCatalog {
    constructor() {
        this.searchTerm = '';
        this.selectedCategory = '';
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.totalPages = 1;
        this.totalItems = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.setupNavigation();
        this.loadCategories();
        this.setupCartFunctionality();
        // Load ebooks with pagination from the start
        this.loadEbooks();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = null; // No search button in new design
        this.clearBtn = document.getElementById('clearBtn');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.ebooksGrid = document.getElementById('ebooksGrid');
        this.resultsCount = document.getElementById('resultsCount');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.paginationNav = document.getElementById('paginationNav');
        this.paginationInfo = document.getElementById('paginationInfo');
        this.cartBtn = document.getElementById('cart-btn');
        this.cartBadge = document.getElementById('cart-count-badge');
    }

    bindEvents() {
        // Search button removed in new design, use input events instead
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearSearch());
        }
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.performSearch(), 300);
            });
            
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(this.searchTimeout);
                    this.performSearch();
                }
            });
        }
        
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this.performSearch());
        }
    }

    setupNavigation() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('userData');
                window.location.href = '/login';
            });
        }
    }

    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.ebooksGrid.style.display = 'none';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
        this.ebooksGrid.style.display = 'block';
    }

    async loadEbooks() {
        this.showLoading();
        
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.searchTerm,
                category_id: this.selectedCategory
            });
            
            
            const response = await fetch(`/api/ebooks/paginated?${params}`);
            const data = await response.json();
            
            
            if (data.success) {
                const ebooks = data.data || [];
                this.totalItems = data.pagination ? data.pagination.total : ebooks.length;
                this.totalPages = data.pagination ? data.pagination.totalPages : 1;
                
                this.displayEbooks(ebooks);
                this.updateResultsCount(this.totalItems);
                this.renderPagination();
            } else {
                console.error('Catalog: API error:', data.message);
                this.showError('Error al cargar los ebooks: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Catalog: Network error:', error);
            this.showError('Error de conexión: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    createEbookCard(ebook, isLoggedIn = false) {
        const price = parseFloat(ebook.price || 0);
        return `
            <div class="ebook-item">
                <div class="card h-100 shadow-sm ebook-card">
                    <div class="card-body">
                        <h5 class="card-title">${ebook.name || ebook.title || 'Sin título'}</h5>
                        <p class="card-text text-muted small">${ebook.description || 'Sin descripción'}</p>
                        <div class="mb-2">
                            <span class="category-badge">${ebook.category_name || ebook.category || 'Sin categoría'}</span>
                        </div>
                        <div class="price-display mb-3">
                            <span class="price-badge">${price > 0 ? `$${price.toFixed(2)}` : 'Gratis'}</span>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 pt-0">
                        <button class="btn btn-primary w-100" onclick="handlePurchase(${ebook.ebook_id}, '${ebook.name || ebook.title}', ${price})">
                            <i class="fas fa-shopping-cart me-2"></i>Comprar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    displayEbooks(ebooks) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const isLoggedIn = userData && (userData.user_id || userData.id);
        
        if (ebooks.length === 0) {
            this.ebooksGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No se encontraron ebooks</h4>
                    <p class="text-muted">Intenta con otros términos de búsqueda</p>
                </div>
            `;
            return;
        }

        this.ebooksGrid.innerHTML = ebooks.map(ebook => this.createEbookCard(ebook, isLoggedIn)).join('');
    }

    updateResultsCount(count) {
        let text = '';
        if (this.searchTerm || this.selectedCategory) {
            const filters = [];
            if (this.searchTerm) filters.push(`"${this.searchTerm}"`);
            if (this.selectedCategory) {
                const categoryName = this.categoryFilter.options[this.categoryFilter.selectedIndex].text;
                filters.push(`categoría: ${categoryName}`);
            }
            text = `Se encontraron ${count} resultado(s) para ${filters.join(' y ')}`;
        } else {
            text = `Catálogo de Ebooks - ${count} libro(s) disponible(s)`;
        }
        this.resultsCount.textContent = text;
    }

    performSearch() {
        this.searchTerm = this.searchInput.value.trim();
        this.selectedCategory = this.categoryFilter ? this.categoryFilter.value : '';
        this.currentPage = 1;
        this.loadEbooks();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchTerm = '';
        this.selectedCategory = '';
        if (this.categoryFilter) this.categoryFilter.value = '';
        this.currentPage = 1;
        this.loadEbooks();
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if (data.success && this.categoryFilter) {
                const categories = data.data || data.categories || [];
                
                // Clear existing options except the first one
                this.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
                
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id || category.id;
                    option.textContent = category.name || category.category_name;
                    this.categoryFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    setupCartFunctionality() {
        if (this.cartBtn) {
            this.cartBtn.addEventListener('click', () => {
                window.location.href = '/dashboard';
            });
        }
        
        // Load cart count on page load
        this.updateCartBadge();
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', () => {
            this.updateCartBadge();
        });
    }

    async updateCartBadge() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const userId = userData.user_id || userData.id;
            
            if (!userId || !this.cartBadge) return;
            
            const response = await fetch(`/api/cart/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                const items = data.data || data.items || [];
                const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                
                if (totalItems > 0) {
                    this.cartBadge.textContent = totalItems;
                    this.cartBadge.style.display = 'inline-block';
                } else {
                    this.cartBadge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error updating cart badge:', error);
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.loadEbooks();
        }
    }

    renderPagination() {
        if (!this.paginationNav) return;
        
        if (this.totalPages <= 1) {
            this.paginationNav.innerHTML = `
                <li class="page-item disabled">
                    <span class="page-link"><i class="fas fa-chevron-left"></i> Anterior</span>
                </li>
                <li class="page-item active">
                    <span class="page-link">1</span>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Siguiente <i class="fas fa-chevron-right"></i></span>
                </li>
            `;
            
            if (this.paginationInfo) {
                this.paginationInfo.textContent = this.totalItems > 0 ? 
                    `Mostrando ${this.totalItems} resultado(s) (Página 1 de 1)` : '';
            }
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i> Anterior
                </a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">
                    Siguiente <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        
        this.paginationNav.innerHTML = paginationHTML;
        
        // Update pagination info
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        this.paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${this.totalItems} resultados (Página ${this.currentPage} de ${this.totalPages})`;
        
        // Add click event listeners to pagination links
        this.paginationNav.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.matches('a.page-link') && e.target.dataset.page) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
    }

    showError(message) {
        this.ebooksGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="text-warning">${message}</h4>
            </div>
        `;
    }
}

// Cart functionality
async function addToCart(ebookId) {
    try {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userId = userData.user_id || userData.id;
        
        if (!userId) {
            showToast('Debes iniciar sesión para agregar productos al carrito', 'warning');
            return;
        }
        
        const payload = {
            user_id: userId,
            ebook_id: parseInt(ebookId),
            quantity: 1
        };
        
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Ebook agregado al carrito exitosamente', 'success');
            // Dispatch cart update event for other components
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            // Update cart badge immediately
            if (window.catalogInstance) {
                window.catalogInstance.updateCartBadge();
            }
        } else {
            showToast(data.message || 'Error al agregar al carrito', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error de conexión al agregar al carrito', 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: ${type === 'warning' ? '#000' : '#fff'};
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Handle purchase button click
function handlePurchase(ebookId, ebookName, price) {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const isLoggedIn = userData && (userData.user_id || userData.id);
    
    if (!isLoggedIn) {
        // Store return URL and redirect to login
        localStorage.setItem('returnUrl', '/catalog');
        showToast('Debes iniciar sesión para realizar compras', 'info');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
        return;
    }
    
    // User is logged in, redirect to checkout with item data
    const purchaseData = {
        items: [{
            ebookId: ebookId,
            ebookName: ebookName,
            price: price,
            quantity: 1
        }]
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(purchaseData));
    window.location.href = '/checkout';
}

// Add item to cart
function addToCart(ebookId, ebookName, price) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists
    const existingItem = cart.find(item => item.ebookId === ebookId);
    if (existingItem) {
        showToast('Este ebook ya está en tu carrito', 'warning');
        return;
    }
    
    // Add new item
    cart.push({
        ebookId: ebookId,
        ebookName: ebookName,
        price: price,
        quantity: 1
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Ebook agregado al carrito', 'success');
}

// Update cart count display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.length;
    const cartBadge = document.getElementById('cart-count');
    const cartToggle = document.getElementById('cart-toggle');
    
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'inline' : 'none';
    }
    
    if (cartToggle) {
        cartToggle.style.display = 'flex';
    }
}

// Clear cart
function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
    showToast('Carrito vaciado', 'info');
    
    // Hide cart dropdown if open
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) {
        cartDropdown.classList.add('hidden');
    }
}

// Toggle cart dropdown
function toggleCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) {
        cartDropdown.classList.toggle('hidden');
        if (!cartDropdown.classList.contains('hidden')) {
            renderCartItems();
        }
    }
}

// Render cart items in dropdown
function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="text-center text-gray-500 py-4">Carrito vacío</div>';
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item flex justify-between items-center py-2 border-b">
                <div>
                    <h6 class="font-medium text-sm">${item.ebookName}</h6>
                    <span class="text-xs text-gray-500">$${item.price.toFixed(2)}</span>
                </div>
                <button onclick="removeFromCart(${item.ebookId})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
    
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Remove item from cart
function removeFromCart(ebookId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.ebookId !== ebookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    showToast('Ebook removido del carrito', 'info');
}

// Proceed to checkout
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        showToast('Tu carrito está vacío', 'warning');
        return;
    }
    
    localStorage.setItem('checkoutData', JSON.stringify(cart));
    window.location.href = '/checkout';
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catalog = new EbookCatalog();
    
    // Initialize cart for logged users
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const isLoggedIn = userData && (userData.user_id || userData.id);
    
    if (isLoggedIn) {
        updateCartCount();
    }
});
