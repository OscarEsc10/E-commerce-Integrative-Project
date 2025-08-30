import { authManager } from './auth.js';
import { apiClient } from './api.js';
import { renderManageSellers } from '../admin/js/admin-seller-request.js';
import { renderManageUsers } from '../admin/js/admin-users.js';
import { cartManager } from './CartManager.js';

const ROLE_MAP = { 1: 'admin', 2: 'seller', 3: 'customer' };

document.addEventListener('DOMContentLoaded', () => {
  initDashboard().catch(err => console.error('Init dashboard error:', err));
});

/* ------------------------
   Inicialización
   ------------------------ */
async function initDashboard() {
  // Exponer authManager globalmente (HTML usa onclick="authManager.logout()")
  window.authManager = authManager;

  // Forzar auth / redirect si no está autenticado
  if (!authManager.requireAuth()) return;

  // Inicializar UI desde authManager (pone nombre/rol si hay datos)
  authManager.initializeUI();

  // Obtener usuario local (podría venir con shape distinta)
  const user = authManager.getUserData() || {};

  // Navbar / welcome
  updateNavbarUser(user);

  // Mostrar botones según rol
  setupUIForRole(user);

  // Conectar eventos
  attachEventListeners(user);

  // Cargar carrito inicialmente (badge + lista)  
  await cartManager.loadCart();


  // Footer dinámico / stats
  initializeDynamicFooter();
  try { await loadFooterStats(); } catch (e) { console.warn(e); }

  // Actualizar cada cierto tiempo (opcional)
  setInterval(() => {
    authManager.initializeUI();
    loadFooterStats().catch(()=>{});
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

function getUserId(user) {
  return user?.user_id ?? user?.id ?? user?.userId ?? user?.uid ?? null;
}

/* ------------------------
   UI por rol
   ------------------------ */
function setupUIForRole(user) {
  const role = getRoleFromUser(user);

  const show = id => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); };
  const hide = id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };

  // Asegurar estado inicial (ocultar)
  [
    'btn-manage-users','btn-manage-sellers','btn-reports','btn-manage-ebooks',
    'btn-manage-orders','btn-sales-summary','btn-view-catalog','btn-request-seller',
    'btn-become-seller','btn-cart','btn-view-profile','btn-request-seller','btn-manage-sellers'
  ].forEach(id => hide(id));

  // Perfil siempre visible
  show('btn-view-profile');

  if (role === 'admin') {
    show('btn-manage-users');
    show('btn-manage-sellers');
    show('btn-manage-ebooks');
    show('btn-manage-orders');
    show('btn-reports');
    // admin no necesita carrito por defecto, pero si quieres mostrarlo:
    // show('btn-cart');
  }

  if (role === 'seller') {
    show('btn-manage-ebooks');
    show('btn-manage-orders');
    show('btn-sales-summary');
    show('btn-cart'); // corresponde a id="btn-cart" en el HTML
  }

  if (role === 'customer') {
    show('btn-view-catalog');
    show('btn-become-seller');
    show('btn-request-seller');
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
    window.location.href = 'ebooks-dashboard.html';
  });

  // Manage ebooks (admin & seller)
  on('btn-manage-ebooks', () => {
    window.location.href = 'ebooks-dashboard.html';
  });

  // Manage orders (admin & seller)
  on('btn-manage-orders', () => {
    loadSection('orders-section');
    renderOrders();
  });

  on('btn-sales-summary', () => {
    loadSection('sales-summary-section');
    const el = document.getElementById('sales-summary-content');
    if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Resumen de Ventas</h3><p class="text-gray-600">Función en desarrollo 🚧</p>`;
  });

  on('btn-reports', () => {
    loadSection('reports-section');
    renderReports();
  });

  on('btn-manage-users', async () => {
    // muestra la sección y carga la UI de gestión de usuarios
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
    await renderManageUsers();
  });

  on('btn-manage-sellers', () => {
    loadSection('sellers-section');
    renderManageSellers();
  });

  // Convertirme en vendedor (abre formulario en dashboard)
  const becomeBtn = document.getElementById('btn-become-seller') || document.getElementById('btn-request-seller');
  if (becomeBtn) {
    becomeBtn.addEventListener('click', async () => {
      const userId = getUserId(authManager.getUserData() || {});
      if (!userId) {
        alert('Usuario no identificado.');
        return;
      }
      await renderBecomeSellerSection(userId);
    });
  }

  // Peticiones del cliente: "Mis solicitudes"
  const requestBtn = document.getElementById('btn-request-seller');
  if (requestBtn) {
    requestBtn.addEventListener('click', async () => {
      const userId = getUserId(authManager.getUserData() || {});
      if (!userId) return alert('Usuario no identificado.');
      await loadUserRequests(userId);
    });
  }

  // Carrito: mostrar sección y cargar datos desde cartManager
  on('btn-cart', async () => {
    loadSection('cart-section');
    try {
      await cartManager.loadCart(); // update badge + render #cart-list
      // scroll to cart
      document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error cargando carrito desde cartBtn:', err);
    }
  });

  // Perfil
  on('btn-view-profile', async () => {
    loadSection('profile-section');
    await populateProfile();
  });

  // Back to dashboard button if exists
  const backBtn = document.getElementById('btn-back-dashboard');
  if (backBtn) backBtn.addEventListener('click', () => {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Logout (por si hay distinto id en HTML)
  const logoutEl = document.querySelector('button[onclick="authManager.logout()"]') || document.getElementById('logoutBtn') || document.getElementById('btnLogout');
  if (logoutEl) {
    logoutEl.addEventListener('click', (e) => {
      e.preventDefault();
      authManager.logout();
    });
  }
}

/* ------------------------
   Sections / rendering helpers
   ------------------------ */
function loadSection(sectionId) {
  document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(sectionId);
  if (el) el.classList.remove('hidden');
}

/* ------------------------
   Profile
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
        <span class="text-gray-600">${user.created_at || user.createdAt ? new Date(user.created_at || user.createdAt).toLocaleDateString('es-ES') : '—'}</span>
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
   Ebooks (sección del dashboard)
   ------------------------ */
async function loadEbooksSection() {
  // Muestra ebooks dentro del dashboard (no la vista completa separate)
  loadSection('ebooks-section');
  try {
    const all = typeof apiClient.getEbooks === 'function' ? await apiClient.getEbooks() : [];
    const user = authManager.getUserData() || {};
    const role = getRoleFromUser(user);

    let ebooks = Array.isArray(all) ? all : (all.data || all.ebooks || []);
    // Si seller -> mostrar solo los suyos (si tu backend guarda seller_id)
    if (role === 'seller') {
      const uid = getUserId(user);
      ebooks = ebooks.filter(e => (e.seller_id ?? e.sellerId ?? e.user_id ?? e.userId) == uid);
    }

    renderEbooksInDashboard(ebooks);
  } catch (err) {
    console.error('Error cargando ebooks en dashboard:', err);
    const container = document.getElementById('ebooksContainer');
    if (container) container.innerHTML = `<p class="text-red-600">No se pudieron cargar los ebooks.</p>`;
  }
}

function renderEbooksInDashboard(ebooks) {
  const container = document.getElementById('ebooksContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!ebooks || ebooks.length === 0) {
    container.innerHTML = `<p class="text-gray-600">No hay ebooks para mostrar.</p>`;
    return;
  }

  ebooks.forEach(ebook => {
    const id = ebook.ebook_id ?? ebook.id ?? ebook.ebookId ?? ebook.book_id;
    const priceNum = Number(ebook.price ?? ebook.price_usd ?? 0) || 0;
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md p-4 flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <h4 class="font-semibold text-lg mb-2">${escapeHtml(ebook.name ?? ebook.title ?? 'Sin título')}</h4>
        <p class="text-gray-600 text-sm mb-3">${escapeHtml(ebook.description ?? '')}</p>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <div class="text-indigo-600 font-bold">$${priceNum.toFixed(2)}</div>
        <div class="flex items-center space-x-2">
          ${getRoleFromUser(authManager.getUserData() || {}) === 'customer' ? `<button class="add-cart-btn bg-indigo-500 text-white py-1 px-3 rounded-lg text-sm" data-id="${id}" data-name="${escapeHtml(ebook.name ?? ebook.title ?? '')}" data-price="${priceNum.toFixed(2)}">Agregar al carrito</button>` : ''}
          ${['admin','seller'].includes(getRoleFromUser(authManager.getUserData() || {})) ? `<button class="edit-ebook-btn bg-green-500 text-white py-1 px-3 rounded-lg text-sm" data-id="${id}">Editar</button>
          <button class="delete-ebook-btn bg-red-500 text-white py-1 px-3 rounded-lg text-sm" data-id="${id}">Eliminar</button>` : ''}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach listeners a los botones recién creados
  // Botones para agregar al carrito (solo en la vista de catálogo/ebooks)
  container.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const ebookId = e.currentTarget.dataset.id;
      // Delega la lógica de añadir al CartManager (CartManager.addItem hace POST al backend)
      try {
        await cartManager.addItem(ebookId);
        showTempSuccess('Agregado al carrito');
      } catch (err) {
        console.error('Error al añadir al carrito desde ebooks:', err);
        showTempError('No se pudo agregar al carrito');
      }
    });
  });

  // Edit / Delete (admin / seller)
  container.querySelectorAll('.edit-ebook-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ebookId = e.currentTarget.dataset.id;
      window.location.href = `ebooks-dashboard.html?edit=${ebookId}`;
    });
  });

  container.querySelectorAll('.delete-ebook-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const ebookId = e.currentTarget.dataset.id;
      if (!confirm('¿Eliminar ebook?')) return;
      try {
        await apiClient.deleteEbook(ebookId);
        showTempSuccess('Ebook eliminado');
        await loadEbooksSection();
      } catch (err) {
        console.error(err);
        showTempError('No se pudo eliminar');
      }
    });
  });
}

/* ------------------------
   Carrito (compatibilidad y render legacy)
   ------------------------ */
async function addToCart(ebookId, quantity = 1) {
  const user = authManager.getUserData() || {};
  const userId = getUserId(user);
  if (!userId) return alert('Usuario no identificado.');

  const payload = { user_id: userId, ebook_id: Number(ebookId), quantity: Number(quantity) || 1 };

  try {
    if (typeof apiClient.addToCart === 'function') {
      await apiClient.addToCart(payload);
    } else {
      // Fallback: call /cart endpoint
      await apiClient.makeRequest('/cart', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    showTempSuccess('Agregado al carrito');
    // refrescar sección del carrito si está visible (legacy)
    const cartSectionVisible = !document.getElementById('cart-section')?.classList.contains('hidden');
    if (cartSectionVisible) {
      await loadCart(userId);
    }
  } catch (err) {
    console.error('Error agregando al carrito:', err);
    showTempError('No se pudo agregar al carrito');
    throw err;
  }
}

// Legacy: carga carrito y pinta en #cart-content (usa cuando tu HTML quiere ese contenedor)
async function loadCart(userId) {
  const container = document.getElementById('cart-content');
  if (!container) return;
  container.innerHTML = 'Cargando...';

  try {
    let cartResp;
    if (typeof apiClient.getCart === 'function') {
      cartResp = await apiClient.getCart(userId);
    } else {
      cartResp = await apiClient.makeRequest(`/cart/${userId}`);
    }

    const items = Array.isArray(cartResp) ? cartResp : (cartResp.data || cartResp.items || []);
    if (!items.length) {
      container.innerHTML = '<p class="text-gray-600">Carrito vacío 🚀</p>';
      return;
    }

    container.innerHTML = items.map(it => {
      const title = it.title ?? it.name ?? 'Sin título';
      const price = Number(it.price ?? it.ebook_price ?? 0).toFixed(2);
      const qty = it.quantity ?? it.qty ?? 1;
      return `<div class="flex justify-between p-2 border-b">
                <div>${escapeHtml(title)} <span class="text-sm text-gray-500">x${qty}</span></div>
                <div class="font-semibold">$${price}</div>
              </div>`;
    }).join('');
  } catch (err) {
    console.error('Error cargando carrito:', err);
    container.innerHTML = '<p class="text-red-600">Error cargando carrito</p>';
  }
}

/* ------------------------
   Seller Requests (customer)
   ------------------------ */
async function renderBecomeSellerSection(userId) {
  const section = document.getElementById('become-seller-section');
  if (!section) return;
  section.classList.remove('hidden');
  section.innerHTML = `<h3 class="text-xl font-bold mb-4">Solicitud para ser Vendedor</h3>
    <div id="seller-form-wrapper" class="bg-white p-4 rounded-lg shadow-sm"></div>`;

  // First check if user has existing requests
  try {
    const requests = await tryGetUserSellerRequests(userId);
    if (requests && requests.length) {
      // show list of requests
      const html = requests.map(r => `
        <div class="p-3 border rounded mb-3">
          <p><strong>ID:</strong> ${r.request_id ?? r.id}</p>
          <p><strong>Negocio:</strong> ${escapeHtml(r.business_name ?? r.businessName ?? '—')}</p>
          <p><strong>Estado:</strong> ${escapeHtml(r.status_name ?? r.status ?? 'PENDING')}</p>
          <p><strong>Descripción:</strong> ${escapeHtml(r.description ?? '')}</p>
        </div>
      `).join('');
      document.getElementById('seller-form-wrapper').innerHTML = `<h4 class="font-semibold mb-2">Tus solicitudes</h4>${html}`;
      return;
    }
  } catch (err) {
    // ignore and show form
    console.warn('No se pudieron obtener solicitudes, se mostrará el formulario:', err);
  }

  // If no requests, show form
  document.getElementById('seller-form-wrapper').innerHTML = `
    <form id="sellerRequestForm" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nombre del negocio</label>
        <input name="business_name" required class="w-full p-2 border rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Documento (ID / NIT)</label>
        <input name="document_id" required class="w-full p-2 border rounded" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea name="description" required class="w-full p-2 border rounded"></textarea>
      </div>
      <div>
        <button type="submit" class="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded">Enviar Solicitud</button>
        <span id="sellerRequestMsg" class="ml-3 text-sm"></span>
      </div>
    </form>
  `;

  const form = document.getElementById('sellerRequestForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      user_id: userId,
      business_name: fd.get('business_name'),
      document_id: fd.get('document_id'),
      description: fd.get('description')
    };
    try {
      // POST /seller-requests
      await apiClient.makeRequest('/seller-requests', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      document.getElementById('sellerRequestMsg').innerHTML = `<span class="text-green-600">Solicitud enviada ✅</span>`;
      // mostrar la lista actualizada
      await loadUserRequests(userId);
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      document.getElementById('sellerRequestMsg').innerHTML = `<span class="text-red-600">Error enviando solicitud</span>`;
    }
  });
}

async function tryGetUserSellerRequests(userId) {
  // Try common routes: /seller-requests/user/:id  OR /seller-requests/my
  try {
    const resp = await apiClient.makeRequest(`/seller-requests/user/${userId}`, { method: 'GET' });
    // Cualquier forma: resp.data || resp.requests || resp
    return resp?.data || resp?.requests || resp;
  } catch (err) {
    // try /seller-requests/my
    try {
      const resp2 = await apiClient.makeRequest('/seller-requests/my', { method: 'GET' });
      return resp2?.data || resp2?.requests || resp2;
    } catch (err2) {
      throw err2;
    }
  }
}

async function loadUserRequests(userId) {
  loadSection('become-seller-section');
  const section = document.getElementById('become-seller-section');
  section.innerHTML = '<h3 class="text-xl font-bold mb-4">Mis Solicitudes</h3><div id="user-requests-wrapper">Cargando...</div>';
  try {
    const requests = await tryGetUserSellerRequests(userId);
    const wrapper = document.getElementById('user-requests-wrapper');
    if (!requests || requests.length === 0) {
      wrapper.innerHTML = `<p class="text-gray-600">Usted no tiene solicitudes 🚀</p>`;
      return;
    }
    wrapper.innerHTML = requests.map(r => `
      <div class="border rounded p-3 mb-3">
        <p><strong>ID:</strong> ${r.request_id ?? r.id}</p>
        <p><strong>Negocio:</strong> ${escapeHtml(r.business_name ?? r.businessName ?? '')}</p>
        <p><strong>Estado:</strong> <span class="${requestStatusClass(r.sr_status_id ?? r.status_id ?? r.status)}">${escapeHtml(r.status_name ?? r.status ?? 'PENDING')}</span></p>
        <p><strong>Descripción:</strong> ${escapeHtml(r.description ?? '')}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error cargando solicitudes:', err);
    document.getElementById('user-requests-wrapper').innerHTML = `<p class="text-red-600">Error cargando solicitudes</p>`;
  }
}

