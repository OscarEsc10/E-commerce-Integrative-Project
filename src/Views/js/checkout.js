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
      if (!authManager.requireAuth()) return;

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
    // Try to get items from URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const itemsParam = urlParams.get('items');
    
    if (itemsParam) {
      try {
        this.orderItems = JSON.parse(decodeURIComponent(itemsParam));
      } catch (err) {
        console.error('Error parsing URL items:', err);
      }
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
        window.history.back();
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
        this.toggleCardInfo(e.target.value);
      });
    }
  }

  toggleCardInfo(paymentMethod) {
    const cardInfo = document.getElementById('cardInfo');
    if (cardInfo) {
      cardInfo.style.display = paymentMethod === 'paypal' ? 'none' : 'block';
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
      this.showSpinner(true);

      // Validate form
      if (!this.validateForm()) {
        this.showSpinner(false);
        return;
      }

      // Get form data
      const paymentData = this.getFormData();

      // Create order
      const orderData = {
        items: this.orderItems.map(item => ({
          ebook_id: item.ebook_id,
          quantity: item.quantity,
          price: item.ebook_price || item.price || 0
        })),
        total: this.total,
        payment_method: paymentData.paymentMethod,
        payment_details: paymentData
      };

      const response = await apiClient.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (response.success) {
        // Clear cart
        await cartManager.clearCart();
        
        // Show success and redirect
        alert(`¡Pago procesado exitosamente! Orden #${response.order?.order_id || 'N/A'}`);
        window.location.href = '/dashboard';
      } else {
        throw new Error(response.message || 'Error al procesar el pago');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Error al procesar el pago: ' + err.message);
    } finally {
      this.showSpinner(false);
    }
  }

  validateForm() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (paymentMethod !== 'paypal') {
      const cardNumber = document.getElementById('cardNumber').value;
      const expiryDate = document.getElementById('expiryDate').value;
      const cvv = document.getElementById('cvv').value;
      const cardName = document.getElementById('cardName').value;

      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
        alert('Por favor ingresa un número de tarjeta válido');
        return false;
      }

      if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        alert('Por favor ingresa una fecha de expiración válida (MM/YY)');
        return false;
      }

      if (!cvv || cvv.length < 3) {
        alert('Por favor ingresa un CVV válido');
        return false;
      }

      if (!cardName.trim()) {
        alert('Por favor ingresa el nombre en la tarjeta');
        return false;
      }
    }

    // Validate address
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zipCode = document.getElementById('zipCode').value;

    if (!address.trim() || !city.trim() || !zipCode.trim()) {
      alert('Por favor completa toda la información de dirección');
      return false;
    }

    return true;
  }

  getFormData() {
    return {
      paymentMethod: document.getElementById('paymentMethod').value,
      cardNumber: document.getElementById('cardNumber').value.replace(/\s/g, ''),
      expiryDate: document.getElementById('expiryDate').value,
      cvv: document.getElementById('cvv').value,
      cardName: document.getElementById('cardName').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      zipCode: document.getElementById('zipCode').value
    };
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
