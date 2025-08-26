import { Category } from '../Models/Category.js';

export const CategoryController = {
  create: async (req, res) => {
    try {
      const category = await Category.create(req.body);
      res.status(201).json({ success: true, category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    const categories = await Category.findAll();
    res.json({ success: true, categories });
  },

  getById: async (req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  },

  update: async (req, res) => {
    const category = await Category.update(req.params.id, req.body);
    if(!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  },

  delete: async (req, res) => {
    const category = await Category.delete(req.params.id);
    if(!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  }
};
