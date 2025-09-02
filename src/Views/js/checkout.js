// js/checkout.js
import { authManager } from './auth.js';
import { apiClient } from './api.js';
import { cartManager } from './CartManager.js';

class CheckoutManager {
  constructor() {
    this.orderItems = [];
    this.total = 0;
    this.init();
  }

  async init() {
    try {
      // Remove auth requirement since we allow guest checkout
      // if (!authManager.requireAuth()) return;

      // Load cart items from URL params or localStorage
      this.loadOrderItems();
      this.setupEventListeners();
      this.renderOrderSummary();
      this.setupCardFormatting();
    } catch (err) {
      console.error('Checkout init error:', err);
      this.showError('Error al inicializar checkout');
    }
  }

  loadOrderItems() {
    // Load items from localStorage (set by catalog purchase)
    const checkoutData = localStorage.getItem('checkoutData');
    if (checkoutData) {
      try {
        const data = JSON.parse(checkoutData);
        this.orderItems = data.items || [];
        localStorage.removeItem('checkoutData'); // Clear after loading
      } catch (err) {
        console.error('Error parsing checkout data:', err);
        this.orderItems = [];
      }
    } else {
      // Fallback to cart items
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      this.orderItems = cart;
    }

    // Fallback to cart items
    if (!this.orderItems.length) {
      this.orderItems = cartManager.getCartItems();
    }

    // Calculate total
    this.total = this.orderItems.reduce((sum, item) => 
      sum + ((item.ebook_price || item.price || 0) * item.quantity), 0);
  }

  renderOrderSummary() {
    const container = document.getElementById('orderItems');
    const totalEl = document.getElementById('orderTotal');

    if (!container || !totalEl) return;

    if (this.orderItems.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No hay items en la orden</p>';
      totalEl.textContent = '$0.00';
      return;
    }

    container.innerHTML = this.orderItems.map(item => `
      <div class="flex justify-between items-center py-2 border-b">
        <div class="flex-1">
          <h4 class="font-medium">${item.ebook_name || item.name || 'Ebook'}</h4>
          <p class="text-sm text-gray-500">Cantidad: ${item.quantity}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold">$${((item.ebook_price || item.price || 0) * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    `).join('');

    totalEl.textContent = `$${this.total.toFixed(2)}`;
  }

