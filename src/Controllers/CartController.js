import { CartItem } from '../Models/CartModel.js';

export const CartController = {
  getAll: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const items = await CartItem.findByUserId(user_id);
      res.json({ success: true, items });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener carrito', error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { ebook_id, quantity } = req.body;
      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      if (!ebook_id || !quantity) return res.status(400).json({ success: false, message: 'Faltan datos' });

      const item = await CartItem.create({ user_id, ebook_id, quantity });
      res.status(201).json({ success: true, item });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al agregar item', error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { id } = req.params;
      const { quantity } = req.body;
      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      if (!quantity) return res.status(400).json({ success: false, message: 'Falta quantity' });

      const item = await CartItem.update(id, quantity, user_id); // aseguramos que solo pueda actualizar sus items
      if (!item) return res.status(404).json({ success: false, message: 'Item no encontrado' });

      res.json({ success: true, item });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar item', error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { id } = req.params;
      if (!user_id) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const deleted = await CartItem.delete(id, user_id); // solo elimina si pertenece al usuario
      if (!deleted) return res.status(404).json({ success: false, message: 'Item no encontrado' });

      res.json({ success: true, message: 'Item eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar item', error: error.message });
    }
  }
};
