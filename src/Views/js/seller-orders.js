import { apiClient } from './api.js';
import { authManager } from './auth.js';
import { escapeHtml } from './helpers.js';

export async function renderSellerOrders() {
  const user = authManager.getUserData();
  if (!user) return alert('Usuario no identificado');

  const section = document.getElementById('orders-section');
  section.classList.remove('hidden');
  section.innerHTML = '<p>Cargando órdenes...</p>';

  try {
    const user = authManager.getUserData();
    const sellerId = user?.user_id;
    const data = await apiClient.makeRequest(`/orders/seller`, { method: 'GET' });
    const orders = data?.orders || [];

    if (!orders.length) {
      section.innerHTML = '<p>No tienes órdenes registradas 🚀</p>';
      return;
    }

    const rowsHtml = orders.map(o => `
    <tr class="border-b hover:bg-gray-50">
    <td class="px-4 py-2">${escapeHtml(o.order_id)}</td>
    <td class="px-4 py-2">${escapeHtml(o.status_name)}</td>
    <td class="px-4 py-2">${new Date(o.created_at).toLocaleDateString()}</td>
    <td class="px-4 py-2">$${Number(o.total).toFixed(2)}</td>
    </tr>
    `).join('');


    section.innerHTML = `
      <h3 class="text-2xl font-bold mb-4">Mis Órdenes</h3>
  <div class="overflow-x-auto">
    <table class="min-w-full border rounded-lg overflow-hidden text-left">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2">ID</th>
          <th class="px-4 py-2">Status</th>
          <th class="px-4 py-2">Fecha</th>
          <th class="px-4 py-2">Total</th>
        </tr>
      </thead>
      <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('Error cargando órdenes del seller:', err);
    section.innerHTML = '<p>Error cargando órdenes. Revisa la consola.</p>';
  }
}
