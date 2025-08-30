import { pool } from '../../Config/ConnectionToBd.js';

export const SellerRequestModel = {
  async getAll() {
    const result = await pool.query(`
      SELECT r.request_id, r.user_id, r.business_name, r.document_id, s.name as status
      FROM seller_requests r
      JOIN seller_request_status s ON r.sr_status_id = s.sr_status_id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  },

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

  async create(userId, businessName, documentId, description) {
    const result = await pool.query(`
      INSERT INTO seller_requests (user_id, business_name, document_id, description, sr_status_id)
      VALUES ($1, $2, $3,  $4, 1) RETURNING *
    `, [userId, businessName, documentId, description]); // 1 = PENDING
    return result.rows[0];
  },

  async updateStatus(requestId, statusId) {
    const result = await pool.query(`
      UPDATE seller_requests
      SET sr_status_id = $1
      WHERE request_id = $2
      RETURNING *
    `, [statusId, requestId]);
    return result.rows[0];
  },

  async delete(requestId) {
    await pool.query(`DELETE FROM seller_requests WHERE request_id = $1`, [requestId]);
    return { message: "Solicitud eliminada" };
  }
};
