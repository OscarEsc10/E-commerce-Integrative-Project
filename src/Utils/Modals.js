// src/Utils/Modals.js
// Utility functions for opening and closing modals, and displaying error/success messages

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const modalCloseBtn = document.getElementById("modal-close");

/**
 * Open modal with dynamic HTML content
 * @param {string} contentHTML - HTML to display inside the modal
 */
export function openModal(contentHTML) {
  modalContent.innerHTML = contentHTML;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

/**
 * Close modal and clear its content
 */
export function closeModal() {
  modalContent.innerHTML = "";
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

/**
 * Show reusable error message in modal
 * @param {string} message - Error message to display
 */
export function showError(message) {
  openModal(`
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">${message}</span>
    </div>
  `);
}

/**
 * Show reusable success message in modal
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
  openModal(`
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
      <strong class="font-bold">Success:</strong>
      <span class="block sm:inline">${message}</span>
    </div>
  `);
}

// Close modal when close button is clicked
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeModal);
}

// Close modal when clicking outside modal content
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}
