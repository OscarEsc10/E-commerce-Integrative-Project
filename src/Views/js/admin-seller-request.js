import { apiClient } from "./api.js";

const tbody = document.getElementById("seller-requests-tbody");

async function renderManageSellers() {
  const section = document.getElementById("sellers-section");
  section.innerHTML = `<h3 class="text-2xl font-bold mb-4">Solicitudes de Vendedor</h3>`;

  try {
    // Llamada al método de apiClient
    const requests = await apiClient.getSellerRequests();

    if (!requests || requests.length === 0) {
      section.innerHTML += `<p class="text-gray-600">No hay solicitudes pendientes.</p>`;
      return;
    }

    section.innerHTML += `
      <ul class="divide-y divide-gray-200">
        ${requests
          .map(
            (req) => `
          <li class="py-4 flex justify-between items-center">
            <div>
              <p><strong>ID:</strong> ${req.request_id}</p>
              <p><strong>Usuario:</strong> ${req.user_id}</p>
              <p><strong>Negocio:</strong> ${req.business_name}</p>
              <p><strong>Documento:</strong> ${req.document_id}</p>
              <p><strong>Descripción:</strong> ${req.description || "—"}</p>
              <p><strong>Estado:</strong> ${req.status || "pendiente"}</p>
            </div>
            <div class="space-x-2">
              <button class="approve-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" data-id="${
                req.id
              }">Aprobar</button>
              <button class="reject-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" data-id="${
                req.id
              }">Rechazar</button>
            </div>
          </li>
        `
          )
          .join("")}
      </ul>
    `;

    // Eventos aprobar/rechazar
    section.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await apiClient.updateSellerRequestStatus(btn.dataset.id, "approved");
        renderManageSellers(); // refrescar vista
      });
    });
    section.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await apiClient.updateSellerRequestStatus(btn.dataset.id, "rejected");
        renderManageSellers(); // refrescar vista
      });
    });
  } catch (err) {
    console.error("Error cargando solicitudes:", err);
    section.innerHTML += `<p class="text-red-600">No se pudieron cargar las solicitudes.</p>`;
  }
}

export { renderManageSellers };
