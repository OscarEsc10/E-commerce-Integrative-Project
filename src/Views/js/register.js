/**
 * Register View Logic
 * Handles user registration, password validation, form submission, and feedback alerts.
 */
class RegisterManager {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api/auth';
        /**
         * Initialize registration logic and UI elements.
         */
        this.init();
    }

    /**
     * Initialize UI elements and event listeners for registration.
     */
    init() {
        this.initializeElements();
        this.setupPasswordValidation();
        this.setupFormSubmission();
    }

    /**
     * Get references to DOM elements used in registration.
     */
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

    /**
     * Set up password validation feedback for requirements.
     */
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

    /**
     * Set up form submission event listener for registration.
     */
    setupFormSubmission() {
        if (!this.registerForm) return;

        this.registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegistration(e);
        });
    }

    /**
     * Handle registration form submission, validation, and API call.
     * @param {Event} e - The form submit event
     */
    async handleRegistration(e) {
        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            role_id: 3 // all users register as "customer"
        };

        const confirmPassword = formData.get('confirmPassword');
        if (registerData.password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'error');
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
                
                this.showAlert('Account created successfully. Redirecting...', 'success');
                
                // Immediate redirect
                window.location.href = '/dashboard';
            } else {
                if (result.errors && result.errors.length > 0) {
                    const errorMessages = result.errors.map(err => err.msg).join('<br>');
                    this.showAlert(errorMessages, 'error');
                } else {
                    this.showAlert(result.message || 'Registration error', 'error');
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('Connection error. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Set loading state for the registration form and button.
     * @param {boolean} isLoading - Whether to show loading state
     */
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

    /**
     * Show an alert message in the registration view.
     * @param {string} message - The message to display
     * @param {string} type - The type of alert ('error' or 'success')
     */
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

// Initialize RegisterManager when DOM is loaded
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterManager();
});
