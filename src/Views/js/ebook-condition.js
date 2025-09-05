/**
 * Ebooks Condition View Logic
 * Renders a list of ebooks filtered by condition (e.g., new, used).
 * Uses apiClient to fetch ebooks and displays them as cards in a grid.
 */
import { apiClient } from './api.js';
import { escapeHtml } from './helpers.js';

/**
 * Render ebooks by a given condition in the specified section.
 * @param {number|string} conditionId - The ID of the condition to filter ebooks
 * @param {string} sectionId - The DOM element ID where ebooks will be rendered
 */
export async function renderEbooksByCondition(conditionId, sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return console.warn('Section does not exist', sectionId);

  section.classList.remove('hidden');
  section.innerHTML = '<p>Loading ebooks...</p>';

  try {
    const data = await apiClient.makeRequest(`/ebooks/condition/${conditionId}`, { method: 'GET' });
    const ebooks = data?.ebooks || [];

    if (!ebooks.length) {
      section.innerHTML = '<p>No ebooks available 🚀</p>';
      return;
    }

    const cardsHtml = ebooks.map(e => `
      <div class="card border rounded p-4 shadow-md">
        <h3 class="font-bold">${escapeHtml(e.name)}</h3>
        <p>${escapeHtml(e.description || 'No description')}</p>
        <p>Price: $${Number(e.price).toFixed(2)}</p>
      </div>
    `).join('');

    section.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cardsHtml}</div>`;
  } catch (err) {
    console.error('Error loading ebooks by condition:', err);
    section.innerHTML = '<p>Error loading ebooks. Check the console.</p>';
  }
}
