// src/Views/admin/js/admin-orders.js
import { apiClient } from './api.js';

export async function renderAdminOrders() {
  const section = document.getElementById('orders-section');
  if (!section) return;

  section.innerHTML = `<h2 class="text-xl font-bold mb-4">Gestión de Pedidos</h2>
    <div id="orders-table"></div>`;

  try {
    // 🔹 Traer todas las órdenes (solo admin)
    const resp = await apiClient.makeRequest('/orders/admin/all', { method: 'GET' });
    const orders = resp?.orders || [];

    if (!orders.length) {
      section.innerHTML += `<p>No hay pedidos registrados.</p>`;
      return;
    }

    // 🔹 Construir tabla
    let table = `<table class="table-auto w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-2 py-1">ID</th>
          <th class="border px-2 py-1">Usuario</th>
          <th class="border px-2 py-1">Total</th>
          <th class="border px-2 py-1">Estado</th>
          <th class="border px-2 py-1">Fecha</th>
          <th class="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>`;

    for (const o of orders) {
      table += `
        <tr>
          <td class="border px-2 py-1">${o.order_id}</td>
          <td class="border px-2 py-1">${o.user_id}</td>
          <td class="border px-2 py-1">$${o.total}</td>
          <td class="border px-2 py-1">${buildStatusOptions(o.status_id)}</td>
          <td class="border px-2 py-1">${new Date(o.created_at).toLocaleString()}</td>
          <td class="border px-2 py-1">
            <button class="btn-detail bg-blue-500 text-white px-2 py-1 rounded" data-id="${o.order_id}">Ver detalle</button>
            <button class="btn-update bg-green-500 text-white px-2 py-1 rounded mt-1" data-id="${o.order_id}">Actualizar</button>
          </td>
        </tr>`;
    }

    table += `</tbody></table>`;
    document.getElementById('orders-table').innerHTML = table;

    // 🔹 Eventos para detalle
    document.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await showOrderDetail(id);
      });
    });

    // 🔹 Eventos para actualizar estado
    document.querySelectorAll('.btn-update').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const select = e.target.closest('tr').querySelector('.status-select');
        const nuevo = select.value;

        await apiClient.makeRequest(`/orders/admin/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status_id: nuevo })
        });

        await renderAdminOrders(); // recargar tabla
      });
    });

  } catch (err) {
    section.innerHTML += `<p class="text-red-500">Error cargando pedidos: ${err.message}</p>`;
  }
}

// 🔹 Mapear estados
function buildStatusOptions(current) {
  const statuses = [
    { id: 1, name: 'PENDING' },
    { id: 2, name: 'PAID' },
    { id: 3, name: 'SHIPPED' },
    { id: 4, name: 'DELIVERED' },
    { id: 5, name: 'CANCELLED' }
  ];
  return `
    <select class="status-select border rounded px-1 py-0.5">
      ${statuses.map(s => `
        <option value="${s.id}" ${s.id == current ? 'selected' : ''}>${s.name}</option>
      `).join('')}
    </select>
  `;
}

// 🔹 Mostrar detalle de pedido
async function showOrderDetail(orderId) {
  try {
    const resp = await apiClient.makeRequest(`/orders/${orderId}`, { method: 'GET' });
    const order = resp?.order;
    if (!order) return alert('Orden no encontrada');

    let detail = `Detalle de Orden #${order.order_id}\n\n`;
    for (const item of order.items) {
      detail += `Producto: ${item.product_id} | Cantidad: ${item.quantity} | Precio: $${item.price}\n`;
    }

    alert(detail); // luego se puede mejorar con modal bonito
  } catch (err) {
    alert('Error cargando detalle: ' + err.message);
  }
}
