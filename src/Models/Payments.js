// Models/PaymentModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Payment {
  /**
   * Create a new payment record
   * @param {Object} data - Payment data
   * @param {number} data.order_id - The ID of the related order
   * @param {string} data.method - The payment method (e.g., credit card, PayPal)
   * @param {number} data.amount - The amount to be paid
   * @returns {Promise<Object>} The newly created payment record
   */
  static async create({ order_id, method, amount }) {
    const query = `
      INSERT INTO payments (order_id, method, amount, pstatus_id, paid_at)
      VALUES ($1, $2, $3, 2, NULL) -- 2 = PENDING status
      RETURNING *
    `;
    const { rows } = await pool.query(query, [order_id, method, amount]);
    return rows[0];
  }

  /**
   * Update the status of a payment
   * @param {number} payment_id - The ID of the payment
   * @param {number} pstatus_id - The new payment status ID
   *   - 1 = SOLD (paid successfully → set paid_at = NOW())
   *   - Other values → paid_at = NULL
   * @returns {Promise<Object>} The updated payment record
   */
  static async updateStatus(payment_id, pstatus_id) {
    const query = `
      UPDATE payments
      SET pstatus_id = $1,
          paid_at = CASE WHEN $1 = 1 THEN NOW() ELSE NULL END
      WHERE payment_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [pstatus_id, payment_id]);
    return rows[0];
  }

  /**
   * Find a payment by its associated order
   * @param {number} order_id - The ID of the related order
   * @returns {Promise<Object|null>} The payment record or null if not found
   */
  static async findByOrderId(order_id) {
    const query = `
      SELECT * FROM payments
      WHERE order_id = $1
    `;
    const { rows } = await pool.query(query, [order_id]);
    return rows[0] || null;
  }
}
