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
}
