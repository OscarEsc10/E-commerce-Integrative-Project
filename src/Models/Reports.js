// Models/ReportModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Report {
  static async getSalesSummary() {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) AS total_invoices,
        SUM(total::numeric) AS total_sales,
        AVG(total::numeric) AS avg_ticket
      FROM invoices
    `);
    return rows[0];
  }

  static async getPaymentStatus() {
    const { rows } = await pool.query(`
      SELECT pstatus_id, COUNT(*) AS count
      FROM payments
      GROUP BY pstatus_id
    `);
    return rows;
  }

  static async getPaymentMethods() {
    const { rows } = await pool.query(`
      SELECT method, COUNT(*) AS count
      FROM payments
      GROUP BY method
    `);
    return rows;
  }

  static async getMonthlySales() {
    const { rows } = await pool.query(`
      SELECT TO_CHAR(issued_at, 'YYYY-MM') AS month, 
             SUM(total::numeric) AS total
      FROM invoices
      GROUP BY month
      ORDER BY month ASC
    `);
    return rows;
  }

  static async getSalesByUser(userId) {
    const { rows } = await pool.query(`
      SELECT *
      FROM invoices
      WHERE user_id = $1
      ORDER BY issued_at DESC
    `, [userId]);

    return rows;
  }
}
