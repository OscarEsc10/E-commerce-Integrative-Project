// Modern Pagination JavaScript Effects
class ModernPagination {
  constructor() {
    this.isAnimating = false;
  }

  // Simple page change animation
  animatePageChange(container, callback) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Simple fade out
    container.style.transition = 'opacity 0.2s ease';
    container.style.opacity = '0.5';
    
    setTimeout(() => {
      // Execute the callback (load new data)
      if (callback) callback();
      
      setTimeout(() => {
        // Simple fade in
        container.style.opacity = '1';
        this.isAnimating = false;
      }, 100);
    }, 200);
  }

  // Simple click effect
  addClickEffect(button) {
    button.addEventListener('click', () => {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    });
  }

  // Initialize modern pagination for dashboard
  initializeDashboard() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;

    // Add modern classes
    paginationContainer.classList.add('pagination-container');
    
    // Style pagination buttons
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
      prevBtn.classList.add('pagination-btn');
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      this.addButtonEffects(prevBtn);
    }
    
    if (nextBtn) {
      nextBtn.classList.add('pagination-btn');
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      this.addButtonEffects(nextBtn);
    }

    // Style results info
    const resultsInfo = document.getElementById('resultsInfo');
    if (resultsInfo) {
      resultsInfo.classList.add('results-info-modern');
    }
  }

  // Add simple button effects
  addButtonEffects(button) {
    this.addClickEffect(button);
  }

  // Style page number buttons
  stylePageNumbers() {
    const pageNumbers = document.getElementById('pageNumbers');
    if (!pageNumbers) return;

    pageNumbers.querySelectorAll('button').forEach(btn => {
      btn.classList.add('page-number');
      this.addClickEffect(btn);
    });
  }

  // Simple page transition
  addPageTransition(container, direction = 'next') {
    // Simple fade effect only
    container.style.opacity = '0.7';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 200);
  }

  // Simple results update
  updateResultsWithAnimation(element, newText) {
    element.style.transition = 'opacity 0.2s ease';
    element.style.opacity = '0.7';
    
    setTimeout(() => {
      element.textContent = newText;
      element.style.opacity = '1';
    }, 200);
  }
}

// Export for use
window.ModernPagination = ModernPagination;
