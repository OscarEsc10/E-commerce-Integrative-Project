import { CartItem } from '../Models/CartModel.js';

export const CartController = {
  getAll: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const items = await CartItem.getAllByUser(userId);
      res.json({ success: true, items });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener carrito' });
    }
  },

  add: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { ebook_id, quantity } = req.body;

      if (!ebook_id || !quantity) {
        return res.status(400).json({ success: false, message: 'Faltan parámetros' });
      }

      const existing = await CartItem.getByUserAndEbook(userId, ebook_id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        const updated = await CartItem.update(existing.cart_item_id, { quantity: newQty });
        return res.json({ success: true, item: updated });
      }

      const item = await CartItem.create({ user_id: userId, ebook_id, quantity });
      res.status(201).json({ success: true, item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al agregar al carrito' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Cantidad inválida' });
      }

      const updated = await CartItem.update(id, { quantity });
      if (!updated) return res.status(404).json({ success: false, message: 'Item no encontrado' });

      res.json({ success: true, item: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar carrito' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await CartItem.delete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Item no encontrado' });
      res.json({ success: true, message: 'Item eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar item' });
    }
  },

  clear: async (req, res) => {
    try {
      const userId = req.user.user_id;
      await CartItem.clearByUser(userId);
      res.json({ success: true, message: 'Carrito vaciado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al vaciar carrito' });
    }
  }
};
