/**
 * Profile View Logic
 * Handles loading and displaying user profile information, including role, registration date, and navbar user info.
 */
import { getUser, logout } from './auth.js';

/**
 * Load the user profile from the API and update the display.
 */
export async function loadUserProfile() {
  try {
    const result = await window.apiClient.getProfile();
    if(result.success) {
      const user = result.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      updateProfileDisplay(user);
      showNavbarUser(user);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    logout(); // optional, logout if auth error
  }
}

/**
 * Update the profile display section with user information.
 * @param {Object} user - The user object
 */
function updateProfileDisplay(user) {
  const profileInfo = document.getElementById('profileInfo');
  const roleColors = {1:'bg-red-500',2:'bg-green-500',3:'bg-blue-500'};
  const roleClass = roleColors[user.role_id] || 'bg-gray-500';

  profileInfo.innerHTML = `
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Full Name:</label>
      <span class="text-gray-600">${user.name}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Email:</label>
      <span class="text-gray-600">${user.email}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Phone:</label>
      <span class="text-gray-600">${user.phone || 'Not specified'}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Role:</label>
      <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${roleClass}">${user.role_id}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Registration Date:</label>
      <span class="text-gray-600">${new Date(user.created_at).toLocaleDateString('en-US')}</span>
    </div>
  `;
}

/**
 * Show user info in the navbar and handle seller request button visibility.
 * @param {Object} user - The user object
 */
function showNavbarUser(user) {
  if(user.name) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('welcomeMessage').textContent = `Welcome, ${user.name}`;
  }
  if(user.role_id === 3) document.getElementById('btnSellerRequest').classList.remove('hidden');
}

/**
 * Toggle the visibility of the profile section.
 */
export function toggleProfileSection() {
  document.getElementById('profileSection').classList.toggle('hidden');
}
