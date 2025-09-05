import { CartItem } from '../Models/CartModel.js';

/**
 * CartController
 * Handles shopping cart operations for authenticated users.
 * Provides methods to retrieve, create, update, and delete cart items.
 */
export const CartController = {
  /**
   * Get all items in the authenticated user's cart
   */
  getAll: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        // User is not authenticated
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Fetch all items for the given user
      const items = await CartItem.findByUserId(user_id);
      res.json({ success: true, items });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
    }
  },

  /**
   * Add a new item to the authenticated user's cart
   */
  create: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { ebook_id, quantity } = req.body;

      if (!user_id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      if (!ebook_id || !quantity) {
        return res.status(400).json({ success: false, message: 'Missing data' });
      }

      // Create a new cart item
      const item = await CartItem.create({ user_id, ebook_id, quantity });
      res.status(201).json({ success: true, item });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error adding item', error: error.message });
    }
  },

  /**
   * Update the quantity of an existing item in the user's cart
   */
  update: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { id } = req.params;
      const { quantity } = req.body;

      if (!user_id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      if (!quantity) {
        return res.status(400).json({ success: false, message: 'Quantity is required' });
      }

      // Ensure the item belongs to the user before updating
      const item = await CartItem.update(id, quantity, user_id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      res.json({ success: true, item });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating item', error: error.message });
    }
  },

  /**
   * Delete an item from the user's cart
   */
  delete: async (req, res) => {
    try {
      const user_id = req.user?.user_id;
      const { id } = req.params;

      if (!user_id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Only delete the item if it belongs to the authenticated user
      const deleted = await CartItem.delete(id, user_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting item', error: error.message });
    }
  }
};
