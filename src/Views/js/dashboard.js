// js/dashboard.js
import { authManager } from './auth.js';
import { apiClient } from './api.js';

const ROLE_MAP = { 1: 'admin', 2: 'seller', 3: 'customer' };

document.addEventListener('DOMContentLoaded', () => {
  initDashboard().catch(err => console.error('Init dashboard error:', err));
});

async function initDashboard() {
  // Exponer globalmente para handlers inline en HTML
  window.authManager = authManager;

  // Requerir autenticación (requireAuth hace redirect si no está)
  if (!authManager.requireAuth()) return;

  // Inicializar UI desde authManager (pone nombre/rol si existe)
  authManager.initializeUI();

  // Obtener usuario (local)
  const user = authManager.getUserData() || {};

  // Actualizar navbar / welcome
  updateNavbarUser(user);

  // Mostrar/ocultar botones según rol
  setupUIForRole(user);

  // Conectar eventos
  attachEventListeners(user);

  // Footer / stats
  initializeDynamicFooter();
  try { await loadFooterStats(); } catch (e) { /* ya manejado */ }

  // Actualizar periódicamente
  setInterval(() => {
    authManager.initializeUI();
    loadFooterStats();
  }, 5 * 60 * 1000);
}

/* ------------------------
   Helpers: navbar & role
   ------------------------ */
function updateNavbarUser(user) {
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  const welcomeEl = document.getElementById('welcomeMessage');

  if (userNameEl) userNameEl.textContent = user.name || user.full_name || 'Usuario';
  if (userAvatarEl) userAvatarEl.textContent = (user.name || user.full_name || 'U').charAt(0).toUpperCase();
  if (welcomeEl) welcomeEl.textContent = `Bienvenido, ${user.name || user.full_name || 'Usuario'}`;
}

function getRoleFromUser(user) {
  if (!user) return 'customer';
  if (user.role) return String(user.role).toLowerCase();
  if (user.role_id) return ROLE_MAP[user.role_id] || String(user.role_id);
  return 'customer';
}

function setupUIForRole(user) {
  const role = getRoleFromUser(user);

  // All pages have these buttons in HTML hidden by default.
  // Un-hide only the ones allowed for this role.
  const show = id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  };
  const hide = id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  };

  // First ensure everything is hidden by default (safe)
  [
    'btn-manage-users','btn-manage-sellers','btn-reports','btn-manage-ebooks',
    'btn-manage-orders','btn-sales-summary','btn-view-catalog','btn-become-seller',
    'btn-cart','btn-view-profile'
  ].forEach(id => hide(id));

  // Common: profile always visible
  show('btn-view-profile');

  if (role === 'admin') {
    show('btn-manage-users');
    show('btn-manage-sellers');
    show('btn-manage-ebooks'); // admin can manage books
    show('btn-manage-orders'); // admin manage orders
    show('btn-reports');       // admin reports
    // cart not shown for admin
  }

  if (role === 'seller') {
    show('btn-manage-ebooks');
    show('btn-manage-orders');
    show('btn-sales-summary'); // placeholder
    show('btn-cart');          // seller can view cart (per tu petición)
  }

  if (role === 'customer') {
    show('btn-view-catalog');  // catalog (customer view)
    show('btn-become-seller');
    show('btn-cart');
  }
}

/* ------------------------
   Event listeners
   ------------------------ */
