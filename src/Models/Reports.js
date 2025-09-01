// Models/ReportModel.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Report {
  /**
   * Retrieves overall sales summary:
   * - Total invoices
   * - Total sales amount
   * - Average ticket value
   */
  static async getSalesSummary() {
    const { rows } = await pool.query(`
      SELECT 
        COUNT(*) AS total_invoices,       -- Count of all invoices
        SUM(total::numeric) AS total_sales, -- Sum of all invoice totals
        AVG(total::numeric) AS avg_ticket  -- Average invoice value
      FROM invoices
    `);
    return rows[0]; // Return the first row (summary values)
  }

  /**
   * Retrieves payment counts grouped by their status.
   * Example: Pending, Completed, Failed, etc.
   */
  static async getPaymentStatus() {
    const { rows } = await pool.query(`
      SELECT pstatus_id, COUNT(*) AS count  -- Group by payment status ID
      FROM payments
      GROUP BY pstatus_id
    `);
    return rows; // Array of status + count
  }

  /**
   * Retrieves payment counts grouped by payment method.
   * Example: Credit card, Cash, PayPal, etc.
   */
  static async getPaymentMethods() {
    const { rows } = await pool.query(`
      SELECT method, COUNT(*) AS count   -- Group by payment method
      FROM payments
      GROUP BY method
    `);
    return rows; // Array of method + count
  }

  /**
   * Retrieves monthly sales totals.
   * Groups sales by year-month from the invoice issue date.
   */
  static async getMonthlySales() {
    const { rows } = await pool.query(`
      SELECT TO_CHAR(issued_at, 'YYYY-MM') AS month,  -- Extract year and month
             SUM(total::numeric) AS total            -- Total sales for that month
      FROM invoices
      GROUP BY month
      ORDER BY month ASC  -- Chronological order
    `);
    return rows; // Array of { month, total }
  }

  /**
   * Retrieves all invoices created by a specific user.
   * Ordered by issue date (latest first).
   * @param {number} userId - The ID of the user
   */
  static async getSalesByUser(userId) {
    const { rows } = await pool.query(`
      SELECT *
      FROM invoices
      WHERE user_id = $1               -- Filter by user ID
      ORDER BY issued_at DESC          -- Show latest invoices first
    `, [userId]);

    return rows; // Array of invoices belonging to the user
  }
}
