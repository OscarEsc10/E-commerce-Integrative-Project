// Controllers/OrderController.js
import { Order } from '../Models/Orders.js';
import { CartItem } from '../Models/CartModel.js';

/**
 * OrderController
 * Handles customer and admin operations for orders.
 * Supports creating orders from cart, retrieving orders, updating status, and
 * filtering orders by seller or customer.
 */
export const OrderController = {
  /**
   * Create a new order from the authenticated user's cart.
   * - Validates authentication and address_id
   * - Retrieves cart items
   * - Calculates total price
   * - Creates order and clears cart
   *
   * @route POST /orders
   */
  create: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { address_id } = req.body;

      if (!user_id) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }
      if (!address_id) {
        return res.status(400).json({ success: false, message: 'Falta address_id' });
      }

      // Get all cart items for the user
      const cartItems = await CartItem.findByUserId(user_id);
      if (!cartItems.length) {
        return res.status(400).json({ success: false, message: 'Carrito vacío' });
      }

      // Calculate total order amount
      const total = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.ebook_price) * item.quantity,
        0
      );

      // Create order with items from cart
      const order = await Order.create({
        user_id,
        address_id,
        total,
        status: 1, // default: pending/new
        items: cartItems.map(ci => ({
          product_id: ci.ebook_id,
          quantity: ci.quantity,
          price: ci.ebook_price
        }))
      });

      // Optional: clear the cart after creating order
      for (const item of cartItems) {
        await CartItem.delete(item.cart_item_id, user_id);
      }

      res.status(201).json({ success: true, order });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creando orden',
        error: error.message
      });
    }
  },

  /**
   * Get all orders for the authenticated user (customer view).
   * @route GET /orders
   */
  getAll: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const orders = await Order.findByUserId(user_id);
      res.json({ success: true, orders });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo órdenes',
        error: error.message
      });
    }
  },

  /**
   * Get a specific order by ID.
   * @route GET /orders/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }
      res.json({ success: true, order });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo orden',
        error: error.message
      });
    }
  },

  // ================= Admin handlers =================

  /**
   * Admin: Get all orders in the system.
   * @route GET /admin/orders
   */
  getAllAdmin: async (req, res) => {
    try {
      const orders = await Order.findAll();
      res.json({ success: true, orders });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo todas las órdenes',
        error: error.message
      });
    }
  },

  /**
   * Admin: Update the status of an order.
   * @route PATCH /admin/orders/:id/status
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status_id } = req.body;

      const order = await Order.updateStatus(id, status_id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      res.json({ success: true, order });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error actualizando orden',
        error: error.message
      });
    }
  },

  /**
   * Seller: Get all orders for ebooks created by the seller.
   * @route GET /seller/orders
   */
  getBySeller: async (req, res) => {
    try {
      const sellerId = req.user?.user_id;
      if (!sellerId) {
        return res.status(400).json({ success: false, message: 'Falta sellerId' });
      }

      const orders = await Order.findByCreatorId(sellerId);
      res.json({ success: true, orders });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo órdenes del seller',
        error: err.message
      });
    }
  },

  /**
   * Customer: Get all orders for the authenticated user.
   * (Alias for getAll but explicitly named for clarity.)
   * @route GET /customer/orders
   */
  getByCustomer: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      console.log('getByCustomer - user_id:', user_id);
      console.log('getByCustomer - req.user:', req.user);
      
      if (!user_id) {
        return res.status(400).json({ success: false, message: 'Falta customerId' });
      }

      const orders = await Order.findByUserId(user_id);
      console.log('getByCustomer - orders found:', orders);
      res.json({ success: true, orders });
    } catch (error) {
      console.error('getByCustomer - Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo órdenes del cliente',
        error: error.message
      });
    }
  }
};
