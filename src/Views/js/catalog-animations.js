// src/Views/js/catalog-animations.js
// Utility for adding click animations to catalog UI elements
// Applies scale and opacity transitions on mouse events

// Catalog Click Animations
class CatalogAnimations {
  /**
   * Add click animation to a DOM element
   * @param {HTMLElement} element - Element to animate
   */
  static addClickAnimation(element) {
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

  /**
   * Initialize click animations for catalog UI elements
   * Applies to search buttons, ebook cards, and all buttons
   */
  static initializeAnimations() {
    // Add animations to search buttons
    const searchBtn = document.querySelector('.search-btn');
    const clearBtn = document.querySelector('.clear-btn');
    
    if (searchBtn) this.addClickAnimation(searchBtn);
    if (clearBtn) this.addClickAnimation(clearBtn);

    // Add animations to all ebook cards
    document.querySelectorAll('.ebook-card').forEach(card => {
      this.addClickAnimation(card);
    });

    // Add animations to all buttons
    document.querySelectorAll('.btn').forEach(btn => {
      this.addClickAnimation(btn);
    });
  }
}

// Export for use in catalog
window.CatalogAnimations = CatalogAnimations;
