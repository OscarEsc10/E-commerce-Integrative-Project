import { Ebook } from '../Models/Ebook.js';
import { PaginationService } from '../Services/PaginationService.js';

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
  },

  // Paginated ebooks with search
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const searchTerm = req.query.search || '';
      const category = req.query.category || '';

      const result = await PaginationService.paginateEbooks({ page, limit, searchTerm, category });
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Search ebooks across all pages
  search: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const searchTerm = req.query.q || '';

      if (!searchTerm) {
        return res.status(400).json({ success: false, message: "Search term is required" });
      }

      const result = await PaginationService.paginateEbooks({ page, limit, searchTerm });
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
