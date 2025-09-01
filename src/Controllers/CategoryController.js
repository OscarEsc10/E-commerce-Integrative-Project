import { Category } from '../Models/Category.js';

/**
 * CategoryController
 * Handles CRUD operations for product categories.
 * Provides methods to create, read, update, and delete categories.
 */
export const CategoryController = {
  /**
   * Create a new category
   * @route POST /categories
   * @param {Object} req - Express request object containing category data in req.body
   * @param {Object} res - Express response object
   */
  create: async (req, res) => {
    try {
      // Create a new category using the request body data
      const category = await Category.create(req.body);
      res.status(201).json({ success: true, category });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get all categories
   * @route GET /categories
   */
  getAll: async (req, res) => {
    // Fetch all categories from the database
    const categories = await Category.findAll();
    res.json({ success: true, categories });
  },

  /**
   * Get a category by its ID
   * @route GET /categories/:id
   */
  getById: async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  },

  /**
   * Update an existing category
   * @route PUT /categories/:id
   */
  update: async (req, res) => {
    const category = await Category.update(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  },

  /**
   * Delete a category by its ID
   * @route DELETE /categories/:id
   */
  delete: async (req, res) => {
    const category = await Category.delete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  }
};
