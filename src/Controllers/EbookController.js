import { Ebook } from '../Models/Ebook.js';

export const EbookController = {
  create: async (req, res) => {
    try {
      const ebook = await Ebook.create(req.body);
      res.status(201).json({ success: true, ebook });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const ebooks = await Ebook.findAll();
      res.json({ success: true, ebooks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const ebook = await Ebook.findById(req.params.id);
      if(!ebook) return res.status(404).json({ success: false, message: "Ebook not found" });
      res.json({ success: true, ebook });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const ebook = await Ebook.update(req.params.id, req.body);
      if(!ebook) return res.status(404).json({ success: false, message: "Ebook not found or no valid fields" });
      res.json({ success: true, ebook });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const ebook = await Ebook.delete(req.params.id);
      if(!ebook) return res.status(404).json({ success: false, message: "Ebook not found" });
      res.json({ success: true, message: "Ebook deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
