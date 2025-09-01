// Models/CartItem.js
import { pool } from '../../Config/ConnectionToBd.js';

/**
 * The CartItem model handles operations related to the user's shopping cart.
 * It interacts with the `cart_items` table and joins it with the `ebooks` table
 * to retrieve detailed information about each item.
 */
export class CartItem {
  /**
   * Retrieve all cart items belonging to a specific user.
   *
   * @param {number} user_id - The ID of the user.
   * @returns {Promise<Array>} - A list of cart items with ebook details.
   *
   * Example row structure:
   * {
   *   cart_item_id: 1,
   *   ebook_id: 5,
   *   quantity: 2,
   *   added_at: "2025-09-01T12:00:00Z",
   *   ebook_name: "JavaScript Basics",
   *   ebook_price: 19.99
   * }
   */
  static async findByUserId(user_id) {
    const query = `
      SELECT ci.cart_item_id, ci.ebook_id, ci.quantity, ci.added_at,
             e.name AS ebook_name, e.price AS ebook_price
      FROM cart_items ci
      LEFT JOIN ebooks e ON ci.ebook_id = e.ebook_id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  /**
   * Add a new item to the user's cart.
   *
   * @param {Object} params - The cart item details.
   * @param {number} params.user_id - The ID of the user.
   * @param {number} params.ebook_id - The ID of the ebook to add.
   * @param {number} params.quantity - The quantity of the ebook.
   * @returns {Promise<Object>} - The newly created cart item.
   */
  static async create({ user_id, ebook_id, quantity }) {
    const query = `
      INSERT INTO cart_items (user_id, ebook_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [user_id, ebook_id, quantity]);
    return rows[0];
  }

  /**
   * Update the quantity of a specific cart item,
   * but only if the item belongs to the given user.
   *
   * @param {number} cart_item_id - The ID of the cart item.
   * @param {number} quantity - The new quantity to set.
   * @param {number} user_id - The ID of the user (ownership check).
   * @returns {Promise<Object|null>} - The updated cart item, or null if not found/unauthorized.
   */
  static async update(cart_item_id, quantity, user_id) {
    const query = `
      UPDATE cart_items
      SET quantity = $1
      WHERE cart_item_id = $2 AND user_id = $3
      RETURNING *
    `;
    const { rows } = await pool.query(query, [quantity, cart_item_id, user_id]);
    return rows[0];
  }

  /**
   * Delete a specific cart item,
   * but only if the item belongs to the given user.
   *
   * @param {number} cart_item_id - The ID of the cart item.
   * @param {number} user_id - The ID of the user (ownership check).
   * @returns {Promise<Object|null>} - The deleted cart item, or null if not found/unauthorized.
   */
  static async delete(cart_item_id, user_id) {
    const query = `
      DELETE FROM cart_items
      WHERE cart_item_id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [cart_item_id, user_id]);
    return rows[0];
  }
}