function requestStatusClass(sid) {
  // map numeric status -> classes (1 pending, 2 approved, 3 rejected)
  if (!sid) return 'text-gray-600';
  if (sid === 1) return 'text-yellow-600 font-semibold';
  if (sid === 2) return 'text-green-600 font-semibold';
  if (sid === 3) return 'text-red-600 font-semibold';
  return 'text-gray-600';
}

/* ------------------------
   Placeholder renderers
   ------------------------ */
function renderUsers() {
  const el = document.getElementById('users-section');
  if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Gestionar Usuarios</h3><p class="text-gray-600">Funcionalidad en desarrollo.</p>`;
}
function renderOrders() {
  const el = document.getElementById('orders-section');
  if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Gestionar Pedidos</h3><p class="text-gray-600">Funcionalidad en desarrollo.</p>`;
}
function renderReports() {
  const el = document.getElementById('reports-section');
  if (el) el.innerHTML = `<h3 class="text-xl font-bold mb-2">Reportes</h3><p class="text-gray-600">Funcionalidad en desarrollo.</p>`;
}

/* ------------------------
   Footer / stats
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
   Small UI helpers
   ------------------------ */
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

function showTempSuccess(msg) {
  try { console.info(msg); } catch(e) { alert(msg); }
}
function showTempError(msg) {
  try { console.error(msg); } catch(e) { alert(msg); }
}

export {
  loadEbooksSection,
  renderEbooksInDashboard,
  loadCart,
  addToCart,
  loadUserRequests,
  renderBecomeSellerSection
};