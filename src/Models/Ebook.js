import { pool } from '../../Config/ConnectionToBd.js';

export class Ebook {
  static async create({ name, category_id, description, price, stock = 0 }) {
    const query = `
      INSERT INTO ebooks (name, category_id, description, price, stock, creator_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [name, category_id, description, price, stock, req.user.user_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(`
      SELECT e.*, c.name as category_name 
      FROM ebooks e
      LEFT JOIN categories c ON e.category_id = c.category_id
      ORDER BY ebook_id ASC
    `);
    return result.rows;
  }

  static async findById(ebook_id) {
    const result = await pool.query(`
      SELECT e.*, c.name as category_name 
      FROM ebooks e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE ebook_id = $1
    `, [ebook_id]);
    return result.rows[0] || null;
  }

  static async update(ebook_id, { name, category_id, description, price, stock }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if(name) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if(category_id !== undefined) { fields.push(`category_id = $${paramIndex++}`); values.push(category_id); }
    if(description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if(price !== undefined) { fields.push(`price = $${paramIndex++}`); values.push(price); }
    if(stock !== undefined) { fields.push(`stock = $${paramIndex++}`); values.push(stock); }

    if(fields.length === 0) return null;

    values.push(ebook_id);
    const query = `
      UPDATE ebooks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE ebook_id = $${paramIndex}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(ebook_id) {
    const result = await pool.query('DELETE FROM ebooks WHERE ebook_id = $1 RETURNING *', [ebook_id]);
    return result.rows[0] || null;
  }

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

  static async findByCondition(condition_id) {
    try {
    const { rows } = await pool.query(
      `SELECT * FROM ebooks WHERE condition_id = $1 ORDER BY created_at DESC`,
      [condition_id]
    );
    return rows || []; // Devuelve siempre un array
    } catch (err) {
    console.error('Error en findByCondition:', err);
    return []; // Retorna array vacío si falla
   }
  }
}
