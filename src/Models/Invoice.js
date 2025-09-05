// Models/InvoiceModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Invoice {
  /**
   * Create a new invoice
   * @param {Object} param0 - The invoice data
   * @param {number} param0.order_id - The related order ID
   * @param {number} param0.user_id - The user who owns the invoice
   * @param {number} param0.total - The total amount of the invoice
   * @returns {Promise<Object>} The created invoice
   */
  static async create({ order_id, user_id, total }) {
    const query = `
      INSERT INTO invoices (order_id, user_id, total, issued_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const { rows } = await pool.query(query, [order_id, user_id, total]);
    return rows[0]; // Return the newly created invoice
  }

  /**
   * Get all invoices of a specific user
   * @param {number} user_id - The user ID
   * @returns {Promise<Array>} A list of invoices belonging to the user
   */
  static async findByUserId(user_id) {
    const query = `
      SELECT * FROM invoices
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows; // Return all invoices for the given user
  }

  /**
   * Find a specific invoice by its ID
   * @param {number} invoice_id - The invoice ID
   * @returns {Promise<Object|null>} The invoice object or null if not found
   */
  static async findById(invoice_id) {
    const query = `
      SELECT * FROM invoices
      WHERE invoice_id = $1
    `;
    const { rows } = await pool.query(query, [invoice_id]);
    return rows[0] || null; // Return the invoice or null
  }
}