function attachEventListeners(user) {
  // Helper to safely attach
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  // Customer: view catalog -> ebooks section
  on('btn-view-catalog', async () => {
    loadSection('ebooks-section');
    await initEbooksDashboard(); // will instantiate and load ebooks
  });

  // Manage ebooks (admin & seller)
  on('btn-manage-ebooks', async () => {
    loadSection('ebooks-section');
    await initEbooksDashboard();
  });

  // Manage orders (admin & seller)
  on('btn-manage-orders', () => {
    loadSection('orders-section');
    renderOrders();
  });

  // Sales summary (seller) - placeholder
  on('btn-sales-summary', () => {
    loadSection('sales-summary-section');
    const el = document.getElementById('sales-summary-content');
    if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Resumen de Ventas</h3><p class="text-gray-600">Función en desarrollo 🚧</p>`;
  });

  // Reports (admin)
  on('btn-reports', () => {
    loadSection('reports-section');
    renderReports();
  });

  // Manage users / sellers (admin)
  on('btn-manage-users', () => {
    loadSection('users-section');
    renderUsers();
  });
  on('btn-manage-sellers', () => {
    loadSection('sellers-section');
    renderSellers();
  });

  // Become seller (customer)
  on('btn-become-seller', () => {
    loadSection('become-seller-section');
  });

  // Cart (seller & customer)
  on('btn-cart', () => {
    loadSection('cart-section');
    renderCart();
  });

  // Profile
  on('btn-view-profile', async () => {
    loadSection('profile-section');
    await populateProfile(); // loads and renders profile into #profile-content
  });

  // Also attach logout button if present (safer than relying only on inline)
  const logoutEl = document.querySelector('button[onclick="authManager.logout()"]') || document.getElementById('logoutBtn') || document.getElementById('btnLogout');
  if (logoutEl) {
    logoutEl.addEventListener('click', (e) => {
      e.preventDefault();
      authManager.logout();
    });
  }
}

/* ------------------------
   Sections / rendering
   ------------------------ */
function loadSection(sectionId) {
  document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(sectionId);
  if (el) el.classList.remove('hidden');
}

/* ------------------------
   Ebooks dashboard bootstrap (robust)
   ------------------------ */
async function initEbooksDashboard() {
  // if already initialized, ensure it refreshes
  if (window.dashboard && typeof window.dashboard.loadEbooks === 'function') {
    try { await window.dashboard.loadEbooks(); } catch (e) { console.warn(e); }
    return window.dashboard;
  }

  // First try ESM import (if ebooks-dashboard exports the class)
  try {
    const mod = await import('./ebooks-dashboard.js');
    const EClass = mod.EbooksDashboard || mod.default;
    if (EClass) {
      window.dashboard = new EClass();
      return window.dashboard;
    }
    // If file executed and assigned window.dashboard internally, check that:
    if (window.dashboard && typeof window.dashboard.loadEbooks === 'function') return window.dashboard;
  } catch (err) {
    // fallback to script injection
    console.warn('Dynamic import failed or no export, falling back to script tag:', err);
  }

  // Fallback: inject script tag (this will execute the file in global scope)
  return new Promise((resolve, reject) => {
    if (window.dashboard && typeof window.dashboard.loadEbooks === 'function') return resolve(window.dashboard);

    const script = document.createElement('script');
    script.src = './ebooks-dashboard.js';
    script.type = 'text/javascript';
    script.onload = () => {
      // If the script itself created window.dashboard, use it.
      if (window.dashboard && typeof window.dashboard.loadEbooks === 'function') {
        resolve(window.dashboard);
        return;
      }
      // Otherwise, if it attached class to window, instantiate
      if (window.EbooksDashboard) {
        try {
          window.dashboard = new window.EbooksDashboard();
          resolve(window.dashboard);
        } catch (e) {
          reject(e);
        }
        return;
      }
      reject(new Error('ebooks-dashboard failed to initialize (no export, no global class)'));
    };
    script.onerror = (e) => reject(new Error('Failed to load ebooks-dashboard.js'));
    document.body.appendChild(script);
  });
}

/* ------------------------
   Profile population
   ------------------------ */
async function populateProfile() {
  const profileContent = document.getElementById('profile-content');
  if (!profileContent) return;

  // try to get fresh profile, otherwise use cached
  let user = authManager.getUserData() || {};
  try {
    if (typeof apiClient.getProfile === 'function') {
      const resp = await apiClient.getProfile();
      // normalize shapes: resp.data.user, resp.user, resp.data, resp
      user = resp?.data?.user || resp?.user || resp?.data || resp || user;
      if (user) authManager.setUserData(user);
    }
  } catch (err) {
    console.warn('No se pudo refrescar perfil, usando local:', err);
  }

  profileContent.innerHTML = `
    <h3 class="text-2xl font-bold mb-4">Información del Perfil</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <label class="block font-semibold text-gray-700 mb-2">Nombre Completo:</label>
        <span class="text-gray-600">${escapeHtml(user.name || user.full_name || '—')}</span>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg">
        <label class="block font-semibold text-gray-700 mb-2">Email:</label>
        <span class="text-gray-600">${escapeHtml(user.email || '—')}</span>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg">
        <label class="block font-semibold text-gray-700 mb-2">Rol:</label>
        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${roleBadgeClass(user)}">${escapeHtml(user.role || ROLE_MAP[user.role_id] || '—')}</span>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg">
        <label class="block font-semibold text-gray-700 mb-2">Fecha de Registro:</label>
        <span class="text-gray-600">${user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '—'}</span>
      </div>
    </div>
  `;
}

function roleBadgeClass(user) {
  const role = getRoleFromUser(user);
  if (role === 'admin') return 'bg-red-500 text-white';
  if (role === 'seller') return 'bg-green-500 text-white';
  if (role === 'customer') return 'bg-blue-500 text-white';
  return 'bg-gray-500 text-white';
}

/* ------------------------
   Placeholders for sections not yet implemented
   ------------------------ */
function renderUsers() {
  const el = document.getElementById('users-section');
  if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Gestionar Usuarios</h3><p class="text-gray-600">Funcionalidad en desarrollo.</p>`;
}
function renderSellers() {
  const el = document.getElementById('sellers-section');
  if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Gestionar Sellers</h3><p class="text-gray-600">Funcionalidad en desarrollo.</p>`;
}
function renderOrders() {
  const el = document.getElementById('orders-section');
  if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Gestionar Pedidos</h3><p class="text-gray-600">Funcionalidad en desarrollo.</p>`;
}
function renderReports() {
  const el = document.getElementById('reports-section');
  if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Reportes</h3><p class="text-gray-600">Funcionalidad en desarrollo.</p>`;
}
function renderCart() {
  const el = document.getElementById('cart-content');
  if (el) el.innerHTML = `<p class="text-gray-600">Carrito vacío (luego implementamos añadir/eliminar).</p>`;
}

/* ------------------------
   Footer / stats (light)
   ------------------------ */
async function loadFooterStats() {
  try {
    const eResp = typeof apiClient.getEbooks === 'function' ? await apiClient.getEbooks() : [];
    const cResp = typeof apiClient.getCategories === 'function' ? await apiClient.getCategories() : [];

    const ebooks = Array.isArray(eResp) ? eResp : (eResp.data || eResp.ebooks || []);
    const categories = Array.isArray(cResp) ? cResp : (cResp.data || cResp.categories || []);

    const ebooksCountEl = document.getElementById('footer-ebooks-count');
    const categoriesCountEl = document.getElementById('footer-categories-count');
    if (ebooksCountEl) ebooksCountEl.textContent = String(ebooks.length || 0);
    if (categoriesCountEl) categoriesCountEl.textContent = String(categories.length || 0);

    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
      const now = new Date();
      lastUpdatedEl.textContent = `Última actualización: ${now.toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'})}`;
    }
  } catch (err) {
    console.error('Error loading footer stats:', err);
  }
}

function initializeDynamicFooter() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ------------------------
   Utilities
   ------------------------ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}
