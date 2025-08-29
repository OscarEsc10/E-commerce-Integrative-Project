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

  const show = id => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); };
  const hide = id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };

  // Hide all first
  [
    'btn-manage-users','btn-manage-sellers','btn-reports','btn-manage-ebooks',
    'btn-manage-orders','btn-sales-summary','btn-view-catalog','btn-become-seller',
    'btn-cart','btn-view-profile'
  ].forEach(id => hide(id));

  // Profile always
  show('btn-view-profile');

  if (role === 'admin') {
    show('btn-manage-users');
    show('btn-manage-sellers');
    show('btn-manage-ebooks');
    show('btn-manage-orders');
    show('btn-reports');
  }

  if (role === 'seller') {
    show('btn-manage-ebooks');
    show('btn-manage-orders');
    show('btn-sales-summary');
    show('btn-cart');
  }

  if (role === 'customer') {
    show('btn-view-catalog');
    show('btn-become-seller');
    show('btn-cart');
  }
}

/* ------------------------
   Event listeners
   ------------------------ */
function attachEventListeners(user) {
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };


  // Customer: view catalog
  on('btn-view-catalog', () => {
    window.location.href = '/ebooks';
  });

  // Manage ebooks (admin & seller)
  on('btn-manage-ebooks', () => {
    window.location.href = '/ebooks';
  });

  // Manage orders (admin & seller)
  on('btn-manage-orders', () => {
    loadSection('orders-section');
    renderOrders();
  });

  // Sales summary (seller)
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
    await populateProfile();
  });


  //back to dashboard button
  document.getElementById('btn-back-dashboard')?.addEventListener('click', () => {
  document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
  document.querySelector('.ebooks-section').classList.remove('hidden'); // o el id de la sección principal
});


  // Logout button
  const logoutEl = document.querySelector('button[onclick="authManager.logout()"]')
    || document.getElementById('logoutBtn')
    || document.getElementById('btnLogout');
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
   Profile population
   ------------------------ */
async function populateProfile() {
  const profileContent = document.getElementById('profile-content');
  if (!profileContent) return;

  let user = authManager.getUserData() || {};
  try {
    if (typeof apiClient.getProfile === 'function') {
      const resp = await apiClient.getProfile();
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
   Placeholders
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
   Footer
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
      lastUpdatedEl.textContent = `Última actualización: ${now.toLocaleDateString('es-ES', {
        year:'numeric', month:'long', day:'numeric',
        hour:'2-digit', minute:'2-digit'
      })}`;
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
