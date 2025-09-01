// src/Views/js/admin-ebooks.js
// Admin interface for managing ebooks: create, edit, delete, and list ebooks

import { apiClient } from "./api.js";

/**
 * Render the admin ebooks management section
 * Displays a table of ebooks and a modal for adding/editing
 */
export async function renderAdminEbooks() {
  const container = document.getElementById("ebooks-section");
  if (!container) {
    console.error("❌ No se encontró el div #ebooks-section en el DOM");
    return;
  }

  // Render inicial
  container.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-2xl font-bold">📚 Gestión de Ebooks</h3>
      <button id="btn-add-ebook" class="bg-green-600 text-white px-3 py-1 rounded">➕ Agregar Ebook</button>
    </div>
    <div class="bg-white p-4 rounded-lg shadow overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200 text-sm">
            <th class="px-3 py-2">ID</th>
            <th class="px-3 py-2">Nombre</th>
            <th class="px-3 py-2">Descripción</th>
            <th class="px-3 py-2">Precio</th>
            <th class="px-3 py-2">Stock</th>
            <th class="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody id="ebooks-list">
          <tr><td colspan="6" class="text-center py-4">Cargando ebooks...</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div id="ebook-modal" class="fixed inset-0 hidden items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl w-96 p-6">
        <h2 id="modal-title" class="text-xl font-bold mb-4">Agregar Ebook</h2>
        <form id="ebook-form" class="space-y-3">
          <input type="hidden" id="ebook-id">

          <div>
            <label class="block text-sm">Nombre</label>
            <input id="ebook-name" type="text" class="w-full border rounded p-2">
          </div>

          <div>
            <label class="block text-sm">Descripción</label>
            <textarea id="ebook-description" class="w-full border rounded p-2"></textarea>
          </div>

          <div>
            <label class="block text-sm">Precio</label>
            <input id="ebook-price" type="number" step="0.01" class="w-full border rounded p-2">
          </div>

          <div>
            <label class="block text-sm">Stock</label>
            <input id="ebook-stock" type="number" class="w-full border rounded p-2">
          </div>

          <div class="flex justify-end space-x-2 pt-3">
            <button type="button" id="close-modal" class="bg-gray-400 text-white px-3 py-1 rounded">Cancelar</button>
            <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Cargar ebooks
  await loadEbooks();

  // Listeners principales
  document.getElementById("btn-add-ebook").addEventListener("click", () => openModal());
  document.getElementById("close-modal").addEventListener("click", closeModal);

  document.getElementById("ebook-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("ebook-id").value;
    const data = {
      name: document.getElementById("ebook-name").value,
      description: document.getElementById("ebook-description").value,
      price: parseFloat(document.getElementById("ebook-price").value),
      stock: parseInt(document.getElementById("ebook-stock").value, 10)
    };

    try {
      if (id) {
        await apiClient.updateEbook(id, data);
      } else {
        await apiClient.createEbook(data);
      }
      closeModal();
      await loadEbooks();
    } catch (err) {
      console.error("❌ Error guardando ebook:", err);
      alert("Error al guardar el ebook");
    }
  });
}

// ====================== Helpers ======================

/**
 * Load and render the list of ebooks in the table
 */
async function loadEbooks() {
  const listEl = document.getElementById("ebooks-list");
  try {
    const ebooks = await apiClient.getEbooks();
    if (!ebooks.length) {
      listEl.innerHTML = `<tr><td colspan="6" class="text-center py-4">No hay ebooks registrados</td></tr>`;
      return;
    }

    listEl.innerHTML = ebooks.map(e => `
      <tr class="border-b">
        <td class="px-3 py-2">${e.ebook_id}</td>
        <td class="px-3 py-2">${e.name}</td>
        <td class="px-3 py-2">${e.description || "—"}</td>
        <td class="px-3 py-2">$${parseFloat(e.price).toFixed(2)}</td>
        <td class="px-3 py-2">${e.stock}</td>
        <td class="px-3 py-2 space-x-2">
          <button class="btn-edit bg-blue-500 text-white px-2 py-1 rounded" data-id="${e.ebook_id}">✏️ Editar</button>
          <button class="btn-delete bg-red-500 text-white px-2 py-1 rounded" data-id="${e.ebook_id}">🗑️ Eliminar</button>
        </td>
      </tr>
    `).join("");

    // Listeners dinámicos
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", async () => {
        const ebook = await apiClient.getEbook(btn.dataset.id);
        openModal(ebook);
      });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (confirm("¿Seguro que deseas eliminar este ebook?")) {
          await apiClient.deleteEbook(btn.dataset.id);
          await loadEbooks();
        }
      });
    });

  } catch (err) {
    console.error("❌ Error cargando ebooks:", err);
    listEl.innerHTML = `<tr><td colspan="6" class="text-center text-red-600 py-4">Error cargando ebooks</td></tr>`;
  }
}

/**
 * Open the modal for adding or editing an ebook
 * @param {Object|null} ebook - Ebook data to edit, or null to add new
 */
function openModal(ebook = null) {
  document.getElementById("ebook-modal").classList.remove("hidden");
  document.getElementById("modal-title").textContent = ebook ? "Editar Ebook" : "Agregar Ebook";

  document.getElementById("ebook-id").value = ebook?.ebook_id || "";
  document.getElementById("ebook-name").value = ebook?.name || "";
  document.getElementById("ebook-description").value = ebook?.description || "";
  document.getElementById("ebook-price").value = ebook?.price || "";
  document.getElementById("ebook-stock").value = ebook?.stock || 0;
}

/**
 * Close the ebook modal
 */
function closeModal() {
  document.getElementById("ebook-modal").classList.add("hidden");
}
