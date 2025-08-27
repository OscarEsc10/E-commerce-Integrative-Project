/**
 * Ebooks Dashboard JavaScript - Main functionality for CRUD operations
 * Handles UI interactions, modal management, and data operations
 */

class EbooksDashboard {
    constructor() {
        this.ebooks = [];
        this.categories = [];
        this.currentEbookId = null;
        this.isEditing = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Main UI elements
        this.ebooksGrid = document.getElementById('ebooks-grid');
        this.ebooksCount = document.getElementById('ebooks-count');
        this.searchInput = document.getElementById('search-input');
        this.addEbookBtn = document.getElementById('add-ebook-btn');
        this.emptyState = document.getElementById('empty-state');
        this.loadingSpinner = document.getElementById('loading-spinner');
        
        // Modal elements
        this.ebookModal = document.getElementById('ebook-modal');
        this.deleteModal = document.getElementById('delete-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.ebookForm = document.getElementById('ebook-form');
        this.closeModalBtn = document.getElementById('close-modal');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.saveBtn = document.getElementById('save-btn');
        
        // Form inputs
        this.ebookIdInput = document.getElementById('ebook-id');
        this.ebookNameInput = document.getElementById('ebook-name');
        this.ebookDescriptionInput = document.getElementById('ebook-description');
        this.ebookPriceInput = document.getElementById('ebook-price');
        this.ebookCategorySelect = document.getElementById('ebook-category');
        
        // Delete modal elements
        this.deleteEbookName = document.getElementById('delete-ebook-name');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');
        
        // Message elements
        this.errorMessage = document.getElementById('error-message');
        this.errorText = document.getElementById('error-text');
        this.successMessage = document.getElementById('success-message');
        this.successText = document.getElementById('success-text');
    }

    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // Main actions
        this.addEbookBtn.addEventListener('click', () => this.openAddModal());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Modal actions
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.ebookForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Delete modal actions
        this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        
        // Close modals when clicking outside
        this.ebookModal.addEventListener('click', (e) => {
            if (e.target === this.ebookModal) this.closeModal();
        });
        
        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) this.closeDeleteModal();
        });
    }

    /**
     * Load initial data (ebooks and categories)
     */
    async loadInitialData() {
        try {
            this.showLoading(true);
            await Promise.all([
                this.loadEbooks(),
                this.loadCategories()
            ]);
        } catch (error) {
            this.showError('Failed to load initial data: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Load all ebooks from API
     */
    async loadEbooks() {
        try {
            this.ebooks = await apiClient.getEbooks();
            this.renderEbooks(this.ebooks);
            this.updateEbooksCount(this.ebooks.length);
        } catch (error) {
            this.showError('Failed to load ebooks: ' + error.message);
        }
    }

    /**
     * Load all categories from API
     */
    async loadCategories() {
        try {
            this.categories = await apiClient.getCategories();
            this.populateCategorySelect();
        } catch (error) {
            console.error('Failed to load categories:', error);
            // Categories are optional, so don't show error to user
        }
    }

    /**
     * Render ebooks grid
     * @param {Array} ebooks - Array of ebook objects to render
     */
    renderEbooks(ebooks) {
        if (!ebooks || ebooks.length === 0) {
            this.showEmptyState(true);
            return;
        }

        this.showEmptyState(false);
        this.ebooksGrid.innerHTML = ebooks.map(ebook => this.createEbookCard(ebook)).join('');
    }

    /**
     * Create HTML for single ebook card
     * @param {Object} ebook - Ebook object
     * @returns {string} HTML string for ebook card
     */
    createEbookCard(ebook) {
        const categoryName = this.getCategoryName(ebook.category_id);
        const formattedPrice = parseFloat(ebook.price).toFixed(2);
        const createdDate = new Date(ebook.created_at).toLocaleDateString();

        return `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                <div class="p-6">
                    <!-- Ebook Header -->
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${this.escapeHtml(ebook.name)}</h3>
                        <div class="flex space-x-1 ml-2">
                            <button onclick="dashboard.openEditModal(${ebook.ebook_id})" 
                                    class="text-blue-600 hover:text-blue-800 p-1" title="Edit ebook">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="dashboard.openDeleteModal(${ebook.ebook_id}, '${this.escapeHtml(ebook.name)}')" 
                                    class="text-red-600 hover:text-red-800 p-1" title="Delete ebook">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Category Badge -->
                    ${categoryName ? `
                        <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
                            ${categoryName}
                        </span>
                    ` : ''}

                    <!-- Description -->
                    ${ebook.description ? `
                        <p class="text-gray-600 text-sm mb-4 line-clamp-3">${this.escapeHtml(ebook.description)}</p>
                    ` : ''}

                    <!-- Price and Date -->
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-bold text-green-600">$${formattedPrice}</span>
                        <span class="text-xs text-gray-500">Created: ${createdDate}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get category name by ID
     * @param {number} categoryId - Category ID
     * @returns {string} Category name or empty string
     */
    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.category_id === categoryId);
        return category ? category.name : '';
    }

    /**
     * Populate category select dropdown
     */
    populateCategorySelect() {
        const options = this.categories.map(category => 
            `<option value="${category.category_id}">${this.escapeHtml(category.name)}</option>`
        ).join('');
        
        this.ebookCategorySelect.innerHTML = `
            <option value="">Select a category</option>
            ${options}
        `;
    }

    /**
     * Handle search input
     * @param {string} query - Search query
     */
    async handleSearch(query) {
        try {
            const filteredEbooks = await apiClient.searchEbooks(query);
            this.renderEbooks(filteredEbooks);
            this.updateEbooksCount(filteredEbooks.length);
        } catch (error) {
            this.showError('Search failed: ' + error.message);
        }
    }

    /**
     * Open modal for adding new ebook
     */
    openAddModal() {
        this.isEditing = false;
        this.currentEbookId = null;
        this.modalTitle.textContent = 'Add New Ebook';
        this.saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Ebook';
        this.resetForm();
        this.showModal();
    }

    /**
     * Open modal for editing existing ebook
     * @param {number} ebookId - ID of ebook to edit
     */
    async openEditModal(ebookId) {
        try {
            this.isEditing = true;
            this.currentEbookId = ebookId;
            this.modalTitle.textContent = 'Edit Ebook';
            this.saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Ebook';
            
            // Find ebook data
            const ebook = this.ebooks.find(e => e.ebook_id === ebookId);
            if (!ebook) {
                this.showError('Ebook not found');
                return;
            }
            
            // Populate form with ebook data
            this.populateForm(ebook);
            this.showModal();
        } catch (error) {
            this.showError('Failed to load ebook data: ' + error.message);
        }
    }

    /**
     * Open delete confirmation modal
     * @param {number} ebookId - ID of ebook to delete
     * @param {string} ebookName - Name of ebook to delete
     */
    openDeleteModal(ebookId, ebookName) {
        this.currentEbookId = ebookId;
        this.deleteEbookName.textContent = ebookName;
        this.deleteModal.classList.remove('hidden');
    }

    /**
     * Handle form submission (create or update)
     * @param {Event} e - Form submit event
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            this.saveBtn.disabled = true;
            this.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
            
            const formData = this.getFormData();
            
            if (this.isEditing) {
                await apiClient.updateEbook(this.currentEbookId, formData);
                this.showSuccess('Ebook updated successfully!');
            } else {
                await apiClient.createEbook(formData);
                this.showSuccess('Ebook created successfully!');
            }
            
            this.closeModal();
            await this.loadEbooks(); // Refresh the list
            
        } catch (error) {
            this.showError('Failed to save ebook: ' + error.message);
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Ebook';
        }
    }

    /**
     * Confirm and execute ebook deletion
     */
    async confirmDelete() {
        try {
            this.confirmDeleteBtn.disabled = true;
            this.confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Deleting...';
            
            await apiClient.deleteEbook(this.currentEbookId);
            this.showSuccess('Ebook deleted successfully!');
            this.closeDeleteModal();
            await this.loadEbooks(); // Refresh the list
            
        } catch (error) {
            this.showError('Failed to delete ebook: ' + error.message);
        } finally {
            this.confirmDeleteBtn.disabled = false;
            this.confirmDeleteBtn.innerHTML = '<i class="fas fa-trash mr-2"></i>Delete';
        }
    }

    /**
     * Get form data as object
     * @returns {Object} Form data object
     */
    getFormData() {
        return {
            name: this.ebookNameInput.value.trim(),
            description: this.ebookDescriptionInput.value.trim(),
            price: parseFloat(this.ebookPriceInput.value),
            category_id: this.ebookCategorySelect.value ? parseInt(this.ebookCategorySelect.value) : null
        };
    }

    /**
     * Populate form with ebook data
     * @param {Object} ebook - Ebook data object
     */
    populateForm(ebook) {
        this.ebookIdInput.value = ebook.ebook_id;
        this.ebookNameInput.value = ebook.name;
        this.ebookDescriptionInput.value = ebook.description || '';
        this.ebookPriceInput.value = ebook.price;
        this.ebookCategorySelect.value = ebook.category_id || '';
    }

    /**
     * Reset form to empty state
     */
    resetForm() {
        this.ebookForm.reset();
        this.ebookIdInput.value = '';
    }

    /**
     * Show/hide modal
     */
    showModal() {
        this.ebookModal.classList.remove('hidden');
        this.ebookNameInput.focus();
    }

    /**
     * Close ebook modal
     */
    closeModal() {
        this.ebookModal.classList.add('hidden');
        this.resetForm();
    }

    /**
     * Close delete modal
     */
    closeDeleteModal() {
        this.deleteModal.classList.add('hidden');
        this.currentEbookId = null;
    }

    /**
     * Show/hide loading spinner
     * @param {boolean} show - Whether to show loading spinner
     */
    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.remove('hidden');
            this.ebooksGrid.classList.add('hidden');
        } else {
            this.loadingSpinner.classList.add('hidden');
            this.ebooksGrid.classList.remove('hidden');
        }
    }

    /**
     * Show/hide empty state
     * @param {boolean} show - Whether to show empty state
     */
    showEmptyState(show) {
        if (show) {
            this.emptyState.classList.remove('hidden');
            this.ebooksGrid.classList.add('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            this.ebooksGrid.classList.remove('hidden');
        }
    }

    /**
     * Update ebooks count display
     * @param {number} count - Number of ebooks
     */
    updateEbooksCount(count) {
        this.ebooksCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.errorMessage.classList.add('hidden');
        }, 5000);
    }

    /**
     * Show success message
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        this.successText.textContent = message;
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.successMessage.classList.add('hidden');
        }, 3000);
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new EbooksDashboard();
});

// Make dashboard available globally for onclick handlers
window.dashboard = dashboard;
