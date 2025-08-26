// src/Models/User.js
// User model for database operations
import bcrypt from 'bcryptjs';
import { pool } from '../../Config/ConnectionToBd.js';

export class User {
  /**
   * Create a new user in the database
   */
  static async create({ name, email, password, phone, role_id = 3 }) {
    try {
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO users (name, email, password_hash, phone, role_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, name, email, phone, role_id, created_at
      `;
      
      const values = [name, email, passwordHash, phone, role_id];
      const result = await pool.query(query, values);
      
      return {
        success: true,
        user: result.rows[0]
      };
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return {
          success: false,
          message: 'Email already exists'
        };
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const query =` 
    SELECT u.*, r.codename as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.email = $1 
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(userId) {
    const query = `
    SELECT u.*, r.codename as role_name
    FROM users u
    JOIN roles r on U.role_id = r.role_id
    WHERE u.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Verify user password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user information
   */
  static async update(userId, updateData) {
    const allowedFields = ['name', 'phone'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return { success: false, message: 'No valid fields to update' };
    }

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $${paramCount}
      RETURNING user_id, name, email, phone, role_id, created_at
    `;

    const result = await pool.query(query, values);
    return {
      success: true,
      user: result.rows[0]
    };
  }

  /**
   * Change user password
   */
  static async changePassword(userId, newPassword) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const query = 'UPDATE users SET password_hash = $1 WHERE user_id = $2';
    await pool.query(query, [passwordHash, userId]);
    
    return { success: true, message: 'Password updated successfully' };
  }
  
  static async findAll() {
    const query = `
    SELECT u.user_id, u.name, u.email, u.phone, r.name as role, u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    ORDER BY u.user_id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async delete(userId) {
      try {
        const result = await pool.query(
          "DELETE FROM users WHERE user_id = $1",[userId]);

      if (!result.rowCount) {
      return { success: false, message: "User not found" };
      }

      return { success: true };
      } catch (error) {
      return { success: false, message: error.message };
    }
  }

}