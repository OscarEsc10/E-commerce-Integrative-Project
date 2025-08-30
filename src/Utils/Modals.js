
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const modalCloseBtn = document.getElementById("modal-close");

// Abrir modal con contenido dinámico
export function openModal(contentHTML) {
  modalContent.innerHTML = contentHTML;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Cerrar modal
export function closeModal() {
  modalContent.innerHTML = ""; // limpiar contenido
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

// Mostrar mensaje de error reutilizable
export function showError(message) {
  openModal(`
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">${message}</span>
    </div>
  `);
}

// Mostrar mensaje de éxito reutilizable
export function showSuccess(message) {
  openModal(`
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
      <strong class="font-bold">Éxito:</strong>
      <span class="block sm:inline">${message}</span>
    </div>
  `);
}

// Listeners de cierre
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}
