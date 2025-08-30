import { SellerRequestModel } from '../Models/sellerRequestModel.js';

export const SellerRequestController = {
  async getAll(req, res) {
    try {
      const requests = await SellerRequestModel.getAll();
      res.json({ success: true, data: requests });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const requests = await SellerRequestModel.getByUser(userId);
      res.json({ success: true, data: requests });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req, res) {
    try {
      const { user_id, business_name, document_id, description } = req.body;
      const newRequest = await SellerRequestModel.create(user_id, business_name, document_id, description);
      res.json({ success: true, data: newRequest });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

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

  async delete(req, res) {
    try {
      const { id } = req.params;
      await SellerRequestModel.delete(id);
      res.json({ success: true, message: "Solicitud eliminada correctamente" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
