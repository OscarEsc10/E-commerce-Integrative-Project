// Controllers/PaymentController.js
import { Payment } from '../Models/Payments.js';
import { Order } from '../Models/Orders.js';

export const PaymentController = {
    create: async (req, res) => {
      try {
        const user_id = req.user?.user_id;
        const { order_id, method } = req.body;

        if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        if (!order_id || !method) return res.status(400).json({ success: false, message: 'Faltan datos' });

        const order = await Order.findById(order_id);
        if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

        const payment = await Payment.create({
          order_id,
          method,
          amount: order.total
        });

        res.status(201).json({ success: true, payment });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error creando pago', error: error.message });
      }
    },

    updateStatus: async (req, res) => {
      try {
        const { id } = req.params;
        const { pstatus_id } = req.body;
        if (!pstatus_id) return res.status(400).json({ success: false, message: 'Falta pstatus_id' });

        const payment = await Payment.updateStatus(id, pstatus_id);

        // Actualizar estado de la orden si el pago fue completado
        if (pstatus_id === 1) { // SOLD
          await Order.updateStatus(payment.order_id, 2); // 2 = PAID
        }

        res.json({ success: true, payment });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error actualizando pago', error: error.message });
      }
    },

    getByOrder: async (req, res) => {
      try {
        const { order_id } = req.params;
        const payment = await Payment.findByOrderId(order_id);
        if (!payment) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
        res.json({ success: true, payment });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error obteniendo pago', error: error.message });
      }
    },

    // Process payment with validation
    processPayment: async (req, res) => {
      try {
        const user_id = req.user?.user_id || req.user?.id;
        const { payment_method, card_number, expiry_date, cvv, cardholder_name, billing_address, items, total } = req.body;

        if (!user_id) {
          return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        // Validate payment credentials
        if (payment_method !== 'paypal') {
          if (!card_number || !expiry_date || !cvv || !cardholder_name) {
            return res.status(400).json({ success: false, message: 'Datos de tarjeta incompletos' });
          }

          // Basic card validation
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

        // Create order first
        const orderData = {
          user_id,
          items,
          total,
          status: 'pending'
        };

        const order = await Order.create(orderData);

        // Process payment (simulate payment processing)
        const paymentData = {
          order_id: order.order_id,
          method: payment_method,
          amount: total,
          card_last_four: payment_method !== 'paypal' ? card_number.slice(-4) : null,
          status: 'completed' // In real implementation, this would be pending until payment gateway confirms
        };

        const payment = await Payment.create(paymentData);

        // Update order status to paid
        await Order.updateStatus(order.order_id, 'paid');

        res.json({ 
          success: true, 
          message: 'Pago procesado exitosamente',
          payment_id: payment.payment_id,
          order_id: order.order_id
        });

      } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ success: false, message: 'Error procesando el pago', error: error.message });
      }
    },

    // Check payment status and availability
    getPaymentStatus: async (req, res) => {
      try {
        // In a real implementation, this would check with payment gateway
        // For now, we'll simulate that payment processing is enabled
        const paymentEnabled = process.env.PAYMENT_ENABLED !== 'false';
        
        res.json({ 
          success: true, 
          enabled: paymentEnabled,
          available_methods: ['credit_card', 'debit_card', 'paypal']
        });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error verificando estado de pagos', error: error.message });
      }
    }
  };
