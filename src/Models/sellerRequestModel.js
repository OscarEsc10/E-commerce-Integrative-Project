import { pool } from '../../Config/ConnectionToBd.js';

/**
 * SellerRequestModel
 * Handles database operations for seller requests (CRUD).
 */
export const SellerRequestModel = {
  /**
   * Fetch all seller requests with their statuses.
   * @returns {Promise<Array>} List of seller requests with status details.
   */
  async getAll() {
    const result = await pool.query(`
      SELECT r.request_id, r.user_id, r.business_name, r.document_id, s.name as status
      FROM seller_requests r
      JOIN seller_request_status s ON r.sr_status_id = s.sr_status_id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  },

  /**
   * Fetch all seller requests for a specific user.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array>} Seller requests belonging to the user.
   */
  async getByUser(userId) {
    const result = await pool.query(`
      SELECT r.request_id, r.user_id, r.business_name, r.document_id, s.name as status
      FROM seller_requests r
      JOIN seller_request_status s ON r.sr_status_id = s.sr_status_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);
    return result.rows;
  },

  /**
   * Create a new seller request (default status = PENDING).
   * @param {number} userId - ID of the user submitting the request.
   * @param {string} businessName - Business name of the seller.
   * @param {string} documentId - Document identifier (e.g., tax ID).
   * @param {string} description - Description or notes for the request.
   * @returns {Promise<Object>} The newly created request.
   */
  async create(userId, businessName, documentId, description) {
    const result = await pool.query(`
      INSERT INTO seller_requests (user_id, business_name, document_id, description, sr_status_id)
      VALUES ($1, $2, $3, $4, 1) RETURNING *
    `, [userId, businessName, documentId, description]); // 1 = PENDING
    return result.rows[0];
  },

  /**
   * Update the status of a seller request.
   * @param {number} requestId - The ID of the request.
   * @param {number} statusId - The new status ID.
   * @returns {Promise<Object>} The updated request.
   */
  async updateStatus(requestId, statusId) {
    const result = await pool.query(`
      UPDATE seller_requests
      SET sr_status_id = $1
      WHERE request_id = $2
      RETURNING *
    `, [statusId, requestId]);
    return result.rows[0];
  },

  /**
   * Delete a seller request.
   * @param {number} requestId - The ID of the request to delete.
   * @returns {Promise<{message: string}>} Confirmation message.
   */
  async delete(requestId) {
    await pool.query(
      `DELETE FROM seller_requests WHERE request_id = $1`,
      [requestId]
    );
    return { message: "Request deleted successfully" };
  }
};
