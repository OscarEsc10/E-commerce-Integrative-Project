// admin/js/admin-users.js
import { apiClient } from '../../js/api.js'; // <-- ruta relativa desde admin/js -> public/js/api.js

export async function renderManageUsers() {
  const section = document.getElementById('users-section');
  if (!section) return;
  section.classList.remove('hidden');

  section.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-bold">Gestionar Usuarios</h3>
      <div class="flex items-center space-x-3">
        <input id="users-search" placeholder="Buscar por nombre o email..." class="px-3 py-2 border rounded-lg" />
        <button id="add-user-btn" class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg">Nuevo Usuario</button>
      </div>
    </div>
    <div id="users-list" class="bg-white rounded-xl shadow p-4">
      <div id="users-table-wrapper">Cargando usuarios...</div>
    </div>

    <!-- Modal (hidden) -->
    <div id="user-modal" class="hidden fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <h4 id="user-modal-title" class="text-xl font-semibold mb-4">Nuevo Usuario</h4>
        <form id="user-form" class="space-y-3">
          <input type="hidden" id="user-id" />
          <div>
            <label class="block text-sm font-medium">Nombre</label>
            <input id="user-name" name="name" required class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium">Email</label>
            <input id="user-email" name="email" type="email" required class="w-full p-2 border rounded" />
          </div>
          <div>
            <label class="block text-sm font-medium">Rol</label>
            <select id="user-role" name="role_id" class="w-full p-2 border rounded">
              <option value="1">admin</option>
              <option value="2">seller</option>
              <option value="3" selected>customer</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">Contraseña <small class="text-gray-500">(solo para crear o cambiar)</small></label>
            <input id="user-password" name="password" type="password" class="w-full p-2 border rounded" />
          </div>
          <div class="flex justify-end space-x-3 mt-4">
            <button type="button" id="user-cancel-btn" class="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded bg-indigo-600 text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Wiring
  document.getElementById('add-user-btn').addEventListener('click', () => openUserModal());
  document.getElementById('users-search').addEventListener('input', onSearchInput);

  await fetchAndRenderUsers();
}

let allUsersCache = [];

async function fetchAndRenderUsers() {
  const wrapper = document.getElementById('users-table-wrapper');
  wrapper.innerHTML = 'Cargando usuarios...';
  try {
    const resp = await apiClient.makeRequest('/users', { method: 'GET' });
    // contemplo varias formas de respuesta
    const users = resp?.users || resp?.data || resp || [];
    allUsersCache = Array.isArray(users) ? users : [];
    renderUsersTable(allUsersCache);
  } catch (err) {
    console.error('Error cargando usuarios:', err);
    wrapper.innerHTML = `<p class="text-red-600">No se pudieron cargar los usuarios.</p>`;
  }
}

function renderUsersTable(users) {
  const wrapper = document.getElementById('users-table-wrapper');
  if (!Array.isArray(users) || users.length === 0) {
    wrapper.innerHTML = `<p class="text-gray-600">No hay usuarios.</p>`;
    return;
  }

  const rows = users.map(u => {
    const id = u.user_id ?? u.id ?? u.userId ?? '—';
    const name = escapeHtml(u.name ?? u.full_name ?? '');
    const email = escapeHtml(u.email ?? '');
    // preferir role name if existe, si no, mapear role_id
    const roleName = u.role ?? (u.role_id ? (u.role_id === 1 ? 'admin' : u.role_id === 2 ? 'seller' : 'customer') : '—');
    return `
      <div class="flex items-center justify-between border-b py-3">
        <div>
          <div class="font-semibold">${name} <span class="text-sm text-gray-500">#${id}</span></div>
          <div class="text-sm text-gray-600">${email}</div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="text-sm text-gray-700 px-3 py-1 rounded bg-gray-100">${roleName}</div>
          <button class="edit-user-btn px-3 py-1 rounded bg-green-500 text-white text-sm" data-id="${id}">Editar</button>
          <button class="delete-user-btn px-3 py-1 rounded bg-red-500 text-white text-sm" data-id="${id}">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');

  wrapper.innerHTML = `<div class="divide-y">${rows}</div>`;

  // attach events
  wrapper.querySelectorAll('.edit-user-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const user = allUsersCache.find(x => String(x.user_id ?? x.id ?? x.userId) === String(id));
      openUserModal(user);
    });
  });
  wrapper.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!confirm('Eliminar usuario?')) return;
      try {
        await apiClient.makeRequest(`/users/${id}`, { method: 'DELETE' });
        await fetchAndRenderUsers();
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        alert('No se pudo eliminar el usuario');
      }
    });
  });
}

function onSearchInput(e) {
  const term = (e.target.value || '').toLowerCase().trim();
  if (!term) return renderUsersTable(allUsersCache);
  const filtered = allUsersCache.filter(u => {
    const name = (u.name || u.full_name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(term) || email.includes(term);
  });
  renderUsersTable(filtered);
}

/* --------------------------
   Modal / Create / Update
   -------------------------- */
function openUserModal(user = null) {
  const modal = document.getElementById('user-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  document.getElementById('user-id').value = user?.user_id ?? user?.id ?? '';
  document.getElementById('user-name').value = user?.name ?? user?.full_name ?? '';
  document.getElementById('user-email').value = user?.email ?? '';
  // if backend uses role_id numeric:
  document.getElementById('user-role').value = String(user?.role_id ?? (user?.role === 'admin' ? 1 : user?.role === 'seller' ? 2 : 3));

  document.getElementById('user-password').value = '';

  document.getElementById('user-modal-title').textContent = user ? 'Editar Usuario' : 'Nuevo Usuario';

  // cancel
  document.getElementById('user-cancel-btn').onclick = () => modal.classList.add('hidden');

  // submit (one-time binding)
  const form = document.getElementById('user-form');
  const handler = async (ev) => {
    ev.preventDefault();
    await submitUserForm();
    modal.classList.add('hidden');
    form.removeEventListener('submit', handler);
  };
  form.addEventListener('submit', handler);
}

async function submitUserForm() {
  const id = document.getElementById('user-id').value;
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const role_id = Number(document.getElementById('user-role').value) || 3;
  const password = document.getElementById('user-password').value;

  const payload = { name, email, role_id };
  if (password) payload.password = password;

  try {
    if (id) {
      await apiClient.makeRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await apiClient.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
    await fetchAndRenderUsers();
  } catch (err) {
    console.error('Error guardando usuario:', err);
    alert('No se pudo guardar el usuario');
  }
}

/* --------------------------
   Helpers
   -------------------------- */
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}
