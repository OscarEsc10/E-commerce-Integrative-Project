// src/Views/js/ebooks-condition.js
import { apiClient } from './api.js';
import { escapeHtml } from './helpers.js';

export async function renderEbooksByCondition(conditionId, sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return console.warn('No existe la sección', sectionId);

  section.classList.remove('hidden');
  section.innerHTML = '<p>Cargando ebooks...</p>';

  try {
    const data = await apiClient.makeRequest(`/ebooks/condition/${conditionId}`, { method: 'GET' });
    const ebooks = data?.ebooks || [];

    if (!ebooks.length) {
      section.innerHTML = '<p>No hay ebooks disponibles 🚀</p>';
      return;
    }

    const cardsHtml = ebooks.map(e => `
      <div class="card border rounded p-4 shadow-md">
        <h3 class="font-bold">${escapeHtml(e.name)}</h3>
        <p>${escapeHtml(e.description || 'Sin descripción')}</p>
        <p>Precio: $${Number(e.price).toFixed(2)}</p>
      </div>
    `).join('');

    section.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cardsHtml}</div>`;
  } catch (err) {
    console.error('Error cargando ebooks por condición:', err);
    section.innerHTML = '<p>Error cargando ebooks. Revisa la consola.</p>';
  }
}
