// Controllers/PaymentController.js
import { Payment } from '../Models/Payments.js';
import { Order } from '../Models/Orders.js';

/**
 * PaymentController
 * Handles all payment-related operations:
 * - Creating payments
 * - Updating payment status
 * - Processing payments (with validation)
 * - Retrieving payment info by order
 * - Checking payment availability
 */
export const PaymentController = {
  /**
   * Create a new payment for an existing order.
   * Validates authentication and order existence.
   *
   * @route POST /payments
   */
  create: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { order_id, method } = req.body;

      if (!user_id) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }
      if (!order_id || !method) {
        return res.status(400).json({ success: false, message: 'Faltan datos' });
      }

      // Verify order exists
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      // Create payment linked to the order
      const payment = await Payment.create({
        order_id,
        method,
        amount: order.total
      });

      res.status(201).json({ success: true, payment });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creando pago',
        error: error.message
      });
    }
  },

  /**
   * Update the status of a payment.
   * If the payment is completed, updates order status to "PAID".
   *
   * @route PATCH /payments/:id/status
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { pstatus_id } = req.body;

      if (!pstatus_id) {
        return res.status(400).json({ success: false, message: 'Falta pstatus_id' });
      }

      const payment = await Payment.updateStatus(id, pstatus_id);

      // If payment was successful, mark the order as paid
      if (pstatus_id === 1) { // 1 = SOLD (completed)
        await Order.updateStatus(payment.order_id, 2); // 2 = PAID
      }

      res.json({ success: true, payment });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error actualizando pago',
        error: error.message
      });
    }
  },

  /**
   * Get payment information by order ID.
   *
   * @route GET /payments/order/:order_id
   */
  getByOrder: async (req, res) => {
    try {
      const { order_id } = req.params;
      const payment = await Payment.findByOrderId(order_id);

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Pago no encontrado' });
      }

      res.json({ success: true, payment });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo pago',
        error: error.message
      });
    }
  },

  /**
   * Process a new payment (simulation).
   * - Validates payment details (card/PayPal)
   * - Creates an order
   * - Creates a payment
   * - Updates order status to "paid"
   *
   * @route POST /payments/process
   */
  processPayment: async (req, res) => {
    try {
      const user_id = req.user?.user_id || req.user?.id;
      const {
        payment_method,
        card_number,
        expiry_date,
        cvv,
        cardholder_name,
        billing_address,
        items,
        total
      } = req.body;

      if (!user_id) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      // Validate card details if not PayPal
      if (payment_method !== 'paypal') {
        if (!card_number || !expiry_date || !cvv || !cardholder_name) {
          return res.status(400).json({ success: false, message: 'Datos de tarjeta incompletos' });
        }

        // Strip spaces from card number
        const cleanCardNumber = card_number.replace(/\s/g, '');

        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
          return res.status(400).json({ success: false, message: 'Número de tarjeta inválido' });
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry_date)) {
          return res.status(400).json({ success: false, message: 'Fecha de expiración inválida' });
        }

        if (!/^\d{3,4}$/.test(cvv)) {
          return res.status(400).json({ success: false, message: 'CVV inválido' });
        }
      }

      // Create order first (status = pending)
      const orderData = {
        user_id,
        items,
        total,
        status: 'pending'
      };

      const order = await Order.create(orderData);

      // Simulate payment processing
      const paymentData = {
        order_id: order.order_id,
        method: payment_method,
        amount: total,
        card_last_four: payment_method !== 'paypal' ? card_number.slice(-4) : null,
        status: 'completed' // In real scenario, wait for gateway confirmation
      };

      const payment = await Payment.create(paymentData);

      // Update order status to "paid"
      await Order.updateStatus(order.order_id, 'paid');

      res.json({
        success: true,
        message: 'Pago procesado exitosamente',
        payment_id: payment.payment_id,
        order_id: order.order_id
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando el pago',
        error: error.message
      });
    }
  },

  /**
   * Check payment system availability.
   * Simulates checking payment gateway status.
   *
   * @route GET /payments/status
   */
  getPaymentStatus: async (req, res) => {
    try {
      // Simulate payment gateway availability
      const paymentEnabled = process.env.PAYMENT_ENABLED !== 'false';

      res.json({
        success: true,
        enabled: paymentEnabled,
        available_methods: ['credit_card', 'debit_card', 'paypal']
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verificando estado de pagos',
        error: error.message
      });
    }
  }
};
