import { pool } from '../../Config/ConnectionToBd.js';

/**
 * Ebook Model
 * Handles database operations for the 'ebooks' table.
 */
export class Ebook {
  /**
   * Create a new ebook.
   * ⚠️ Note: `req.user.user_id` is referenced here, but `req` is not passed to this method. 
   * You should pass `creator_id` explicitly when calling this function.
   * 
   * @param {Object} data - Ebook data.
   * @param {string} data.name - The title of the ebook.
   * @param {number} data.category_id - The category ID the ebook belongs to.
   * @param {string} data.description - A short description of the ebook.
   * @param {number} data.price - The price of the ebook.
   * @param {number} [data.stock=0] - The stock quantity (default: 0).
   * @returns {Promise<Object>} The newly created ebook.
   */
  static async create({ name, category_id, description, price, stock = 0 }) {
    const query = `
      INSERT INTO ebooks (name, category_id, description, price, stock, creator_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [name, category_id, description, price, stock, req.user.user_id]; // ⚠️ Possible bug
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all ebooks with their category names.
   * @returns {Promise<Array>} List of all ebooks.
   */
  static async findAll() {
    const result = await pool.query(`
      SELECT e.*, c.name as category_name 
      FROM ebooks e
      LEFT JOIN categories c ON e.category_id = c.category_id
      ORDER BY ebook_id ASC
    `);
    return result.rows;
  }

  /**
   * Find an ebook by its ID.
   * @param {number} ebook_id - The ID of the ebook.
   * @returns {Promise<Object|null>} The ebook object, or null if not found.
   */
  static async findById(ebook_id) {
    const result = await pool.query(`
      SELECT e.*, c.name as category_name 
      FROM ebooks e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE ebook_id = $1
    `, [ebook_id]);
    return result.rows[0] || null;
  }

  /**
   * Update an ebook by its ID.
   * Supports partial updates (only provided fields will be updated).
   * @param {number} ebook_id - The ID of the ebook.
   * @param {Object} data - The new values for the ebook.
   * @param {string} [data.name] - The updated ebook name.
   * @param {number} [data.category_id] - The updated category ID.
   * @param {string} [data.description] - The updated description.
   * @param {number} [data.price] - The updated price.
   * @param {number} [data.stock] - The updated stock.
   * @returns {Promise<Object|null>} The updated ebook or null if no fields were provided.
   */
  static async update(ebook_id, { name, category_id, description, price, stock }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (category_id !== undefined) { fields.push(`category_id = $${paramIndex++}`); values.push(category_id); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${paramIndex++}`); values.push(price); }
    if (stock !== undefined) { fields.push(`stock = $${paramIndex++}`); values.push(stock); }

    if (fields.length === 0) return null;

    values.push(ebook_id);
    const query = `
      UPDATE ebooks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE ebook_id = $${paramIndex}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete an ebook by its ID.
   * @param {number} ebook_id - The ID of the ebook.
   * @returns {Promise<Object|null>} The deleted ebook or null if not found.
   */
  static async delete(ebook_id) {
    const result = await pool.query('DELETE FROM ebooks WHERE ebook_id = $1 RETURNING *', [ebook_id]);
    return result.rows[0] || null;
  }

  /**
   * Get ebooks with pagination and optional search term.
   * @param {Object} options - Pagination and search options.
   * @param {number} [options.page=1] - Current page number.
   * @param {number} [options.limit=10] - Number of items per page.
   * @param {string} [options.searchTerm=''] - Term to filter ebooks by name, description, or category.
   * @returns {Promise<Object>} Paginated data and metadata.
   */
  static async findWithPagination({ page = 1, limit = 10, searchTerm = '' }) {
    const offset = (page - 1) * limit;
    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    if (searchTerm) {
      whereClause = `WHERE (e.name ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex + 1} OR c.name ILIKE $${paramIndex + 2})`;
      params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
      paramIndex += 3;
    }

    // Count total items
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ebooks e
      LEFT JOIN categories c ON e.category_id = c.category_id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated items
    const dataQuery = `
      SELECT e.*, c.name as category_name 
      FROM ebooks e
      LEFT JOIN categories c ON e.category_id = c.category_id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(dataQuery, dataParams);

    const totalPages = Math.ceil(total / limit);
    
    return {
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    };
  }

  /**
   * Find ebooks by condition (e.g., "new", "used", etc.).
   * @param {number} condition_id - The condition ID.
   * @returns {Promise<Array>} List of ebooks that match the condition.
   */
  static async findByCondition(condition_id) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM ebooks WHERE condition_id = $1 ORDER BY created_at DESC`,
        [condition_id]
      );
      return rows || []; // Always return an array
    } catch (err) {
      console.error('Error in findByCondition:', err);
      return []; // Return empty array if query fails
    }
  }
}
