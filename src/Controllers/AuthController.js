// src/Controllers/AuthController.js
// Authentication controller handling login, register, and user management
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../Models/User.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../Config/config.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

export class AuthController {
  /**
   * Generate JWT token for user
   */
  static generateToken(user) {
    return jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role_id: user.role_id,
        role: user.role_name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, password, phone, role_id } = req.body;

      //Define default role: "CUSTOMER" (3)

      const assignedRoleId = role_id || 3;

      // Create user
      const result = await User.create({
        name,
        email,
        password,
        phone,
        role_id: assignedRoleId,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      // Generate token
      const token = AuthController.generateToken(result.user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.user.user_id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            role_id: result.user.role_id,
            createdAt: result.user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = AuthController.generateToken(user);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role_id: user.role_id,
            role: user.role_name,
            createdAt: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.user_id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role_id: user.role_id,
            role: user.role_name,
            createdAt: user.created_at
          },
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, phone } = req.body;
      const result = await User.update(req.user.user_id, { name, phone });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: result.user.user_id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            role_id: result.user.role_id,
            role: result.user.role_name,
            createdAt: result.user.created_at
          },
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get current user with password
      const user = await User.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await User.changePassword(req.user.user_id, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
