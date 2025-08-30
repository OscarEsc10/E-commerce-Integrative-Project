// Models/InvoiceModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Invoice {
  // Crear factura
  static async create({ order_id, user_id, total }) {
    const query = `
      INSERT INTO invoices (order_id, user_id, total, issued_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const { rows } = await pool.query(query, [order_id, user_id, total]);
    return rows[0];
  }

  // Obtener todas las facturas de un usuario
  static async findByUserId(user_id) {
    const query = `
      SELECT * FROM invoices
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  // Obtener factura por ID
  static async findById(invoice_id) {
    const query = `
      SELECT * FROM invoices
      WHERE invoice_id = $1
    `;
    const { rows } = await pool.query(query, [invoice_id]);
    return rows[0] || null;
  }
}
