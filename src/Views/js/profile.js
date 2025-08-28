import { getUser, logout } from './auth.js';

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
    console.error('Error cargando perfil:', error);
    logout(); // opcional, si hay error auth
  }
}

function updateProfileDisplay(user) {
  const profileInfo = document.getElementById('profileInfo');
  const roleColors = {1:'bg-red-500',2:'bg-green-500',3:'bg-blue-500'};
  const roleClass = roleColors[user.role_id] || 'bg-gray-500';

  profileInfo.innerHTML = `
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Nombre Completo:</label>
      <span class="text-gray-600">${user.name}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Email:</label>
      <span class="text-gray-600">${user.email}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Teléfono:</label>
      <span class="text-gray-600">${user.phone || 'No especificado'}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Rol:</label>
      <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${roleClass}">${user.role_id}</span>
    </div>
    <div class="bg-gray-50 p-4 rounded-lg">
      <label class="block font-semibold text-gray-700 mb-2">Fecha de Registro:</label>
      <span class="text-gray-600">${new Date(user.created_at).toLocaleDateString('es-ES')}</span>
    </div>
  `;
}

function showNavbarUser(user) {
  if(user.name) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('welcomeMessage').textContent = `Bienvenido, ${user.name}`;
  }
  if(user.role_id === 3) document.getElementById('btnSellerRequest').classList.remove('hidden');
}

export function toggleProfileSection() {
  document.getElementById('profileSection').classList.toggle('hidden');
}
