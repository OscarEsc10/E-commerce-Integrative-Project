// Models/Address.js
import { pool } from '../../Config/ConnectionToBd.js';

export class Address {
  // Obtener todas las direcciones de un usuario
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

  // Crear una nueva dirección
  static async create({ user_id, street, city, state, postal_code, country, is_default = false }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Si la nueva dirección es default, quitar default de otras
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
      console.error('Error creando dirección:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar dirección existente
  static async update(address_id, user_id, data) {
    const fields = [];
    const values = [];
    let i = 1;

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

  // Eliminar dirección
  static async delete(address_id, user_id) {
    const query = `
      DELETE FROM addresses
      WHERE address_id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [address_id, user_id]);
    return rows[0];
  }

  // Obtener dirección por id
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