  setupEventListeners() {
    const backBtn = document.getElementById('btn-back');
    const checkoutForm = document.getElementById('checkoutForm');
    const paymentMethod = document.getElementById('paymentMethod');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = '/catalog';
      });
    }

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.processPayment();
      });
    }

    if (paymentMethod) {
      paymentMethod.addEventListener('change', (e) => {
        this.togglePaymentFields(e.target.value);
      });
      // Initialize with default selection
      this.togglePaymentFields(paymentMethod.value);
    }
  }


  setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    if (cardNumber) {
      cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
        if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
        e.target.value = formattedValue;
      });
    }

    if (expiryDate) {
      expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
          value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
      });
    }

    if (cvv) {
      cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
    }
  }

  async processPayment() {
    try {
      const formData = this.getFormData();
      if (!this.validateForm(formData)) return;

      this.showLoading(true);
      
      // Check if payment processing is enabled in backend
      const paymentStatus = await this.checkPaymentStatus();
      if (!paymentStatus.enabled) {
        this.showError('El procesamiento de pagos está temporalmente deshabilitado');
        this.showLoading(false);
        return;
      }
      
      // Build payment data based on method
      let paymentData = {
        payment_method: formData.paymentMethod,
        billing_address: formData.billingAddress,
        items: this.orderItems,
        total: this.total,
        user_id: authManager.getUserData()?.user_id || authManager.getUserData()?.id || 'guest'
      };

      // Add method-specific data
      switch(formData.paymentMethod) {
        case 'credit_card':
        case 'debit_card':
          paymentData = {
            ...paymentData,
            card_number: formData.cardNumber,
            expiry_date: formData.expiryDate,
            cvv: formData.cvv,
            cardholder_name: formData.cardholderName
          };
          break;
        case 'nequi':
          paymentData = {
            ...paymentData,
            nequi_phone: formData.nequiPhone,
            nequi_pin: formData.nequiPin
          };
          break;
        case 'paypal':
          // PayPal will handle its own flow
          break;
      }

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.showSuccess('¡Pago procesado exitosamente!');
        // Clear cart and redirect
        localStorage.removeItem('cart');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        this.showError(result.message || 'Error al procesar el pago');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      this.showError('Error de conexión al procesar el pago');
    } finally {
      this.showLoading(false);
    }
  }
  
  async checkPaymentStatus() {
    try {
      const response = await fetch('/api/payments/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error checking payment status:', err);
      return { enabled: false };
    }
  }

  validateForm(formData) {
    const paymentMethod = formData.paymentMethod;
    
    // Validate billing address for all methods
    if (!formData.billingAddress.address.trim()) {
      alert('Por favor ingresa la dirección de facturación');
      return false;
    }
    
    if (!formData.billingAddress.city.trim()) {
      alert('Por favor ingresa la ciudad');
      return false;
    }
    
    switch(paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
          alert('Por favor ingresa un número de tarjeta válido');
          return false;
        }
        if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
          alert('Por favor ingresa una fecha de expiración válida (MM/YY)');
          return false;
        }
        if (!formData.cvv || formData.cvv.length < 3) {
          alert('Por favor ingresa un CVV válido');
          return false;
        }
        if (!formData.cardholderName.trim()) {
          alert('Por favor ingresa el nombre del titular de la tarjeta');
          return false;
        }
        break;
        
      case 'nequi':
        if (!formData.nequiPhone || !/^3\d{9}$/.test(formData.nequiPhone)) {
          alert('Por favor ingresa un número de teléfono Nequi válido (debe empezar con 3)');
          return false;
        }
        if (!formData.nequiPin || formData.nequiPin.length !== 4) {
          alert('Por favor ingresa un PIN Nequi válido (4 dígitos)');
          return false;
        }
        break;
        
      case 'paypal':
        // PayPal validation will be handled by PayPal itself
        break;
        
      default:
        alert('Por favor selecciona un método de pago válido');
        return false;
    }

    return true;
  }

  togglePaymentFields(method) {
    const cardInfo = document.getElementById('cardInfo');
    const nequiInfo = document.getElementById('nequiInfo');
    const paypalInfo = document.getElementById('paypalInfo');
    const paymentIcon = document.getElementById('paymentIcon');
    const paymentText = document.getElementById('paymentText');

    // Hide all payment sections
    cardInfo.classList.add('hidden');
    nequiInfo.classList.add('hidden');
    paypalInfo.classList.add('hidden');

    // Show relevant section and update button
    switch(method) {
      case 'credit_card':
      case 'debit_card':
        cardInfo.classList.remove('hidden');
        paymentIcon.className = 'fas fa-credit-card mr-2';
        paymentText.textContent = 'Procesar Pago';
        break;
      case 'nequi':
        nequiInfo.classList.remove('hidden');
        paymentIcon.className = 'fas fa-mobile-alt mr-2';
        paymentText.textContent = 'Pagar con Nequi';
        break;
      case 'paypal':
        paypalInfo.classList.remove('hidden');
        paymentIcon.className = 'fab fa-paypal mr-2';
        paymentText.textContent = 'Pagar con PayPal';
        break;
    }
  }

  getFormData() {
    const method = document.getElementById('paymentMethod').value;
    const baseData = {
      paymentMethod: method,
      billingAddress: {
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value
      }
    };

    switch(method) {
      case 'credit_card':
      case 'debit_card':
        return {
          ...baseData,
          cardNumber: document.getElementById('cardNumber').value,
          expiryDate: document.getElementById('expiryDate').value,
          cvv: document.getElementById('cvv').value,
          cardholderName: document.getElementById('cardName').value
        };
      case 'nequi':
        return {
          ...baseData,
          nequiPhone: document.getElementById('nequiPhone').value,
          nequiPin: document.getElementById('nequiPin').value
        };
      case 'paypal':
        return baseData;
      default:
        return baseData;
    }
  }

  showSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.classList.toggle('hidden', !show);
    }
  }

  showError(message) {
    alert(message);
  }
}

// Initialize checkout
new CheckoutManager();
