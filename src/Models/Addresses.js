// Models/Address.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Address {
  /**
   * Get all addresses of a specific user.
   * Orders results so that the default address (is_default = true) comes first.
   */
  static async findByUserId(user_id) {
    const query = `
      SELECT *
      FROM addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, address_id ASC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  /**
   * Create a new address for a user.
   * - If `is_default = true`, it will remove the default status from other addresses.
   * - Wraps queries in a transaction to ensure consistency.
   */
  static async create({ user_id, street, city, state, postal_code, country, is_default = false }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If this new address is marked as default, reset other addresses
      if (is_default) {
        await client.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [user_id]
        );
      }

      const query = `
        INSERT INTO addresses (user_id, street, city, state, postal_code, country, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const { rows } = await client.query(query, [
        user_id,
        street,
        city,
        state,
        postal_code,
        country,
        is_default,
      ]);

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating address:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing address.
   * - Dynamically builds the SQL query based on provided fields in `data`.
   * - Ensures the update belongs to the correct user.
   */
  static async update(address_id, user_id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    // Build dynamic query
    for (const key in data) {
      fields.push(`${key} = $${i}`);
      values.push(data[key]);
      i++;
    }
    values.push(address_id, user_id);

    const query = `
      UPDATE addresses
      SET ${fields.join(', ')}
      WHERE address_id = $${i} AND user_id = $${i + 1}
      RETURNING *
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  /**
   * Delete an address by ID for a specific user.
   * Returns the deleted record if successful.
   */
  static async delete(address_id, user_id) {
    const query = `
      DELETE FROM addresses
      WHERE address_id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [address_id, user_id]);
    return rows[0];
  }

  /**
   * Find a specific address by ID and user ID.
   * Useful to verify ownership of the address.
   */
  static async findById(address_id, user_id) {
    const query = `
      SELECT *
      FROM addresses
      WHERE address_id = $1 AND user_id = $2
    `;
    const { rows } = await pool.query(query, [address_id, user_id]);
    return rows[0];
  }
}
