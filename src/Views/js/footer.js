export function initializeFooter() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
  updateLastUpdated();
  loadFooterStats();

  setInterval(() => {
    updateLastUpdated();
    loadFooterStats();
  }, 5 * 60 * 1000);
}

function updateLastUpdated() {
  const now = new Date();
  const lastUpdated = now.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('last-updated').textContent = `Última actualización: ${lastUpdated}`;
}

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
    console.error('Error cargando estadísticas del footer:', err);
    document.getElementById('footer-ebooks-count').textContent = '-';
    document.getElementById('footer-categories-count').textContent = '-';
    document.getElementById('footer-users-count').textContent = '-';
  }
}
