// src/Views/js/seller-sales.js
import { authManager } from './auth.js';
import { getUserId, escapeHtml } from './helpers.js';
import { apiClient } from './api.js';

const salesSectionId = 'sales-summary-section';
const salesContentId = 'sales-summary-content';

export async function renderSellerSalesSummary() {
  const user = authManager.getUserData();
  if (!user) {
    alert('Usuario no identificado.');
    throw new Error('Usuario no logueado');
  }

  const userId = getUserId(user);

  const section = document.getElementById(salesSectionId);
  if (!section) return console.warn('No existe sección de ventas');
  section.classList.remove('hidden');

  let content = document.getElementById(salesContentId);
  if (!content) {
    content = document.createElement('div');
    content.id = salesContentId;
    section.appendChild(content);
  }

  content.innerHTML = '<p class="text-gray-600">Cargando ventas...</p>';

  try {
    const res = await apiClient.makeRequest(`/reports/sales/user/${userId}`, { method: 'GET' });
    const sales = Array.isArray(res?.sales) ? res.sales : [];

    if (!sales.length) {
      content.innerHTML = `<p class="text-gray-600">No hay ventas registradas 🚀</p>`;
      return;
    }

    let totalRevenue = 0;
    const rowsHtml = sales.map(s => {
      const name = escapeHtml(s.ebook_name ?? s.name ?? 'Sin título');
      const qty = Number(s.quantity ?? 1);
      const price = Number(s.price ?? s.unit_price ?? 0);
      const subtotal = qty * price;
      totalRevenue += subtotal;
      const date = s.date ? new Date(s.date).toLocaleDateString('es-ES') : '-';
      return `
        <tr class="border-b">
          <td class="px-4 py-2">${name}</td>
          <td class="px-4 py-2 text-center">${qty}</td>
          <td class="px-4 py-2 text-right">$${price.toFixed(2)}</td>
          <td class="px-4 py-2 text-right">$${subtotal.toFixed(2)}</td>
          <td class="px-4 py-2">${date}</td>
        </tr>
      `;
    }).join('');

    content.innerHTML = `
      <h3 class="text-xl font-bold mb-4">Resumen de Ventas</h3>
      <table class="w-full text-left border rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2">Ebook</th>
            <th class="px-4 py-2">Cantidad</th>
            <th class="px-4 py-2 text-right">Precio Unit.</th>
            <th class="px-4 py-2 text-right">Subtotal</th>
            <th class="px-4 py-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot class="bg-gray-50 font-semibold">
          <tr>
            <td colspan="3" class="px-4 py-2 text-right">Total:</td>
            <td class="px-4 py-2 text-right">$${totalRevenue.toFixed(2)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  } catch (err) {
    console.error('Error cargando ventas del seller:', err);
    content.innerHTML = `<p class="text-red-600">Error cargando ventas. Revisa la consola.</p>`;
  }
}
