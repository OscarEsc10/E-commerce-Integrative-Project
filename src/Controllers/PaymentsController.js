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
    }
  };
