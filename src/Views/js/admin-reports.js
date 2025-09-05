// src/Views/js/admin-reports.js
// Admin interface for viewing sales reports and statistics

import { authManager } from './auth.js';

/**
 * Render the admin sales reports section
 * Displays sales statistics and payment method breakdown
 */
export async function renderAdminReports() {
  const container = document.getElementById('reports-section');
  if (!container) {
    console.error("❌ No se encontró el div #reports-section en el DOM");
    return;
  }

  container.innerHTML = `
    <h3 class="text-2xl font-bold mb-4">📊 Reportes de Ventas</h3>
    <div id="reports-content" class="bg-white p-4 rounded-lg shadow">
      <p class="text-gray-600">Cargando estadísticas...</p>
    </div>
  `;

  try {
    // Usa el token desde authManager
    const token = authManager.getToken();
    console.log("🔑 Token usado en reports:", token);

    const resp = await fetch('/api/reports/sales-summary', {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!resp.ok) throw new Error("Error al obtener los reportes");
    const data = await resp.json();

    const el = document.getElementById('reports-content');
    el.innerHTML = `
      <ul class="space-y-2">
        <li><strong>Total de Facturas:</strong> ${data.invoices?.total_invoices ?? 0}</li>
        <li><strong>Total de Ventas:</strong> $${data.invoices?.total_sales ?? 0}</li>
        <li><strong>Ticket Promedio:</strong> $${Number(data.invoices?.avg_ticket ?? 0).toFixed(2)}.</li>
        <li><strong>Métodos de Pago:</strong> ${data.paymentMethods?.map(m => `${m.method} (${m.count})`).join(', ')}</li>
      </ul>
    `;
  } catch (err) {
    console.error('⚠️ Error cargando reportes:', err);
    document.getElementById('reports-content').innerHTML = `
      <p class="text-red-600">Error cargando reportes 🚨</p>
    `;
  }
}
