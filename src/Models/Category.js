import { pool } from '../../Config/ConnectionToBd.js';

/**
 * Category Model
 * Handles database operations for the 'categories' table.
 */
export class Category {
  /**
   * Create a new category.
   * @param {Object} data - The category data.
   * @param {string} data.name - The name of the category.
   * @param {string} data.description - The description of the category.
   * @returns {Promise<Object>} The newly created category.
   */
  static async create({ name, description }) {
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *`;
    const result = await pool.query(query, [name, description]);
    return result.rows[0];
  }

  /**
   * Retrieve all categories.
   * @returns {Promise<Array>} A list of all categories ordered by ID.
   */
  static async findAll() {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
    return result.rows;
  }

  /**
   * Find a category by its ID.
   * @param {number} id - The ID of the category.
   * @returns {Promise<Object|null>} The category object or null if not found.
   */
  static async findById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * Update a category by its ID.
   * Supports partial updates (only the provided fields will be updated).
   * @param {number} id - The ID of the category to update.
   * @param {Object} data - The new values for the category.
   * @param {string} [data.name] - The updated category name.
   * @param {string} [data.description] - The updated category description.
   * @returns {Promise<Object|null>} The updated category or null if no fields were provided.
   */
  static async update(id, { name, description }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE categories SET ${fields.join(', ')}
      WHERE category_id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete a category by its ID.
   * @param {number} id - The ID of the category to delete.
   * @returns {Promise<Object|null>} The deleted category or null if not found.
   */
  static async delete(id) {
    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}
