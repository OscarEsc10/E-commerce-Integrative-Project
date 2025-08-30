import { apiClient } from './api.js';
import { authManager } from './auth.js';

const form = document.getElementById('seller-request-form');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = authManager.getUserData();
    if (!user) return alert('Debes iniciar sesión para enviar una solicitud.');

    const business_name = document.getElementById('business_name').value.trim();
    const document_id = document.getElementById('document_id').value.trim();

    if (!business_name || !document_id) return alert('Todos los campos son obligatorios.');

    try {
      await apiClient.createSellerRequest({
        user_id: user.id,
        business_name,
        document_id,
        sr_status_id: 1  // PENDING
      });

      alert('Solicitud enviada correctamente.');
      form.reset();
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      alert('No se pudo enviar la solicitud.');
    }
  });
}
