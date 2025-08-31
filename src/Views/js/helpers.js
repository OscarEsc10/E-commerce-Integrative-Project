// src/Views/js/utils.js

const ROLE_MAP = { 1: 'admin', 2: 'seller', 3: 'customer' };

export function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}

export function getUserId(user) {
  return user?.user_id ?? user?.id ?? user?.userId ?? user?.uid ?? null;
}

export function getRoleFromUser(user) {
  if (!user) return 'customer';
  if (user.role) return String(user.role).toLowerCase();
  if (user.role_id) return ROLE_MAP[user.role_id] || String(user.role_id);
  return 'customer';
}

export function requestStatusClass(sid) {
  if (!sid) return 'text-gray-600';
  if (sid === 1) return 'text-yellow-600 font-semibold';
  if (sid === 2) return 'text-green-600 font-semibold';
  if (sid === 3) return 'text-red-600 font-semibold';
  return 'text-gray-600';
}
