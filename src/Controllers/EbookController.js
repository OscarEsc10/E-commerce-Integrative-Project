import { Ebook } from '../Models/Ebook.js';
import { PaginationService } from '../Services/PaginationService.js';
import { pool } from '../../Config/ConnectionToBd.js';

/**
 * EbookController
 * Handles CRUD operations and advanced queries for ebooks,
 * including pagination, search, and filtering by condition.
 */
export const EbookController = {
  /**
   * Create a new ebook
   * @route POST /ebooks
   */
  create: async (req, res) => {
    try {
      const ebook = await Ebook.create(req.body);
      res.status(201).json({ success: true, ebook });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get all ebooks
   * @route GET /ebooks
   */
  getAll: async (req, res) => {
    try {
      const ebooks = await Ebook.findAll();
      res.json({ success: true, ebooks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get an ebook by its ID
   * @route GET /ebooks/:id
   */
  getById: async (req, res) => {
    try {
      const ebook = await Ebook.findById(req.params.id);
      if (!ebook) {
        return res.status(404).json({ success: false, message: "Ebook not found" });
      }
      res.json({ success: true, ebook });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Update an ebook
   * @route PUT /ebooks/:id
   */
  update: async (req, res) => {
    try {
      const ebook = await Ebook.update(req.params.id, req.body);
      if (!ebook) {
        return res.status(404).json({ success: false, message: "Ebook not found or no valid fields" });
      }
      res.json({ success: true, ebook });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Delete an ebook
   * @route DELETE /ebooks/:id
   */
  delete: async (req, res) => {
    try {
      const ebook = await Ebook.delete(req.params.id);
      if (!ebook) {
        return res.status(404).json({ success: false, message: "Ebook not found" });
      }
      res.json({ success: true, message: "Ebook deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Get paginated ebooks with optional search and category filter
   * @route GET /ebooks/paginated?page=&limit=&search=&category_id=
   */
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const searchTerm = req.query.search || '';
      const category_id = req.query.category_id || '';

      console.log('Pagination request:', { page, limit, searchTerm, category_id });

      // Import pool dynamically to avoid circular dependencies
      const { pool } = await import('../../Config/ConnectionToBd.js');
      const offset = (page - 1) * limit;

      // Build search conditions dynamically
      let searchCondition = '';
      let searchParams = [];
      let paramIndex = 1;
      const conditions = [];

      // Search by term across multiple fields
      if (searchTerm) {
        const searchConditions = ['e.name', 'e.description', 'c.name'].map(field => {
          searchParams.push(`%${searchTerm}%`);
          return `${field} ILIKE $${paramIndex++}`;
        });
        conditions.push(`(${searchConditions.join(' OR ')})`);
      }

      // Filter by category
      if (category_id) {
        searchParams.push(category_id);
        conditions.push(`e.category_id = $${paramIndex++}`);
      }

      if (conditions.length > 0) {
        searchCondition = `WHERE ${conditions.join(' AND ')}`;
      }

      // Count total items
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ebooks e
        LEFT JOIN categories c ON e.category_id = c.category_id
        ${searchCondition}
      `;
      const countResult = await pool.query(countQuery, searchParams);
      const total = parseInt(countResult.rows[0].total);

      // Fetch paginated items
      const dataQuery = `
        SELECT e.*, c.name as category_name
        FROM ebooks e
        LEFT JOIN categories c ON e.category_id = c.category_id
        ${searchCondition}
        ORDER BY e.ebook_id DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `;
      const dataParams = [...searchParams, limit, offset];
      const dataResult = await pool.query(dataQuery, dataParams);

      // Build pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const result = {
        data: dataResult.rows,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      };

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Pagination error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Search ebooks across all pages (global search)
   * @route GET /ebooks/search?q=
   */
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
  },

  /**
   * Get ebooks marked as "new"
   * @route GET /ebooks/new
   */
  getNew: async (req, res) => {
    try {
      const ebooks = await Ebook.findByCondition(1); // 1 = new
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error fetching new ebooks", err);
      res.json({ success: true, ebooks: [] });
    }
  },

  /**
   * Get ebooks marked as "used"
   * @route GET /ebooks/used
   */
  getUsed: async (req, res) => {
    try {
      const ebooks = await Ebook.findByCondition(2); // 2 = used
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error fetching used ebooks", err);
      res.json({ success: true, ebooks: [] });
    }
  },

  /**
   * Get ebooks marked as "donation"
   * @route GET /ebooks/donate
   */
  getDonate: async (req, res) => {
    try {
      const ebooks = await Ebook.findByCondition(3); // 3 = donate
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error fetching donation ebooks", err);
      res.json({ success: true, ebooks: [] });
    }
  },

  /**
   * Get ebooks by condition ID (new, used, donate, etc.)
   * @route GET /ebooks/condition/:condition_id
   */
  getByCondition: async (req, res) => {
    try {
      const { condition_id } = req.params;
      const ebooks = await Ebook.findByCondition(condition_id);
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error fetching ebooks by condition", err);
      res.json({ success: true, ebooks: [] });
    }
  }
};
