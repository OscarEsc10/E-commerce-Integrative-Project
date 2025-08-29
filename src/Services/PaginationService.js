import { pool } from '../../Config/ConnectionToBd.js';

export class PaginationService {
  /**
   * Generic pagination service for any table
   * @param {Object} options - Pagination options
   * @param {string} options.table - Table name
   * @param {number} options.page - Current page (1-based)
   * @param {number} options.limit - Items per page
   * @param {string} options.searchTerm - Search term (optional)
   * @param {Array} options.searchFields - Fields to search in
   * @param {string} options.orderBy - Order by field
   * @param {string} options.orderDirection - ASC or DESC
   * @param {string} options.joinClause - SQL JOIN clause (optional)
   * @param {string} options.selectFields - Custom SELECT fields
   */
  static async paginate(options) {
    const {
      table,
      page = 1,
      limit = 10,
      searchTerm = '',
      searchFields = [],
      orderBy = 'created_at',
      orderDirection = 'DESC',
      joinClause = '',
      selectFields = '*'
    } = options;

    const offset = (page - 1) * limit;
    
    // Build search condition
    let searchCondition = '';
    let searchParams = [];
    let paramIndex = 1;

    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields.map(field => {
        searchParams.push(`%${searchTerm}%`);
        return `${field} ILIKE $${paramIndex++}`;
      });
      searchCondition = `WHERE (${searchConditions.join(' OR ')})`;
    }

    // Count total items
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${table} ${joinClause}
      ${searchCondition}
    `;
    
    const countResult = await pool.query(countQuery, searchParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated items
    const dataQuery = `
      SELECT ${selectFields}
      FROM ${table} ${joinClause}
      ${searchCondition}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...searchParams, limit, offset];
    const dataResult = await pool.query(dataQuery, dataParams);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    };
  }

  /**
   * Specific pagination for ebooks with category join
   */
  static async paginateEbooks({ page = 1, limit = 10, searchTerm = '', category = '' }) {
    const options = {
      table: 'ebooks e',
      page,
      limit,
      searchTerm,
      searchFields: ['e.name', 'e.description', 'c.name'],
      orderBy: 'e.created_at',
      orderDirection: 'DESC',
      joinClause: 'LEFT JOIN categories c ON e.category_id = c.category_id',
      selectFields: 'e.*, c.name as category_name'
    };

    // Add category filter if provided
    if (category) {
      const categoryCondition = `e.category_id = $${options.searchTerm ? options.searchFields.length + 1 : 1}`;
      
      if (options.searchTerm) {
        // If there's already a search condition, add category with AND
        options.whereClause = `WHERE (${options.searchFields.map((field, index) => `${field} ILIKE $${index + 1}`).join(' OR ')}) AND ${categoryCondition}`;
        options.additionalParams = [category];
      } else {
        // If no search term, just filter by category
        options.whereClause = `WHERE ${categoryCondition}`;
        options.additionalParams = [category];
      }
    }

    return this.paginateWithCustomWhere(options);
  }

  /**
   * Pagination with custom WHERE clause
   */
  static async paginateWithCustomWhere(options) {
    const {
      table,
      page = 1,
      limit = 10,
      searchTerm = '',
      searchFields = [],
      orderBy = 'created_at',
      orderDirection = 'DESC',
      joinClause = '',
      selectFields = '*',
      whereClause = '',
      additionalParams = []
    } = options;

    const offset = (page - 1) * limit;
    
    // Build search condition or use custom where clause
    let searchCondition = whereClause;
    let searchParams = [];
    let paramIndex = 1;

    if (!whereClause && searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields.map(field => {
        searchParams.push(`%${searchTerm}%`);
        return `${field} ILIKE $${paramIndex++}`;
      });
      searchCondition = `WHERE (${searchConditions.join(' OR ')})`;
    } else if (whereClause) {
      // Use custom where clause with search params and additional params
      if (searchTerm && searchFields.length > 0) {
        searchParams = searchFields.map(() => `%${searchTerm}%`);
        paramIndex = searchParams.length + 1;
      }
      searchParams = [...searchParams, ...additionalParams];
      paramIndex = searchParams.length + 1;
    }

    // Count total items
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${table} ${joinClause}
      ${searchCondition}
    `;
    
    const countResult = await pool.query(countQuery, searchParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated items
    const dataQuery = `
      SELECT ${selectFields}
      FROM ${table} ${joinClause}
      ${searchCondition}
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataParams = [...searchParams, limit, offset];
    const dataResult = await pool.query(dataQuery, dataParams);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: dataResult.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    };
  }

  /**
   * Specific pagination for categories
   */
  static async paginateCategories({ page = 1, limit = 10, searchTerm = '' }) {
    return this.paginate({
      table: 'categories',
      page,
      limit,
      searchTerm,
      searchFields: ['name', 'description'],
      orderBy: 'name',
      orderDirection: 'ASC'
    });
  }
}
