import { SellerRequestModel } from '../Models/sellerRequestModel.js';

/**
 * Controller for handling seller request operations.
 * Provides methods to retrieve, create, update, and delete seller requests.
 */
export const SellerRequestController = {
  /**
   * Fetch all seller requests from the database.
   * @route GET /seller-requests
   */
  async getAll(req, res) {
    try {
      const requests = await SellerRequestModel.getAll();
      res.json({ success: true, data: requests });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Fetch all seller requests associated with a specific user.
   * @route GET /seller-requests/user/:userId
   * @param {string} req.params.userId - The ID of the user
   */
  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const requests = await SellerRequestModel.getByUser(userId);
      res.json({ success: true, data: requests });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Create a new seller request in the database.
   * @route POST /seller-requests
   * @param {string} req.body.user_id - The ID of the user making the request
   * @param {string} req.body.business_name - The name of the business
   * @param {string} req.body.document_id - The ID document of the seller
   * @param {string} req.body.description - Additional request description
   */
  async create(req, res) {
    try {
      const { user_id, business_name, document_id, description } = req.body;
      const newRequest = await SellerRequestModel.create(
        user_id,
        business_name,
        document_id,
        description
      );
      res.json({ success: true, data: newRequest });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Update the status of a specific seller request.
   * @route PATCH /seller-requests/:id/status
   * @param {string} req.params.id - The ID of the seller request
   * @param {string} req.body.sr_status_id - The new status ID to assign
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { sr_status_id } = req.body;
      const updated = await SellerRequestModel.updateStatus(id, sr_status_id);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * Delete a seller request from the database.
   * @route DELETE /seller-requests/:id
   * @param {string} req.params.id - The ID of the seller request to delete
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await SellerRequestModel.delete(id);
      res.json({ success: true, message: "Request deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
