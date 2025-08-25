// src/Middleware/auth.js
// Authentication middleware for JWT token verification
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../Config/config.js';
import { pool } from '../../Config/ConnectionToBd.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const userQuery = `
      SELECT u.user_id, u.name, u.email, u.phone, u.role_id, r.name AS role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1
    `;
    const userResult = await pool.query(userQuery, [decoded.user_id]); // 👈 CORREGIDO

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Attach user info to request object
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * Roles can be compared by role_id (number) or role_name (string)
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRoleId = req.user.role_id;
    const userRoleName = req.user.role_name?.toLowerCase();

    const hasPermission = roles.some(
      role => role === userRoleId || role.toLowerCase?.() === userRoleName
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};
