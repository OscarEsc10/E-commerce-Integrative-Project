// src/Models/User.js
// User model for database operations
import bcrypt from 'bcryptjs';
import { pool } from '../../Config/ConnectionToBd.js';

export class User {
  /**
   * Create a new user in the database.
   * @param {Object} userData - User information.
   * @param {string} userData.name - User's name.
   * @param {string} userData.email - User's email (must be unique).
   * @param {string} userData.password - User's raw password.
   * @param {string} userData.phone - User's phone number.
   * @param {number} [userData.role_id=3] - Role ID (default = 3 = standard user).
   * @returns {Promise<{success: boolean, user?: Object, message?: string}>}
   */
  static async create({ name, email, password, phone, role_id = 3 }) {
    try {
      // 🔹 Hash password before storing
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
      // 23505 = unique violation (email already exists)
      if (error.code === '23505') {
        return {
          success: false,
          message: 'Email already exists'
        };
      }
      throw error;
    }
  }

  /**
   * Find a user by email.
   * @param {string} email - User's email.
   * @returns {Promise<Object|null>} User with role name, or null if not found.
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
   * Find a user by ID.
   * @param {number} userId - User's ID.
   * @returns {Promise<Object|null>} User with role name, or null if not found.
   */
  static async findById(userId) {
    const query = `
      SELECT u.*, r.codename as role_name
      FROM users u
      JOIN roles r on u.role_id = r.role_id
      WHERE u.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Verify a user's password.
   * @param {string} plainPassword - Plain text password.
   * @param {string} hashedPassword - Hashed password stored in the DB.
   * @returns {Promise<boolean>} True if passwords match, false otherwise.
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user information (only `name` and `phone` allowed).
   * @param {number} userId - User's ID.
   * @param {Object} updateData - Fields to update.
   * @returns {Promise<{success: boolean, user?: Object, message?: string}>}
   */
  static async update(userId, updateData) {
    const allowedFields = ['name', 'phone'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query for allowed fields
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
   * Change user's password.
   * @param {number} userId - User's ID.
   * @param {string} newPassword - New raw password.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async changePassword(userId, newPassword) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const query = 'UPDATE users SET password_hash = $1 WHERE user_id = $2';
    await pool.query(query, [passwordHash, userId]);
    
    return { success: true, message: 'Password updated successfully' };
  }

  /**
   * Fetch all users with role information.
   * @returns {Promise<Array>} List of users.
   */
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

  /**
   * Delete a user by ID.
   * @param {number} userId - User's ID.
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  static async delete(userId) {
    try {
      const result = await pool.query(
        "DELETE FROM users WHERE user_id = $1", [userId]
      );

      if (!result.rowCount) {
        return { success: false, message: "User not found" };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
