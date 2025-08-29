// Catalog JavaScript Logic
class EbookCatalog {
    constructor() {
        this.searchTerm = '';
        
        this.initializeElements();
        this.bindEvents();
        this.loadEbooks();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.ebooksGrid = document.getElementById('ebooksGrid');
        this.resultsCount = document.getElementById('resultsCount');
        this.loadingSpinner = document.querySelector('.loading-spinner');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.clearBtn.addEventListener('click', () => this.clearSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
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
            const url = this.searchTerm 
                ? `/api/ebooks/search?q=${encodeURIComponent(this.searchTerm)}`
                : '/api/ebooks';
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.displayEbooks(data.ebooks);
                this.updateResultsCount(data.ebooks.length);
            } else {
                this.showError('Error al cargar los ebooks');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error de conexión');
        } finally {
            this.hideLoading();
        }
    }

    displayEbooks(ebooks) {
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
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${ebook.title}</h5>
                        <p class="card-text text-muted small">${ebook.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${ebook.category}</span>
                            <strong class="text-success">$${ebook.price}</strong>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-primary btn-sm w-100" onclick="addToCart(${ebook.ebook_id})">
                            <i class="fas fa-cart-plus me-1"></i>Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateResultsCount(count) {
        const text = this.searchTerm 
            ? `Se encontraron ${count} resultado(s) para "${this.searchTerm}"`
            : `Mostrando ${count} ebook(s)`;
        this.resultsCount.textContent = text;
    }

    performSearch() {
        this.searchTerm = this.searchInput.value.trim();
        this.loadEbooks();
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchTerm = '';
        this.loadEbooks();
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
function addToCart(ebookId) {
    // Add to cart logic here
    console.log('Adding ebook to cart:', ebookId);
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = 'Ebook agregado al carrito';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EbookCatalog();
});
