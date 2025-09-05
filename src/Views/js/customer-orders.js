/**
 * Customer Orders View Logic
 * Renders the list of orders for the logged-in customer, including status, date, and total.
 * Uses apiClient to fetch orders and displays them in a table format.
 */
import { apiClient } from './api.js';
import { authManager } from './auth.js';
import { escapeHtml } from './helpers.js';

/**
 * Render the orders for the current customer in the orders section.
 */
export async function renderCustomerOrders() {
  const user = authManager.getUserData();
  if (!user) return alert('User not identified');

  const section = document.getElementById('customer-orders-section');
  if (!section) return console.warn('Orders section does not exist');
  section.classList.remove('hidden');
  section.innerHTML = '<p>Loading orders...</p>';

  try {
    const userId = user.user_id;
    const data = await apiClient.makeRequest(`/api/orders/customer`, { method: 'GET' });
    const orders = data?.orders || [];

    if (!orders.length) {
      section.innerHTML = '<p>You have no registered purchases 🚀</p>';
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
      <h3 class="text-xl font-bold mb-4">My Purchases</h3>
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
    console.error('Error loading customer orders:', err);
    section.innerHTML = '<p class="text-red-600">Error loading purchases. Check the console.</p>';
  }
}

/**
 * Get the color classes for the order status badge.
 * @param {string} status - The status name of the order
 * @returns {string} CSS classes for the badge color
 */
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
