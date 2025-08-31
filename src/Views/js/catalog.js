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
        this.searchBtn = document.getElementById('searchBtn');
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
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.clearBtn.addEventListener('click', () => this.clearSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this.performSearch());
        }
    }

    setupNavigation() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.clear();
                sessionStorage.clear();
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
            console.log('Catalog: Loading ebooks...');
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.itemsPerPage
            });
            
            if (this.searchTerm) {
                params.append('search', this.searchTerm);
            }
            
            if (this.selectedCategory) {
                params.append('category_id', this.selectedCategory);
            }
            
            const url = `/api/ebooks/paginated?${params.toString()}`;
            console.log('Catalog: Fetching from URL:', url);
            
            const response = await fetch(url);
            console.log('Catalog: Response status:', response.status);
            
            const data = await response.json();
            console.log('Catalog: Response data:', data);
            
            if (data.success) {
                const ebooks = data.data || data.ebooks || [];
                const pagination = data.pagination || {};
                
                this.totalPages = pagination.totalPages || Math.ceil(ebooks.length / this.itemsPerPage) || 1;
                this.totalItems = pagination.total || ebooks.length;
                
                console.log('Catalog: Ebooks found:', ebooks.length, 'Total pages:', this.totalPages);
                this.displayEbooks(ebooks);
                this.updateResultsCount(this.totalItems);
                // Always render pagination, even if only one page
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

    displayEbooks(ebooks) {
        console.log('Catalog: Displaying ebooks:', ebooks.length);
        
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

        this.ebooksGrid.innerHTML = ebooks.map(ebook => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm ebook-card">
                    <div class="card-body">
                        <h5 class="card-title">${ebook.name || ebook.title || 'Sin título'}</h5>
                        <p class="card-text text-muted small">${ebook.description || 'Sin descripción'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="category-badge">${ebook.category_name || ebook.category || 'Sin categoría'}</span>
                            <span class="price-badge">$${parseFloat(ebook.price || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-primary btn-sm w-100" onclick="addToCart(${ebook.ebook_id || ebook.id})">
                            <i class="fas fa-cart-plus me-1"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
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
        this.currentPage = 1; // Reset to first page on new search
        this.loadEbooks();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchTerm = '';
        this.selectedCategory = '';
        if (this.categoryFilter) this.categoryFilter.value = '';
        this.currentPage = 1; // Reset to first page
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
            // No scrolling to prevent interface movement
        }
    }

    renderPagination() {
        if (!this.paginationNav) return;
        
        // Always show pagination, even for single page
        if (this.totalPages <= 1) {
            // Still show pagination structure for single page
            const singlePageHTML = `
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
            this.paginationNav.innerHTML = `<ul class="pagination justify-content-center">${singlePageHTML}</ul>`;
            
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
        console.log('Adding ebook to cart:', ebookId);
        
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catalogInstance = new EbookCatalog();
});
