// src/Views/js/customer-orders.js
import { apiClient } from './api.js';
import { authManager } from './auth.js';
import { escapeHtml } from './helpers.js';

export async function renderCustomerOrders() {
  const user = authManager.getUserData();
  if (!user) return alert('Usuario no identificado');

  const section = document.getElementById('customer-orders-section');
  section.classList.remove('hidden');
  section.innerHTML = '<p>Cargando tus compras...</p>';

  try {
    const userId = user.user_id;
    const data = await apiClient.makeRequest(`/orders/customer`, { method: 'GET' });
    const orders = data?.orders || [];

    if (!orders.length) {
      section.innerHTML = '<p>No tienes compras registradas 🚀</p>';
      return;
    }

    const rowsHtml = orders.map(o => `
    <tr class="border-b hover:bg-gray-50">
    <td class="px-4 py-2">${o.order_id}</td>
    <td class="px-4 py-2">${escapeHtml(o.status_name)}</td>
    <td class="px-4 py-2">${new Date(o.created_at).toLocaleDateString()}</td>
    <td class="px-4 py-2 text-right">$${Number(o.total).toFixed(2)}</td>
    </tr>
    `).join('');


    section.innerHTML = `
      <h3 class="text-xl font-bold mb-4">Mis Compras</h3>
        <table class="w-full text-left border rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
      <tr>
        <th class="px-4 py-2">ID</th>
        <th class="px-4 py-2">Estado</th>
        <th class="px-4 py-2">Fecha</th>
        <th class="px-4 py-2 text-right">Total</th>
        </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('Error cargando compras del cliente:', err);
    section.innerHTML = '<p class="text-red-600">Error cargando compras. Revisa la consola.</p>';
  }
}
