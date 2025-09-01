/**
 * Footer View Logic
 * Handles dynamic year, last updated time, and statistics for ebooks, categories, and users.
 */
export function initializeFooter() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
  updateLastUpdated();
  loadFooterStats();

  setInterval(() => {
    updateLastUpdated();
    loadFooterStats();
  }, 5 * 60 * 1000);
}

/**
 * Update the last updated time in the footer.
 */
function updateLastUpdated() {
  const now = new Date();
  const lastUpdated = now.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('last-updated').textContent = `Last updated: ${lastUpdated}`;
}

/**
 * Load and display statistics for ebooks, categories, and users in the footer.
 */
export async function loadFooterStats() {
  try {
    const [ebooks, categories] = await Promise.all([
      window.apiClient.getEbooks(),
      window.apiClient.getCategories()
    ]);

    document.getElementById('footer-ebooks-count').textContent = ebooks.length;
    document.getElementById('footer-categories-count').textContent = categories.length;
    document.getElementById('footer-users-count').textContent = '100+';
  } catch (err) {
    console.error('Error loading footer statistics:', err);
    document.getElementById('footer-ebooks-count').textContent = '-';
    document.getElementById('footer-categories-count').textContent = '-';
    document.getElementById('footer-users-count').textContent = '-';
  }
}
