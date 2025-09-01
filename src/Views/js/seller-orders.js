/**
 * Seller Orders View Logic
 * Renders the list of orders for the logged-in seller, including status, date, and total.
 * Uses apiClient to fetch orders and displays them in a table format.
 */
import { apiClient } from './api.js';
import { authManager } from './auth.js';
import { escapeHtml } from './helpers.js';

/**
 * Render the orders for the current seller in the orders section.
 */
export async function renderSellerOrders() {
  const user = authManager.getUserData();
  if (!user) return alert('User not identified');

  const section = document.getElementById('orders-section');
  section.classList.remove('hidden');
  section.innerHTML = '<p>Loading orders...</p>';

  try {
    const user = authManager.getUserData();
    const sellerId = user?.user_id;
    const data = await apiClient.makeRequest(`/orders/seller`, { method: 'GET' });
    const orders = data?.orders || [];

    if (!orders.length) {
    section.innerHTML = '<p>You have no registered orders 🚀</p>';
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
    <h3 class="text-2xl font-bold mb-4">My Orders</h3>
  <div class="overflow-x-auto">
    <table class="min-w-full border rounded-lg overflow-hidden text-left">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2">ID</th>
          <th class="px-4 py-2">Status</th>
      <th class="px-4 py-2">Date</th>
          <th class="px-4 py-2">Total</th>
        </tr>
      </thead>
      <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  } catch (err) {
  console.error('Error loading seller orders:', err);
  section.innerHTML = '<p>Error loading orders. Check the console.</p>';
  }
}
