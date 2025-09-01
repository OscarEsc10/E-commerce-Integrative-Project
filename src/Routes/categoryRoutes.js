// src/Routes/categoryRoutes.js
// Express routes for managing ebook categories
// Some routes are public, others require admin authentication

import { Router } from 'express';
import { CategoryController } from '../Controllers/CategoryController.js';
import { authenticateToken, requireRole } from '../Middleware/auth.js';

const router = Router();

/**
 * GET / - Retrieve all categories (public)
 * GET /:id - Retrieve a category by ID (public)
 * POST / - Create a new category (admin only)
 * PUT /:id - Update a category by ID (admin only)
 * DELETE /:id - Delete a category by ID (admin only)
 * Admin routes require a valid JWT token and admin role
 */
// Public routes
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Admin-only routes
router.use(authenticateToken, requireRole(['admin']));
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
