// Models/OrderModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Order {
  /**
   * Create a new order along with its items
   * Uses a transaction to ensure both the order and its items are created atomically.
   * If something fails, the transaction is rolled back.
   * 
   * @param {Object} param0 - Order details
   * @param {number} param0.user_id - The ID of the user placing the order
   * @param {number} param0.address_id - The shipping/billing address ID
   * @param {number} param0.total - The total price of the order
   * @param {Array} param0.items - List of items in the order
   * @returns {Promise<Object>} The created order and its items
   */
  static async create({ user_id, address_id, total, items }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert into orders with default status = 1 (PENDING)
      const orderQuery = `
        INSERT INTO orders (user_id, address_id, total, status, created_at)
        VALUES ($1, $2, $3, 1, NOW())
        RETURNING *
      `;
      const { rows } = await client.query(orderQuery, [user_id, address_id, total]);
      const order = rows[0];

      // Insert items into order_items
      const insertItemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const createdItems = [];
      for (const item of items) {
        const { rows: itemRows } = await client.query(insertItemQuery, [
          order.order_id,
          item.product_id,
          item.quantity,
          item.price
        ]);
        createdItems.push(itemRows[0]);
      }

      await client.query('COMMIT');
      return { order, items: createdItems };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all orders for a specific user
   * Joins with order status for better readability.
   * 
   * @param {number} user_id - The user ID
   * @returns {Promise<Array>} List of orders with their statuses
   */
  static async findByUserId(user_id) {
    const query = `
      SELECT o.*, s.name AS status_name
      FROM orders o
      JOIN orders_status s ON o.status = s.orderstatus_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  /**
   * Get a single order by ID, including its items
   * 
   * @param {number} order_id - The order ID
   * @returns {Promise<Object|null>} The order with items, or null if not found
   */
  static async findById(order_id) {
    const orderQuery = `SELECT * FROM orders WHERE order_id = $1`;
    const itemsQuery = `SELECT * FROM order_items WHERE order_id = $1`;

    const { rows: orderRows } = await pool.query(orderQuery, [order_id]);
    if (!orderRows.length) return null;

    const { rows: itemsRows } = await pool.query(itemsQuery, [order_id]);

    return { ...orderRows[0], items: itemsRows };
  }

  /**
   * Update the status of an order (first version, not used anymore)
   * ⚠️ This method is overridden below with a better implementation.
   * 
   * @deprecated Use the second updateStatus instead
   */
  static async updateStatus(order_id, status) {
    const query = `
      UPDATE orders
      SET status = $1
      WHERE order_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, order_id]);
    return rows[0];
  }

  /**
   * Get all orders (admin usage)
   * Useful for admin dashboards to monitor all orders.
   * 
   * @returns {Promise<Array>} List of all orders
   */
  static async findAll() {
    const query = `
      SELECT * FROM orders
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  /**
   * Update the status of an order by its ID
   * This is the correct version used by sellers/admins.
   * 
   * @param {number} order_id - The order ID
   * @param {number} status_id - The new status ID
   * @returns {Promise<Object>} The updated order
   */
  static async updateStatus(order_id, status_id) {
    const query = `
      UPDATE orders
      SET status = $1
      WHERE order_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status_id, order_id]);
    return rows[0];
  }

  /**
   * Find all orders that contain products created by a specific seller
   * 
   * @param {number} sellerId - The creator (seller) ID
   * @returns {Promise<Array>} List of orders with their statuses
   */
  static async findByCreatorId(sellerId) {
    const { rows } = await pool.query(`
      SELECT o.order_id, o.user_id, o.total, o.status, o.created_at, s.name AS status_name
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN ebooks e ON oi.product_id = e.ebook_id
      JOIN orders_status s ON o.status = s.orderstatus_id
      WHERE e.creator_id = $1
      GROUP BY o.order_id, s.name
      ORDER BY o.created_at DESC
    `, [sellerId]);
    return rows;
  }
}
