/**
 * Helper utility functions for the e-commerce frontend.
 * Includes HTML escaping, user ID/role extraction, and status class mapping.
 */

const ROLE_MAP = { 1: 'admin', 2: 'seller', 3: 'customer' };

/**
 * Escape HTML special characters in a string to prevent XSS.
 * @param {string} str - The string to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

/**
 * Get the user ID from a user object, supporting multiple property names.
 * @param {Object} user - The user object
 * @returns {string|number|null} User ID or null if not found
 */
export function getUserId(user) {
  return user?.user_id ?? user?.id ?? user?.userId ?? user?.uid ?? null;
}

/**
 * Get the role name from a user object, supporting multiple property names.
 * @param {Object} user - The user object
 * @returns {string} Role name (admin, seller, customer)
 */
export function getRoleFromUser(user) {
  if (!user) return 'customer';
  if (user.role) return String(user.role).toLowerCase();
  if (user.role_id) return ROLE_MAP[user.role_id] || String(user.role_id);
  return 'customer';
}

/**
 * Get the CSS class for a request status ID.
 * @param {number} sid - Status ID
 * @returns {string} CSS class for status
 */
export function requestStatusClass(sid) {
  if (!sid) return 'text-gray-600';
  if (sid === 1) return 'text-yellow-600 font-semibold';
  if (sid === 2) return 'text-green-600 font-semibold';
  if (sid === 3) return 'text-red-600 font-semibold';
  return 'text-gray-600';
}
