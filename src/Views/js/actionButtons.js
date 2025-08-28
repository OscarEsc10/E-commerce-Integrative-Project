import { toggleProfileSection } from './profile.js';
import { logout, getUser } from './auth.js';

export function setupActionButtons() {
  const user = getUser();

  // Botón Convertirme en Vendedor
  const btnSellerRequest = document.getElementById('btnSellerRequest');
  if (btnSellerRequest) {
    btnSellerRequest.addEventListener('click', () => {
      alert('Funcionalidad en desarrollo');
    });

    // Mostrar solo si es customer
    if (user?.role_id === 3) btnSellerRequest.classList.remove('hidden');
  }

  // Botón Cerrar Sesión
  const logoutBtn = document.querySelector('button[onclick="logout()"]');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Botón Mi Perfil (navbar)
  const profileElements = [document.getElementById('userAvatar'), document.getElementById('userName')];
  profileElements.forEach(el => {
    if(el) el.addEventListener('click', toggleProfileSection);
  });

  // Botón Ebooks Manager
  const btnEbooks = document.getElementById('btnEbooks');
  if (btnEbooks) btnEbooks.addEventListener('click', () => {
    window.location.href = '/ebooks-dashboard.html';
  });
}
