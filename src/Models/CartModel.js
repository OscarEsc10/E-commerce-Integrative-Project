// Models/CartItem.js
import { pool } from '../../Config/ConnectionToBd.js';

export class CartItem {
  // Obtener todos los items del carrito de un usuario
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

  // Crear un item en el carrito para el usuario
  static async create({ user_id, ebook_id, quantity }) {
    const query = `
      INSERT INTO cart_items (user_id, ebook_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [user_id, ebook_id, quantity]);
    return rows[0];
  }

  // Actualizar la cantidad de un item del carrito, solo si pertenece al usuario
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

  // Eliminar un item del carrito, solo si pertenece al usuario
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
