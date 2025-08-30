// Models/PaymentModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Payment {
  // Crear pago
  static async create({ order_id, method, amount }) {
    const query = `
      INSERT INTO payments (order_id, method, amount, pstatus_id, paid_at)
      VALUES ($1, $2, $3, 2, NULL) -- 2 = PENDING
      RETURNING *
    `;
    const { rows } = await pool.query(query, [order_id, method, amount]);
    return rows[0];
  }

  // Actualizar estado del pago
  static async updateStatus(payment_id, pstatus_id) {
    const query = `
      UPDATE payments
      SET pstatus_id = $1,
          paid_at = CASE WHEN $1 = 1 THEN NOW() ELSE NULL END -- 1 = SOLD
      WHERE payment_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [pstatus_id, payment_id]);
    return rows[0];
  }

  // Obtener pago por orden
  static async findByOrderId(order_id) {
    const query = `
      SELECT * FROM payments
      WHERE order_id = $1
    `;
    const { rows } = await pool.query(query, [order_id]);
    return rows[0] || null;
  }
}
