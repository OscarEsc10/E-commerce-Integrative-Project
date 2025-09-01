import { Ebook } from '../Models/Ebook.js';
import { PaginationService } from '../Services/PaginationService.js';
import { pool } from '../../Config/ConnectionToBd.js';

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
      const category_id = req.query.category_id || '';

      console.log('Pagination request:', { page, limit, searchTerm, category_id });

      // Import pool here to avoid circular dependency issues
      const { pool } = await import('../../Config/ConnectionToBd.js');
      const offset = (page - 1) * limit;
      
      // Build search condition
      let searchCondition = '';
      let searchParams = [];
      let paramIndex = 1;

      const conditions = [];

      // Add search condition if provided
      if (searchTerm) {
        const searchConditions = ['e.name', 'e.description', 'c.name'].map(field => {
          searchParams.push(`%${searchTerm}%`);
          return `${field} ILIKE $${paramIndex++}`;
        });
        conditions.push(`(${searchConditions.join(' OR ')})`);
      }

      // Add category filter if provided
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
      
      console.log('Count query:', countQuery, 'Params:', searchParams);
      const countResult = await pool.query(countQuery, searchParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated items
      const dataQuery = `
        SELECT e.*, c.name as category_name
        FROM ebooks e
        LEFT JOIN categories c ON e.category_id = c.category_id
        ${searchCondition}
        ORDER BY e.ebook_id DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `;

      const dataParams = [...searchParams, limit, offset];
      console.log('Data query:', dataQuery, 'Params:', dataParams);
      const dataResult = await pool.query(dataQuery, dataParams);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const result = {
        data: dataResult.rows,
        pagination: {
          currentPage: page,
          totalPages,
          total: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      };

      console.log('Pagination result:', result);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Pagination error:', error);
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
  },

  getNew: async (req, res) => {
    try {
      const ebooks = await Ebook.findByCondition(1); // 1 = new
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error al obtener ebooks nuevos", err);
      res.json({ success: true, ebooks: [] });
    }
  },

  getUsed: async (req, res) => {
    try {
      const ebooks = await Ebook.findByCondition(2); // 2 = used
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error al obtener ebooks usados", err);
      res.json({ success: true, ebooks: [] });
    }
  },

  getDonate: async (req, res) => {
    try {
      const ebooks = await Ebook.findByCondition(3); // 3 = donate
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error al obtener ebooks de donación", err);
      res.json({ success: true, ebooks: [] });
    }
  },

  getByCondition: async (req, res) => {
    try {
      const { condition_id } = req.params;
      const ebooks = await Ebook.findByCondition(condition_id);
      res.json({ success: true, ebooks: ebooks || [] });
    } catch (err) {
      console.error("Error al obtener ebooks por condición", err);
      res.json({ success: true, ebooks: [] });
    }
  }

};
