/**
 * Seller Request View Logic
 * Handles the submission of seller requests by customers, including validation and API call.
 */
import { apiClient } from './api.js';
import { authManager } from './auth.js';

const form = document.getElementById('seller-request-form');

/**
 * Add submit event listener to the seller request form.
 * Validates input and sends request to backend.
 */
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = authManager.getUserData();
    if (!user) return alert('You must be logged in to submit a request.');

    const business_name = document.getElementById('business_name').value.trim();
    const document_id = document.getElementById('document_id').value.trim();

    if (!business_name || !document_id) return alert('All fields are required.');

    try {
      await apiClient.createSellerRequest({
        user_id: user.id,
        business_name,
        document_id,
        sr_status_id: 1  // PENDING
      });

      alert('Request submitted successfully.');
      form.reset();
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Could not submit the request.');
    }
  });
}
