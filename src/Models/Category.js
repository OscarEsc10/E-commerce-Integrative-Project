import { pool } from '../../Config/ConnectionToBd.js';

export class Category {
  static async create({ name, description }) {
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *`;
    const result = await pool.query(query, [name, description]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id, { name, description }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if(name) { fields.push(`name = $${idx++}`); values.push(name); }
    if(description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }

    if(fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE categories SET ${fields.join(', ')}
      WHERE category_id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
