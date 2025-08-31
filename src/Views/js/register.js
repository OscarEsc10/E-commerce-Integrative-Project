// Register JavaScript Logic
class RegisterManager {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api/auth';
        this.init();
    }

    init() {
        this.initializeElements();
        this.setupPasswordValidation();
        this.setupFormSubmission();
    }

    initializeElements() {
        this.passwordInput = document.getElementById('password');
        this.requirements = {
            length: document.getElementById('req-length'),
            upper: document.getElementById('req-upper'),
            lower: document.getElementById('req-lower'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };
        this.registerForm = document.getElementById('registerForm');
        this.registerBtn = document.getElementById('registerBtn');
        this.loading = document.getElementById('loading');
        this.alertContainer = document.getElementById('alert-container');
    }

    setupPasswordValidation() {
        if (!this.passwordInput) return;

        this.passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            
            this.requirements.length.className = password.length >= 8 ? 'text-green-500' : 'text-red-500';
            this.requirements.upper.className = /[A-Z]/.test(password) ? 'text-green-500' : 'text-red-500';
            this.requirements.lower.className = /[a-z]/.test(password) ? 'text-green-500' : 'text-red-500';
            this.requirements.number.className = /\d/.test(password) ? 'text-green-500' : 'text-red-500';
            this.requirements.special.className = /[@$!%*?&]/.test(password) ? 'text-green-500' : 'text-red-500';
        });
    }

    setupFormSubmission() {
        if (!this.registerForm) return;

        this.registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegistration(e);
        });
    }

    async handleRegistration(e) {
        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            role_id: 3 // todos entran como "customer"
        };

        const confirmPassword = formData.get('confirmPassword');
        if (registerData.password !== confirmPassword) {
            this.showAlert('Las contraseñas no coinciden', 'error');
            return;
        }

        this.setLoadingState(true);

        try {
            const response = await fetch(`${this.API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('Registration successful, storing auth data:', result.data);
                
                // Use the same keys as authManager
                localStorage.setItem('jwt_token', result.data.token);
                localStorage.setItem('user_data', JSON.stringify(result.data.user));
                
                console.log('Token stored:', localStorage.getItem('jwt_token'));
                console.log('User data stored:', localStorage.getItem('user_data'));
                
                this.showAlert('Cuenta creada exitosamente. Redirigiendo...', 'success');
                
                // Immediate redirect
                window.location.href = '/dashboard';
            } else {
                if (result.errors && result.errors.length > 0) {
                    const errorMessages = result.errors.map(err => err.msg).join('<br>');
                    this.showAlert(errorMessages, 'error');
                } else {
                    this.showAlert(result.message || 'Error en el registro', 'error');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Error de conexión. Por favor, intenta de nuevo.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        if (this.registerBtn) {
            this.registerBtn.disabled = isLoading;
        }
        if (this.loading) {
            this.loading.classList.toggle('hidden', !isLoading);
        }
        if (isLoading && this.alertContainer) {
            this.alertContainer.innerHTML = '';
        }
    }

    showAlert(message, type) {
        if (!this.alertContainer) return;

        const bgColor = type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700';
        this.alertContainer.innerHTML = `
            <div class="p-3 rounded-lg border text-sm ${bgColor}">
                ${message}
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterManager();
});
