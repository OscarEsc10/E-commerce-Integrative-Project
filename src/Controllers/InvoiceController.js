// Controllers/InvoiceController.js
import { Invoice } from '../Models/Invoice.js';
import { Order } from '../Models/Orders.js';

export const InvoiceController = {
  create: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { order_id } = req.body;

      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      if (!order_id) return res.status(400).json({ success: false, message: 'Falta order_id' });

      const order = await Order.findById(order_id);
      if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

      const invoice = await Invoice.create({
        order_id,
        user_id,
        total: order.total
      });

      res.status(201).json({ success: true, invoice });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creando factura', error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const invoices = await Invoice.findByUserId(user_id);
      res.json({ success: true, invoices });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error obteniendo facturas', error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findById(id);
      if (!invoice) return res.status(404).json({ success: false, message: 'Factura no encontrada' });
      res.json({ success: true, invoice });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error obteniendo factura', error: error.message });
    }
  }
};
