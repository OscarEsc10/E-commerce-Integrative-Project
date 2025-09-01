// Controllers/InvoiceController.js
import { Invoice } from '../Models/Invoice.js';
import { Order } from '../Models/Orders.js';

/**
 * InvoiceController
 * Handles operations related to invoices, such as creation and retrieval.
 * Invoices are tied to user orders and include total amounts.
 */
export const InvoiceController = {
  /**
   * Create a new invoice for an order
   * @route POST /invoices
   * @param {Object} req - Express request object containing user_id and order_id
   * @param {Object} res - Express response object
   */
  create: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { order_id } = req.body;

      // Validate authentication
      if (!user_id) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      // Validate required data
      if (!order_id) {
        return res.status(400).json({ success: false, message: 'Falta order_id' });
      }

      // Ensure order exists
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      // Create invoice using order data
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

  /**
   * Get all invoices for the authenticated user
   * @route GET /invoices
   */
  getAll: async (req, res) => {
    try {
      const user_id = req.user?.user_id;

      // Fetch invoices tied to the authenticated user
      const invoices = await Invoice.findByUserId(user_id);
      res.json({ success: true, invoices });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error obteniendo facturas', error: error.message });
    }
  },

  /**
   * Get a single invoice by its ID
   * @route GET /invoices/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      // Look up invoice by its primary key
      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Factura no encontrada' });
      }

      res.json({ success: true, invoice });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error obteniendo factura', error: error.message });
    }
  }
};
