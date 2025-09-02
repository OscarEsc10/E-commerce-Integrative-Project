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
                        <button class="btn btn-success w-100" onclick="addToCart(${ebook.ebook_id}, '${ebook.name || ebook.title}', ${price})">
                            <i class="fas fa-cart-plus me-2"></i>Agregar al Carrito
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
        // Cart button functionality is handled by onclick in HTML
        
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
    // Direct purchase without login requirement
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
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.ebookId === ebookId);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
        showToast('Cantidad actualizada en el carrito', 'success');
    } else {
        cart.push({
            ebookId,
            ebookName,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Ebook agregado al carrito', 'success');
}

// Update cart count display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartBadge = document.getElementById('cart-count');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartToggle = document.getElementById('cart-toggle');
    
    // Update floating cart button
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    
    // Update navbar cart button badge
    if (cartCountBadge) {
        cartCountBadge.textContent = cartCount;
        cartCountBadge.style.display = cartCount > 0 ? 'inline' : 'none';
    }
    
    if (cartToggle) {
        cartToggle.style.display = cartCount > 0 ? 'flex' : 'none';
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
        const isHidden = cartDropdown.classList.contains('hidden');
        
        if (isHidden) {
            cartDropdown.classList.remove('hidden');
            renderCartItems();
            // Close dropdown when clicking outside
            setTimeout(() => {
                document.addEventListener('click', closeCartOnOutsideClick);
            }, 100);
        } else {
            cartDropdown.classList.add('hidden');
            document.removeEventListener('click', closeCartOnOutsideClick);
        }
    }
}

// Close cart when clicking outside
function closeCartOnOutsideClick(event) {
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartToggle = document.getElementById('cart-toggle');
    
    if (cartDropdown && cartToggle && 
        !cartDropdown.contains(event.target) && 
        !cartToggle.contains(event.target)) {
        cartDropdown.classList.add('hidden');
        document.removeEventListener('click', closeCartOnOutsideClick);
    }
}

// Render cart items in dropdown
function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500 text-center">No has seleccionado ningún producto</p>
                <p class="text-gray-400 text-sm text-center mt-2">Explora nuestro catálogo y agrega ebooks a tu carrito</p>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.ebookName}</div>
                    <div class="cart-item-details">
                        <span class="cart-item-quantity">Cantidad: ${quantity}</span>
                        <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.ebookId})" class="cart-item-remove" title="Eliminar">
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
    
    const checkoutData = {
        items: cart.map(item => ({
            ebookId: item.ebook_id || item.ebookId,
            ebookName: item.ebook_name || item.name || item.ebookName,
            price: item.ebook_price || item.price,
            quantity: item.quantity || 1
        }))
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    window.location.href = '/checkout';
}

// Open cart modal
function openCartModal() {
    renderCartModal();
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
}

// Render cart items in modal
function renderCartModal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const modalCartItems = document.getElementById('modal-cart-items');
    const modalEmptyCart = document.getElementById('modal-empty-cart');
    const modalCartTotal = document.getElementById('modal-cart-total');
    const modalCartCount = document.getElementById('modal-cart-count');
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    modalCartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        modalCartItems.style.display = 'none';
        modalEmptyCart.style.display = 'block';
        modalCartTotal.textContent = '$0.00';
        return;
    }
    
    modalCartItems.style.display = 'block';
    modalEmptyCart.style.display = 'none';
    
    let total = 0;
    modalCartItems.innerHTML = cart.map(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        total += itemTotal;
        
        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h6 class="card-title mb-1">${item.ebookName}</h6>
                            <small class="text-muted">Precio unitario: $${item.price.toFixed(2)}</small>
                        </div>
                        <div class="col-md-3 text-center">
                            <div class="d-flex align-items-center justify-content-center gap-2">
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.ebookId}, ${quantity - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="fw-bold mx-2">${quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.ebookId}, ${quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2 text-center">
                            <div class="fw-bold text-success">$${itemTotal.toFixed(2)}</div>
                        </div>
                        <div class="col-md-1 text-end">
                            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCartModal(${item.ebookId})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    modalCartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update quantity from modal
function updateCartQuantity(ebookId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        removeFromCartModal(ebookId);
        return;
    }
    
    if (newQuantity > 10) {
        showToast('Máximo 10 unidades por producto', 'warning');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.ebookId === ebookId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartModal();
        updateCartCount();
        showToast('Cantidad actualizada', 'success');
    }
}

// Remove item from cart in modal
function removeFromCartModal(ebookId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.ebookId !== ebookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartModal();
    updateCartCount();
    showToast('Producto eliminado del carrito', 'info');
}

// Clear cart from modal
function clearCartModal() {
    if (confirm('¿Estás seguro de que quieres vaciar tu carrito?')) {
        localStorage.removeItem('cart');
        renderCartModal();
        updateCartCount();
        showToast('Carrito vaciado', 'info');
    }
}

// Proceed to checkout from modal
function proceedToCheckoutFromModal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        showToast('Tu carrito está vacío', 'warning');
        return;
    }
    
    // Prepare checkout data
    const checkoutData = cart.map(item => ({
        ebookId: item.ebookId,
        ebookName: item.ebookName,
        price: item.price,
        quantity: item.quantity || 1
    }));
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Close modal and redirect
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) cartModal.hide();
    
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
