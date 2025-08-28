import { pool } from '../../Config/ConnectionToBd.js';

export class CartItem {
  static async getAllByUser(user_id) {
    const { rows } = await pool.query(
      `SELECT ci.cart_item_id, ci.user_id, ci.ebook_id, ci.quantity, ci.added_at,
              e.name AS ebook_name, e.price
       FROM cart_items ci
       JOIN ebooks e ON ci.ebook_id = e.ebook_id
       WHERE ci.user_id = $1
       ORDER BY ci.added_at DESC`,
      [user_id]
    );
    return rows;
  }

  static async getByUserAndEbook(user_id, ebook_id) {
    const { rows } = await pool.query(
      `SELECT * FROM cart_items WHERE user_id = $1 AND ebook_id = $2`,
      [user_id, ebook_id]
    );
    return rows[0];
  }

  static async create({ user_id, ebook_id, quantity }) {
    const { rows } = await pool.query(
      `INSERT INTO cart_items (user_id, ebook_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, ebook_id, quantity]
    );
    return rows[0];
  }

  static async update(cart_item_id, { quantity }) {
    const { rows } = await pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 RETURNING *`,
      [quantity, cart_item_id]
    );
    return rows[0];
  }

  static async delete(cart_item_id) {
    const { rowCount } = await pool.query(
      `DELETE FROM cart_items WHERE cart_item_id = $1`,
      [cart_item_id]
    );
    return rowCount > 0;
  }

  static async clearByUser(user_id) {
    await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [user_id]);
  }
}
