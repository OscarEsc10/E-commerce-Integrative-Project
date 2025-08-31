import { authManager } from './auth.js';
import { escapeHtml } from './helpers.js';
import { apiClient } from './api.js';

const ordersSectionId = 'seller-orders-section';
const ordersContentId = 'seller-orders-content';

export async function renderSellerOrders() {
  const user = authManager.getUserData();
  if (!user) {
    alert('Usuario no identificado.');
    return;
  }

  const section = document.getElementById(ordersSectionId);
  if (!section) return;

  section.classList.remove('hidden');

  let content = document.getElementById(ordersContentId);
  if (!content) {
    content = document.createElement('div');
    content.id = ordersContentId;
    section.appendChild(content);
  }

  content.innerHTML = '<p>Cargando pedidos...</p>';

  try {
    const data = await apiClient.makeRequest(`/api/orders/seller/${user.id}`, { method: 'GET' });
    const orders = Array.isArray(data?.orders) ? data.orders : [];

    if (!orders.length) {
      content.innerHTML = '<p>No hay pedidos para tus libros.</p>';
      return;
    }

    const rowsHtml = orders.map(o => {
      const name = escapeHtml(o.ebook_name ?? 'Sin título');
      const total = Number(o.total ?? 0);
      const date = o.created_at ? new Date(o.created_at).toLocaleDateString('es-ES') : '-';
      const status = o.status_id; // opcional: mapear a texto
      return `
        <tr>
          <td>${name}</td>
          <td>$${total.toFixed(2)}</td>
          <td>${status}</td>
          <td>${date}</td>
        </tr>
      `;
    }).join('');

    content.innerHTML = `
      <h3>Pedidos de tus libros</h3>
      <table>
        <thead>
          <tr>
            <th>Ebook</th>
            <th>Total</th>
            <th>Status</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error(err);
    content.innerHTML = '<p>Error cargando pedidos.</p>';
  }
}
