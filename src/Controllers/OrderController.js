  // Controllers/OrderController.js
  import { Order } from '../Models/Orders.js';
  import { CartItem } from '../Models/CartModel.js';

  export const OrderController = {
    // Crear orden a partir del carrito
    create: async (req, res) => {
      try {
        const user_id = req.user?.user_id;
        const { address_id } = req.body;

        if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        if (!address_id) return res.status(400).json({ success: false, message: 'Falta address_id' });

        // Obtener items del carrito
        const cartItems = await CartItem.findByUserId(user_id);
        if (!cartItems.length) return res.status(400).json({ success: false, message: 'Carrito vacío' });

        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.ebook_price) * item.quantity, 0);

        // Crear orden
        const order = await Order.create({
          user_id,
          address_id,
          total,
          status_id: 1,
          items: cartItems.map(ci => ({
            product_id: ci.ebook_id,
            quantity: ci.quantity,
            price: ci.ebook_price
          }))
        });

        // Opcional: vaciar carrito
        for (const item of cartItems) {
          await CartItem.delete(item.cart_item_id, user_id);
        }

        res.status(201).json({ success: true, order });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error creando orden', error: error.message });
      }
    },

    getAll: async (req, res) => {
      try {
        const user_id = req.user?.user_id;
        const orders = await Order.findByUserId(user_id);
        res.json({ success: true, orders });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error obteniendo órdenes', error: error.message });
      }
    },

    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        res.json({ success: true, order });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error obteniendo orden', error: error.message });
      }
    },

    //admin handtlers.

    getAllAdmin: async (req, res) => {
    try {
    const orders = await Order.findAll();
    res.json({ success: true, orders });
    } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo todas las órdenes', error: error.message });
    }
    },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status_id } = req.body;
      const order = await Order.updateStatus(id, status_id);
      if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      res.json({ success: true, order });
      } catch (error) {
      res.status(500).json({ success: false, message: 'Error actualizando orden', error: error.message });
    }
  },
  // Obtener órdenes de los libros de un seller
    getBySeller: async (req, res) => {
    try {
      const sellerId = req.user?.user_id;
      if (!sellerId) return res.status(400).json({ success: false, message: 'Falta sellerId' });

      const orders = await Order.findByCreatorId(sellerId); 
      res.json({ success: true, orders });
      } catch (err) {
      res.status(500).json({ success: false, message: 'Error obteniendo órdenes del seller', error: err.message });
    }
  }
};
