import { apiClient } from './api.js';
import { authManager } from './auth.js';
import { escapeHtml } from './helpers.js';

export async function renderCustomerOrders() {
  const user = authManager.getUserData();
  if (!user) return alert('Usuario no identificado');

  const section = document.getElementById('customer-orders-section');
  if (!section) return console.warn('No existe la sección de compras');
  section.classList.remove('hidden');
  section.innerHTML = '<p>Cargando órdenes...</p>';

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
        <td class="px-4 py-2 font-medium">${o.order_id}</td>
        <td class="px-4 py-2">
          <span class="px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(o.status_name)}">
            ${escapeHtml(o.status_name)}
          </span>
        </td>
        <td class="px-4 py-2">${new Date(o.created_at).toLocaleDateString()}</td>
        <td class="px-4 py-2 text-right font-semibold">$${Number(o.total).toFixed(2)}</td>
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
    console.error('Error cargando órdenes del cliente:', err);
    section.innerHTML = '<p class="text-red-600">Error cargando compras. Revisa la consola.</p>';
  }
}

// Función para colorear los estados
function getStatusColor(status) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'SHIPPED': return 'bg-blue-100 text-blue-800';
    case 'DELIVERED': return 'bg-gray-100 text-gray-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-50 text-gray-600';
  }
}
